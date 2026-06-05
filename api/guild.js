function assetExt(hash) {
  return hash && hash.startsWith('a_') ? 'gif' : 'png';
}

/** URLs do CDN (media primeiro — carrega melhor fora do Discord) */
function discordAssetUrls(kind, guildId, hash, size) {
  if (!hash || !guildId) return [];
  const ext = assetExt(hash);
  const folder = kind === 'icon' ? 'icons' : kind === 'banner' ? 'banners' : 'splashes';
  const hosts = ['https://media.discordapp.net', 'https://cdn.discordapp.com'];
  const urls = [];
  for (const host of hosts) {
    urls.push(`${host}/${folder}/${guildId}/${hash}.${ext}?size=${size}`);
    if (ext === 'gif') {
      urls.push(`${host}/${folder}/${guildId}/${hash}.png?size=${size}`);
    }
  }
  return [...new Set(urls)];
}

function guildIconUrl(guildId, iconHash) {
  const urls = discordAssetUrls('icon', guildId, iconHash, 128);
  return urls[0] || '';
}

/** Só banner oficial do servidor (splash é imagem do convite, não usar aqui) */
function bannerUrls(guildId, guild) {
  if (!guild.banner) return [];
  return discordAssetUrls('banner', guildId, guild.banner, 600);
}

function inviteUrlFromCode(code) {
  if (!code) return '';
  const clean = String(code)
    .replace(/^https?:\/\/(www\.)?discord\.(gg|com\/invite)\//i, '')
    .split('?')[0];
  return clean ? `https://discord.gg/${clean}` : '';
}

function isComplete(data) {
  return !!(
    data &&
    data.name &&
    typeof data.members === 'number' &&
    data.members > 0
  );
}

function packFromInvite(id, inv) {
  if (!inv?.guild || String(inv.guild.id) !== String(id)) return null;
  const g = inv.guild;
  const iconHash = g.icon || inv.profile?.icon_hash || '';
  const bannerList = bannerUrls(id, g);
  const data = {
    available: true,
    name: g.name || '',
    members: inv.approximate_member_count ?? inv.profile?.member_count ?? 0,
    online: inv.approximate_presence_count ?? inv.profile?.online_count ?? 0,
    desc: g.description || inv.profile?.description || '',
    iconHash,
    iconUrl: guildIconUrl(id, iconHash),
    iconUrls: discordAssetUrls('icon', id, iconHash, 128),
    bannerUrl: bannerList[0] || '',
    bannerUrls: bannerList,
    inviteUrl: inviteUrlFromCode(inv.code) || inviteUrlFromCode(g.vanity_url_code),
  };
  return isComplete(data) ? data : null;
}

async function fetchInvite(code) {
  const clean = String(code || '')
    .replace(/^https?:\/\/(www\.)?discord\.(gg|com\/invite)\//i, '')
    .split('?')[0];
  if (!clean) return null;
  const res = await fetch(
    `https://discord.com/api/v9/invites/${encodeURIComponent(clean)}?with_counts=true&with_expiration=true`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) return null;
  return res.json();
}

function tagVanityCandidates(tag) {
  const raw = String(tag || '').trim();
  if (!raw) return [];
  const out = [];
  const lower = raw.toLowerCase();
  const alnum = raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  // Tag só com emoji/símbolos — vanity por texto não funciona (ex.: HIT com caractere especial)
  if (alnum.length >= 2) out.push(alnum);
  if (lower.length >= 2 && /^[\x20-\x7e]+$/.test(lower) && !out.includes(lower)) out.push(lower);
  return [...new Set(out)];
}

async function tryInviteCodes(id, codes) {
  for (const code of codes) {
    const inv = await fetchInvite(code);
    const data = packFromInvite(id, inv);
    if (data) return data;
  }
  return null;
}

async function fromWidget(id) {
  const res = await fetch(`https://discord.com/api/guilds/${id}/widget.json`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const widget = await res.json();
  if (!widget) return null;

  if (widget.instant_invite) {
    const code = widget.instant_invite.split('/').pop().split('?')[0];
    const data = packFromInvite(id, await fetchInvite(code));
    if (data) return data;
  }

  return null;
}

const GUILD_INVITES = {
  '1161745657976062042': 'pureza',
  '777657136137764874': 'cdl',
  '1369418194225463358': 'naoi',
  '1354231596433150093': 'VxC3eaeQ',
  '1457120317234479280': 'h4ck',
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = req.query.id;
  const tag = req.query.tag || '';
  const manualInvite = req.query.invite || GUILD_INVITES[String(id)] || '';

  if (!id || !/^\d{17,20}$/.test(String(id))) {
    return res.status(400).json({ available: false, error: 'invalid guild id' });
  }

  try {
    let data = await fromWidget(id);

    if (!data && manualInvite) {
      const inv = await fetchInvite(manualInvite);
      data = packFromInvite(id, inv);
    }

    if (!data) {
      const codes = tagVanityCandidates(tag);
      data = await tryInviteCodes(id, codes);
    }

    if (!data) {
      return res.status(200).json({ available: false });
    }

    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ available: false });
  }
}

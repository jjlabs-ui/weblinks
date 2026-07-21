function assetExt(hash) {
  return hash && hash.startsWith('a_') ? 'gif' : 'png';
}

function discordAssetUrls(kind, guildId, hash, size) {
  if (!hash || !guildId) return [];
  const ext = assetExt(hash);
  const folder = kind === 'icon' ? 'icons' : kind === 'banner' ? 'banners' : 'splashes';
  const hosts = ['https://media.discordapp.net', 'https://cdn.discordapp.com'];
  const urls = [];
  for (const host of hosts) {
    urls.push(`${host}/${folder}/${guildId}/${hash}.${ext}?size=${size}`);
    if (ext === 'gif') urls.push(`${host}/${folder}/${guildId}/${hash}.png?size=${size}`);
  }
  return [...new Set(urls)];
}

function guildIconUrl(guildId, iconHash) {
  return discordAssetUrls('icon', guildId, iconHash, 128)[0] || '';
}

function bannerUrls(guildId, guild) {
  if (!guild) return [];
  if (guild.banner) return discordAssetUrls('banner', guildId, guild.banner, 600);
  if (guild.splash) return discordAssetUrls('splash', guildId, guild.splash, 600);
  return [];
}

function inviteUrlFromCode(code) {
  const clean = cleanInviteCode(code);
  return clean ? `https://discord.gg/${clean}` : '';
}

function cleanInviteCode(code) {
  if (!code) return '';
  return String(code)
    .replace(/^https?:\/\/(www\.)?discord\.(gg|com\/invite)\//i, '')
    .split('?')[0]
    .trim();
}

function isComplete(data) {
  return !!(data && data.name && typeof data.members === 'number' && data.members > 0);
}

function packFromInvite(id, inv) {
  if (!inv?.guild || String(inv.guild.id) !== String(id)) return null;
  const g = inv.guild;
  const iconHash = g.icon || inv.profile?.icon_hash || '';
  const bannerList = bannerUrls(id, g);
  const inviteCode = cleanInviteCode(inv.code) || cleanInviteCode(g.vanity_url_code);
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
    inviteUrl: inviteUrlFromCode(inviteCode),
    inviteCode: inviteCode || '',
  };
  return isComplete(data) ? data : null;
}

async function fetchInvite(code) {
  const clean = cleanInviteCode(code);
  if (!clean) return null;
  const res = await fetch(
    `https://discord.com/api/v9/invites/${encodeURIComponent(clean)}?with_counts=true&with_expiration=true`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) return null;
  return res.json();
}

function tagInviteCandidates(tag) {
  const raw = String(tag || '').trim();
  if (!raw) return [];
  const out = [];
  const add = (value) => {
    const c = cleanInviteCode(value).toLowerCase();
    if (c.length >= 2 && c.length <= 32 && !out.includes(c)) out.push(c);
  };
  const hashTags = raw.match(/#([^\s#]{2,32})/g);
  if (hashTags) hashTags.forEach((h) => add(h.slice(1)));
  raw.split('/').slice(1).forEach((segment) => {
    segment.split(/[\s|︵♡•·]+/).forEach((tok) => add(tok));
  });
  raw.split(/[\s/|︵♡#•·]+/).forEach((tok) => {
    if (/^[a-zA-Z0-9_]{2,32}$/.test(tok)) add(tok);
  });
  const alnum = raw.replace(/[^a-zA-Z0-9]/g, '');
  if (alnum.length >= 2) add(alnum);
  return out;
}

async function fromWidget(id) {
  const res = await fetch(`https://discord.com/api/guilds/${id}/widget.json`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const widget = await res.json();
  if (!widget?.instant_invite) return null;
  const code = widget.instant_invite.split('/').pop().split('?')[0];
  return packFromInvite(id, await fetchInvite(code));
}

function mergeEnvInvites() {
  const map = {};
  try {
    if (process.env.GUILD_INVITES_JSON) {
      Object.assign(map, JSON.parse(process.env.GUILD_INVITES_JSON));
    }
  } catch {
    /* ignore */
  }
  return map;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=90, stale-while-revalidate=180');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = req.query.id;
  const tag = req.query.tag || '';
  const invites = mergeEnvInvites();
  const cachedInvite = cleanInviteCode(req.query.invite || '');
  const manualInvite = cachedInvite || invites[String(id)] || '';

  if (!id || !/^\d{17,20}$/.test(String(id))) {
    return res.status(400).json({ available: false, error: 'invalid guild id' });
  }

  try {
    const tried = new Set();
    const tryCode = async (code) => {
      const c = cleanInviteCode(code);
      if (!c || tried.has(c)) return null;
      tried.add(c);
      return packFromInvite(id, await fetchInvite(c));
    };

    let data = await fromWidget(id);

    if (!data && manualInvite) data = await tryCode(manualInvite);

    if (!data) {
      for (const code of tagInviteCandidates(tag)) {
        data = await tryCode(code);
        if (data) break;
      }
    }

    if (!data) return res.status(200).json({ available: false });
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ available: false });
  }
}

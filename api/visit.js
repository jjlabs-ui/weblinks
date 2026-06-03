// Mapa de código de país para bandeira emoji
function countryFlag(code) {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 - 65 + c.charCodeAt(0))
  );
}

// Conta acessos por IP usando KV simples em memória (por instância serverless)
// Para persistência real, usaria um banco. Aqui fazemos via campo no embed.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return res.status(200).json({ ok: true, skipped: 'DISCORD_WEBHOOK_URL not set' })
  }

  try {
    const { ua, lang, ref, utm_source, w, h } = req.body || {}

    // IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      'unknown'

    // Bloqueia bots
    const userAgent = ua || req.headers['user-agent'] || ''
    if (/bot|crawler|spider|headless/i.test(userAgent)) {
      return res.status(200).json({ ok: true })
    }

    // Geo
    let geo = {}
    try {
      const r = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName,isp,proxy,hosting`)
      const d = await r.json()
      if (d.status === 'success') geo = d
    } catch (_) {}

    // Dispositivo
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
    let browser = 'Unknown'
    if (/edg\//i.test(userAgent))       browser = 'Edge'
    else if (/opr\//i.test(userAgent))  browser = 'Opera'
    else if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/safari/i.test(userAgent)) browser = 'Safari'

    let os = 'Unknown'
    if (/windows nt 10/i.test(userAgent))  os = 'Windows 10/11'
    else if (/windows/i.test(userAgent))   os = 'Windows'
    else if (/android/i.test(userAgent))   os = 'Android'
    else if (/iphone/i.test(userAgent))    os = 'iPhone'
    else if (/ipad/i.test(userAgent))      os = 'iPad'
    else if (/mac os x/i.test(userAgent))  os = 'macOS'
    else if (/linux/i.test(userAgent))     os = 'Linux'

    // Origem
    const SOURCE_MAP = {
      discord: 'Discord', instagram: 'Instagram', twitter: 'Twitter',
      x: 'Twitter/X', tiktok: 'TikTok', youtube: 'YouTube',
      twitch: 'Twitch', google: 'Google', whatsapp: 'WhatsApp',
      telegram: 'Telegram', github: 'GitHub',
    }
    let source = 'Direto'
    if (utm_source) {
      source = SOURCE_MAP[utm_source.toLowerCase()] || utm_source
    } else if (ref) {
      try {
        const host = new URL(ref).hostname.toLowerCase()
        for (const [k, v] of Object.entries(SOURCE_MAP)) {
          if (host.includes(k)) { source = v; break }
        }
        if (source === 'Direto') source = host
      } catch (_) {}
    }

    // Hora BRT
    const now = new Date()
    const brt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(now)

    const flag = countryFlag(geo.countryCode)
    const isBrazil = geo.countryCode === 'BR'
    const location = geo.city
      ? `${flag} ${geo.city}, ${geo.regionName} — ${geo.country}`
      : `${flag} ${geo.country || 'Desconhecido'}`

    const embed = {
      title: `${flag} Nova visita — jjxvnz.bio`,
      color: isBrazil ? 0x009c3b : 0x1a1a2e,
      description: [
        `\`${ip}\`  ·  ${brt}`,
        location,
        geo.proxy ? '⚠️ VPN/Proxy' : null,
        geo.hosting ? '⚠️ Datacenter' : null,
      ].filter(Boolean).join('\n'),
      timestamp: now.toISOString(),
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

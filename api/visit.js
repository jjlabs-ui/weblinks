function countryFlag(code) {
  if (!code || code.length !== 2) return '🌍'
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 - 65 + c.charCodeAt(0))
  )
}

async function fetchGeo(ip) {
  if (!ip || ip === 'unknown') return {}
  try {
    const r = await fetch(`https://ipwho.is/${ip}`)
    const d = await r.json()
    if (d.success) {
      return {
        country: d.country,
        countryCode: d.country_code,
        city: d.city,
        regionName: d.region,
        isp: d.connection?.isp,
        proxy: d.security?.vpn,
        hosting: d.security?.hosting,
      }
    }
  } catch (_) {}
  try {
    const r = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName,isp,proxy,hosting`
    )
    const d = await r.json()
    if (d.status === 'success') return d
  } catch (_) {}
  return {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const webhookUrl =
    process.env.DISCORD_WEBHOOK_URL ||
    'https://discord.com/api/webhooks/1511686757219831879/xp7HsTj0kzSontdURNLQuU16XsvrSIAbhaFBf9t50ANcO7LBt7S4FhMfepdhOotOZ34O'

  try {
    const { ua, lang, ref, utm_source, w, h } = req.body || {}

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      'unknown'

    const userAgent = ua || req.headers['user-agent'] || ''
    if (/bot|crawler|spider|headless/i.test(userAgent)) {
      return res.status(200).json({ ok: true, skipped: 'bot' })
    }

    const geo = await fetchGeo(ip)

    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
    let browser = 'Unknown'
    if (/edg\//i.test(userAgent)) browser = 'Edge'
    else if (/opr\//i.test(userAgent)) browser = 'Opera'
    else if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/safari/i.test(userAgent)) browser = 'Safari'

    let os = 'Unknown'
    if (/windows nt 10/i.test(userAgent)) os = 'Windows 10/11'
    else if (/windows/i.test(userAgent)) os = 'Windows'
    else if (/android/i.test(userAgent)) os = 'Android'
    else if (/iphone/i.test(userAgent)) os = 'iPhone'
    else if (/ipad/i.test(userAgent)) os = 'iPad'
    else if (/mac os x/i.test(userAgent)) os = 'macOS'
    else if (/linux/i.test(userAgent)) os = 'Linux'

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

    const flags = []
    if (geo.proxy) flags.push('VPN/Proxy')
    if (geo.hosting) flags.push('Datacenter')

    const embed = {
      title: `${flag} Nova visita — jjxvnz.bio`,
      color: isBrazil ? 0x009c3b : 0x1a1a2e,
      description: [
        `\`${ip}\`  ·  ${brt}`,
        location,
        geo.isp ? `${geo.isp}` : null,
        flags.length ? `⚠️ ${flags.join(' · ')}` : null,
      ].filter(Boolean).join('\n'),
      fields: [
        {
          name: 'Dispositivo',
          value: `${isMobile ? '📱' : '🖥️'} ${browser} · ${os}${w && h ? `\n${w}×${h}` : ''}`,
          inline: true,
        },
        { name: 'Origem', value: source, inline: true },
        { name: 'Idioma', value: lang || '?', inline: true },
      ],
      footer: { text: `IP: ${ip}` },
      timestamp: now.toISOString(),
    }

    const wh = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    if (!wh.ok) {
      console.error('Discord webhook failed', wh.status, await wh.text())
      return res.status(502).json({ ok: false, error: 'webhook failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

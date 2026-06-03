function countryFlag(code) {
  if (!code || code.length !== 2) return '🗺️'
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
      }
    }
  } catch (_) {}
  try {
    const r = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName`
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
    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { body = {} }
    }
    const { ua } = body || {}

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      'unknown'

    const userAgent = ua || req.headers['user-agent'] || ''
    if (/bot|crawler|spider|headless/i.test(userAgent)) {
      return res.status(200).json({ ok: true, skipped: 'bot' })
    }

    const geo = await fetchGeo(ip)
    const flag = countryFlag(geo.countryCode)

    const location = geo.city
      ? `${flag} ${geo.city}, ${geo.regionName} — ${geo.country}`
      : `${flag} ${geo.country || 'Desconhecido'}`

    const now = new Date()
    const brt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit', minute: '2-digit',
    }).format(now)

    const embed = {
      title: '🔔 Nova visita · jjxvnz.bio',
      color: 0x000000,
      fields: [
        { name: '🌐 IP', value: `\`${ip}\``, inline: false },
        { name: '📍 Localização', value: location, inline: false },
      ],
      footer: { text: `🕐 Hoje às ${brt}` },
      timestamp: now.toISOString(),
    }

    const wh = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    if (!wh.ok) {
      const errText = await wh.text().catch(() => '')
      console.error('Discord webhook failed', wh.status, errText)
      return res.status(502).json({ ok: false, error: 'webhook failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('visit handler error', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

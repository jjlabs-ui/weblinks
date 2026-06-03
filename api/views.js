const NS = 'jjxvnz-bio-v4'
const BASE = 3041

async function counterGet() {
  const res = await fetch(`https://api.counterapi.dev/v1/${NS}/hits`, { redirect: 'follow' })
  if (!res.ok) return null
  const data = await res.json()
  return typeof data.count === 'number' ? data.count : null
}

async function counterSet(n) {
  await fetch(`https://api.counterapi.dev/v1/${NS}/hits/set?count=${n}`, { redirect: 'follow' })
}

async function counterUp() {
  const res = await fetch(`https://api.counterapi.dev/v1/${NS}/hits/up`, { redirect: 'follow' })
  if (!res.ok) throw new Error('counter up failed')
  const data = await res.json()
  if (typeof data.count !== 'number') throw new Error('invalid count')
  return data.count
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let current = await counterGet()
    if (current === null || current < BASE) {
      await counterSet(BASE - 1)
    }
    const count = await counterUp()
    return res.status(200).json({ count })
  } catch {
    const fallback = await counterGet()
    return res.status(200).json({ count: fallback ?? BASE })
  }
}

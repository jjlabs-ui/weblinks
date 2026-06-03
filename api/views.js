const NS = 'jjxvnz-bio-v4'
const BASE = 3041

async function counterFetch(path) {
  const res = await fetch(`https://api.counterapi.dev/v1/${NS}/hits${path}`, {
    redirect: 'follow',
  })
  if (!res.ok) return null
  const data = await res.json()
  return typeof data.count === 'number' ? data.count : null
}

function noCacheHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('CDN-Cache-Control', 'no-store')
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
}

export default async function handler(req, res) {
  noCacheHeaders(res)

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const current = await counterFetch('')
    if (current === null || current < BASE) {
      await fetch(`https://api.counterapi.dev/v1/${NS}/hits/set?count=${BASE - 1}`, {
        redirect: 'follow',
      })
    }
    const count = await counterFetch('/up')
    if (count === null) throw new Error('increment failed')
    return res.status(200).json({ count })
  } catch {
    const fallback = await counterFetch('')
    return res.status(200).json({ count: fallback ?? BASE })
  }
}

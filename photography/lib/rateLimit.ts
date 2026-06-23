interface Record { count: number; resetAt: number }

const store = new Map<string, Record>()

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const rec = store.get(key)
  if (!rec || now > rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (rec.count >= maxRequests) return false
  rec.count++
  return true
}

// Prune expired entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store.entries()) {
    if (now > v.resetAt) store.delete(k)
  }
}, 10 * 60 * 1000)

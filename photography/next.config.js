const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  async rewrites() {
    // "fallback" rewrites only fire when Next.js can't find the file in public/.
    // This means: git-committed images are served statically (fast, no change).
    // Admin-uploaded images written to the Railway Volume are served by /api/img/.
    return {
      fallback: [
        { source: '/photos/:path*',    destination: '/api/img/photos/:path*' },
        { source: '/fine-art/:path*',  destination: '/api/img/fine-art/:path*' },
        { source: '/stickers/:path*',  destination: '/api/img/stickers/:path*' },
      ],
    }
  },
}

module.exports = nextConfig

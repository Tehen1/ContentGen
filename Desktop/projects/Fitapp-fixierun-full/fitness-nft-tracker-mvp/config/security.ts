import { NextApiRequest, NextApiResponse } from 'next'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

// Rate limiting configuration
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Security headers configuration
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  }
]

// Middleware to apply security headers
export function securityMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  // Apply Helmet
  helmet()(req, res, () => {
    // Apply custom security headers
    securityHeaders.forEach((header) => {
      res.setHeader(header.key, header.value)
    })
    next()
  })
}

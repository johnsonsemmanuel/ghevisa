import type { NextConfig } from "next";

function getApiOrigins(): string[] {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const origins = new Set<string>();

  try {
    const u = new URL(raw);
    origins.add(`${u.protocol}//${u.host}`);
  } catch {
    // ignore invalid env var; fall back to localhost
  }

  // Useful local fallbacks (avoid CSP issues when switching hosts/ports)
  origins.add("http://localhost:8000");
  origins.add("http://127.0.0.1:8000");

  return Array.from(origins);
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  trailingSlash: true,
  turbopack: {},
  
  // SECURITY FIX HIGH-03: Add security headers including CSP
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const apiOrigins = getApiOrigins();
    const connectSrc = [
      "'self'",
      ...apiOrigins,
      // Next dev server uses websockets in development
      ...(isDev ? ["ws://localhost:3000", "ws://127.0.0.1:3000"] : []),
    ].join(" ");

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: isDev ? '' : 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval for dev
              "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              `connect-src ${connectSrc}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              // In dev we frequently run on plain HTTP; upgrading breaks API calls.
              ...(isDev ? [] : ["upgrade-insecure-requests"]),
            ].join('; ')
          }
        ],
      },
    ];
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;

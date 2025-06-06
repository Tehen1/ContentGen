const withBundleAnalyzer = process.argv.includes("--analyze")
  ? require("@next/bundle-analyzer")({ enabled: true })
  : (config) => config

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",

  // Configurations d'images fusionnées
  images: {
    unoptimized: true, // Ajouté/Mis à jour
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // domains: ['blob.v0.dev'], // Commenté car remotePatterns est plus flexible, mais peut être décommenté si nécessaire
  },

  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["sharp"],
    optimizeCss: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Configuration ESLint ajoutée/mise à jour
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuration TypeScript ajoutée/mise à jour
  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer }) => {
    config.optimization.moduleIds = "deterministic"

    if (!isServer) {
      config.externals = {
        ...(config.externals || {}),
        // 'canvas': 'commonjs canvas',
      }
    }

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)

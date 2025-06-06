const withBundleAnalyzer = process.argv.includes("--analyze")
  ? require("@next/bundle-analyzer")({ enabled: true })
  : (config) => config

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",

  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["sharp"],
    optimizeCss: true, // Cette option nécessite 'critters'
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

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

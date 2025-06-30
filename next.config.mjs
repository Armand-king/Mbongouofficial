/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // ✅ Active le mode strict pour détecter les erreurs de rendu
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  largePageDataBytes: 1024 * 1024 * 250, // 250MB
}

module.exports = nextConfig

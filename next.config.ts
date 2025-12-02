import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  sw: "/sw.js",
})(nextConfig);

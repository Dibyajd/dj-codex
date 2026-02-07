import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["iconv-lite"] = path.resolve(process.cwd(), "lib/shims/iconv-lite.ts");
    return config;
  }
};

export default nextConfig;

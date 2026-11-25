import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许手机通过局域网访问开发服务器（仅影响 next dev）
  allowedDevOrigins: ["192.168.5.2"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

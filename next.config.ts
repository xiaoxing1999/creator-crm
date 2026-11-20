import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only the mock Hub entry points are routable on this prototype branch.
  pageExtensions: ["hub.tsx"],
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

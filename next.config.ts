import type { NextConfig } from "next";
import path from "path";

const isReviewaExport = process.env.REVIEWA_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isReviewaExport
    ? { output: "export" as const, trailingSlash: false }
    : {}),
  outputFileTracingRoot: path.join(__dirname),
  // Native module used by the durable instance store (server/state-store.ts);
  // must be required at runtime, not bundled.
  serverExternalPackages: ["better-sqlite3"],
  // The Studio (design side's v2 app) runs as its own process on :3011 with
  // basePath /studio; proxy that subpath to it so it's served from this domain
  // without merging its code into this app. Does not touch /api/* or our pages.
  async rewrites() {
    if (isReviewaExport) return [];
    return [
      { source: "/studio", destination: "http://localhost:3011/studio" },
      { source: "/studio/:path*", destination: "http://localhost:3011/studio/:path*" },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;

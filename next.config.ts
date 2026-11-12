import type { NextConfig } from "next";
import path from "path";

const isReviewaExport = process.env.REVIEWA_BUILD === "1";
// Optional: a local dev server can build into its own folder, so several can run from this
// checkout without overwriting each other (NEXT_DIST_DIR=.next-v2 npx next dev -p 3010).
// Each folder gets a tsconfig.next-*.json beside this file, so Next leaves tsconfig.json alone.
const distDir = process.env.NEXT_DIST_DIR;

const nextConfig: NextConfig = {
  ...(isReviewaExport
    ? { output: "export" as const, trailingSlash: false }
    : {}),
  ...(distDir
    ? { distDir, typescript: { tsconfigPath: `tsconfig.${distDir.replace(/^\./, "")}.json` } }
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
      // OAuth discovery (MCP Authorization). The well-known documents live at the
      // domain root; map them to their route handlers. The `/:path*` variants
      // cover RFC 9728's path-aware form, e.g. /.well-known/oauth-protected-resource/api/mcp.
      {
        source: "/.well-known/oauth-protected-resource",
        destination: "/api/oauth/protected-resource",
      },
      {
        source: "/.well-known/oauth-protected-resource/:path*",
        destination: "/api/oauth/protected-resource",
      },
      {
        source: "/.well-known/oauth-authorization-server",
        destination: "/api/oauth/authorization-server",
      },
      {
        source: "/.well-known/oauth-authorization-server/:path*",
        destination: "/api/oauth/authorization-server",
      },
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

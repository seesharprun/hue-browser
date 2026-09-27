import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // An unrelated lockfile above this repository confuses Turbopack's root detection.
  turbopack: { root: process.cwd() },
};

export default nextConfig;

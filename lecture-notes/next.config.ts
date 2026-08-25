import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundles a self-contained server into .next/standalone, which is what the
  // Dockerfile ships. Keeps the image small and needs no node_modules install
  // at runtime.
  output: "standalone",

  turbopack: {
    // This app is self-contained but lives inside a repo that has its own
    // lockfile. Without an explicit root, Turbopack walks up and picks the
    // wrong one. Lifting this directory into its own repo needs no change here.
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;

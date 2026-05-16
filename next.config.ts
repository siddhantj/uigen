// Load the Node 25+ Web Storage shim first. Next loads this config before
// any app code, so importing here is early enough — and unlike the previous
// NODE_OPTIONS='--require …' approach, this works on Windows.
import "./node-compat.cjs";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Pin the workspace root so Next doesn't walk up from CWD looking for a
  // lockfile — on Windows that walk can hit the legacy "Application Data"
  // junction under the user profile and crash with EPERM.
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
};

export default nextConfig;

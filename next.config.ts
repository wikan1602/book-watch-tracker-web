import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets `next dev` be reached via the VPS's network IP (e.g. for browser
  // testing from another machine) instead of only localhost — otherwise
  // Next 16 blocks cross-origin dev resources (HMR, RSC chunks) by default
  // and pages silently fail to hydrate.
  allowedDevOrigins: ["103.197.190.48"],
};

export default nextConfig;

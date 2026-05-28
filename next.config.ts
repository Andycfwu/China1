import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces the small, self-contained server copied into the production image.
  output: "standalone",
};

export default nextConfig;

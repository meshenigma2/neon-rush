import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@neon-rush/game-engine', '@neon-rush/game-contracts'],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@ai-sdk/anthropic", "@ai-sdk/openai"],
};

export default nextConfig;

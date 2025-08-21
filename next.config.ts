import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    asaasApiKey: process.env.ASAAS_API_KEY,
  },
};

export default nextConfig;
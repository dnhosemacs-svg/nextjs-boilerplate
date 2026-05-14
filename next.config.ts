import type { NextConfig } from "next";
import { assertServerEnv } from "./src/lib/server-env";

assertServerEnv();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;

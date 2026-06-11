import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
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

const sentryUploadEnabled = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  sourcemaps: {
    disable: !sentryUploadEnabled,
  },
  tunnelRoute: "/monitoring",
});

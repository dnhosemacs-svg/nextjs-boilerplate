import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/app/api/materials/**",
        "src/app/api/categories/**",
        "src/lib/api-route-utils.ts",
        "src/lib/prisma-errors.ts",
        "src/lib/serializers/material.ts",
        "src/lib/validators/material.ts",
        "src/lib/validators/category.ts",
      ],
      exclude: ["src/app/api/materials/**/__debug__/**"],
      thresholds: {
        lines: 80,
        functions: 80,
      },
    },
  },
});

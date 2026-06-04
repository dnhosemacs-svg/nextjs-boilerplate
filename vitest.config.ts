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
        "src/lib/**",
        "src/app/api/materials/**",
        "src/app/api/categories/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
      },
    },
  },
});

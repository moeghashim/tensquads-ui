import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: ["./packages/ui/src/test-setup.ts"],
		include: ["packages/ui/src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
	},
});

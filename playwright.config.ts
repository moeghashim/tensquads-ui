import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	reporter: "html",
	use: {
		baseURL: "http://localhost:5173",
		...devices["Desktop Chrome"],
		browserName: "chromium",
		locale: "en-US",
		colorScheme: "light",
		launchOptions: {
			args: ["--disable-lcd-text", "--font-render-hinting=none"],
		},
	},
	snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
	webServer: {
		command: "npm run build:preview && npm --prefix apps/preview run preview",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});

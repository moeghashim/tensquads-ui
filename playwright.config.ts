import { defineConfig, devices } from "@playwright/test";

const baseURL = `http://127.0.0.1:${process.env.PREVIEW_PORT ?? "5173"}`;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	reporter: "html",
	use: {
		baseURL,
		...devices["Desktop Chrome"],
		browserName: "chromium",
		locale: "en-US",
		colorScheme: "light",
		launchOptions: {
			args: ["--disable-lcd-text", "--font-render-hinting=none"],
		},
	},
	webServer: {
		command: "npm run build:preview && npm --prefix apps/preview run preview",
		url: baseURL,
		reuseExistingServer: false,
		timeout: 120_000,
	},
});

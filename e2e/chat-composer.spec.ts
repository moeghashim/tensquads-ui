import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const previewRequire = createRequire(new URL("../apps/preview/package.json", import.meta.url));
const { createServer } = await import(pathToFileURL(previewRequire.resolve("vite")).href);
let server: Awaited<ReturnType<typeof createServer>>;
let url: string;

test.beforeAll(async () => {
	const testInfo = test.info();
	server = await createServer({
		configFile: false,
		root: fileURLToPath(new URL("./fixtures/chat-composer", import.meta.url)),
		cacheDir: join(testInfo.project.outputDir, "vite-cache", String(testInfo.workerIndex)),
		server: { host: "127.0.0.1", port: 0, fs: { allow: [process.cwd()] } },
	});
	await server.listen();
	url = server.resolvedUrls.local[0];
});

test.afterAll(async () => {
	await server?.close();
});

for (const locale of ["en", "ar"] as const) {
	for (const activation of ["pointer", "Enter", "Space"] as const) {
		test(`Stop preserves the draft when busy clears: ${locale}, ${activation}`, async ({ page }) => {
			await page.goto(`${url}?locale=${locale}`);
			const input = page.getByRole("textbox", { name: locale === "ar" ? "رسالة" : "Message" });
			const stop = page.getByRole("button", { name: locale === "ar" ? "إيقاف" : "Stop" });
			const send = page.getByRole("button", { name: locale === "ar" ? "إرسال" : "Send" });
			const draft = locale === "ar" ? "مسودة الرسالة" : "Pending draft";
			await input.fill(draft);
			if (activation === "pointer") await stop.click();
			else await stop.press(activation);
			await expect(page.getByRole("status", { name: "Stop count" })).toHaveText("1");
			await expect(send).toBeVisible();
			await expect(input).toHaveValue(draft);
			await expect(page.getByRole("status", { name: "Sent messages" })).toHaveText("[]");
			await send.click();
			await expect(page.getByRole("status", { name: "Sent messages" })).toHaveText(JSON.stringify([draft]));
			await expect(input).toHaveValue("");
		});
	}
}

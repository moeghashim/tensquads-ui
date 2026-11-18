import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTensquadsLibrary } from "../library.js";
import { getRegisteredComponents } from "../registry.js";
import {
	buildSystemPrompt,
	MAX_BODY_BYTES,
	MAX_TURNS,
	type OpenUIServerError,
	readOpenUIRequest,
	streamOpenUIResponse,
} from "./index.js";

describe("OpenUI server helpers", () => {
	it.each(["en", "ar"] as const)("builds a live %s catalogue and locale example", (locale) => {
		const prompt = buildSystemPrompt({ library: createTensquadsLibrary(locale), locale, persona: "Persona" });
		for (const component of getRegisteredComponents()) {
			expect(prompt).toContain(component.name);
			expect(prompt).toContain(component.description);
			const shape = (component.props as unknown as { shape: Record<string, unknown> }).shape;
			for (const prop of Object.keys(shape)) expect(prompt).toContain(prop);
		}
		if (locale === "ar") {
			expect(prompt).toContain("مرحباً بك");
			expect(prompt).toContain("أعد برنامج OpenUI Lang فقط");
		} else {
			expect(prompt).toContain("Hello, welcome.");
			expect(prompt).toContain("Return only an OpenUI Lang program.");
		}
		expect(prompt).toContain("Persona");
	});

	it("enforces body byte and turn caps with typed errors", async () => {
		const large = new Request("https://worker.test", {
			method: "POST",
			headers: { "content-length": String(MAX_BODY_BYTES + 1) },
			body: "{}",
		});
		await expect(readOpenUIRequest(large)).rejects.toMatchObject<Partial<OpenUIServerError>>({
			name: "OpenUIServerError",
			code: "body_too_large",
			status: 413,
		});
		const turns = Array.from({ length: MAX_TURNS + 1 }, () => ({ role: "user", content: "Hi" }));
		await expect(
			readOpenUIRequest(new Request("https://worker.test", { method: "POST", body: JSON.stringify({ turns }) })),
		).rejects.toMatchObject({
			name: "OpenUIServerError",
			code: "too_many_turns",
		});
		await expect(
			readOpenUIRequest(new Request("https://worker.test", { method: "POST", body: "{" })),
		).rejects.toMatchObject({ name: "OpenUIServerError", code: "invalid_json", status: 400 });
	});

	it("returns a plain text response from the provider seam without network access", async () => {
		let receivedSystem = "";
		const provider = {
			async *stream(input: { system: string }) {
				receivedSystem = input.system;
				yield 'root = Example("مرحبا")';
				yield "\n";
			},
		};
		const response = await streamOpenUIResponse({ provider, system: "prompt", turns: [] });
		expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
		expect(await response.text()).toBe('root = Example("مرحبا")\n');
		expect(receivedSystem).toBe("prompt");
	});

	it("keeps Anthropic SDK imports in the provider and out of React DOM server bundles", () => {
		const sourceRoot = join(process.cwd(), "packages/ui/src");
		const allFiles = sourceFiles(sourceRoot);
		for (const file of allFiles) {
			const contents = readFileSync(file, "utf8");
			if (contents.includes(["@anthropic-ai/", "sdk"].join(""))) {
				expect(file).toMatch(/openui\/server\/providers\/anthropic\.ts$/);
			}
		}
		const entry = readFileSync(join(sourceRoot, "openui/server/index.ts"), "utf8");
		expect(entry).not.toMatch(/TensquadsRenderer|react-dom/);
		expect(entry).not.toMatch(/from ["']\.\.\/TensquadsRenderer/);
	});
});

function sourceFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory() ? sourceFiles(path) : /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
	});
}

import { isBuiltin } from "node:module";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { build } from "vite";
import { describe, expect, it, vi } from "vitest";
import { createTensquadsLibrary } from "../library.js";
import { getRegisteredComponents } from "../registry.js";
import { TensquadsRenderer } from "../TensquadsRenderer.js";
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

	it.each([
		["en", "Petra, Planning"],
		["ar", "بترا، تخطيط"],
	] as const)("renders the emitted %s Squadmate example with its localized accessible name", (locale, name) => {
		const prompt = buildSystemPrompt({ library: createTensquadsLibrary(locale), locale });
		const examples = prompt.match(/^root = Squadmate\(.+\)$/gm) ?? [];
		expect(examples.length).toBeGreaterThan(0);
		for (const stream of examples) {
			const view = render(createElement(TensquadsRenderer, { stream, locale }));
			expect(view.getByRole("img", { name })).toBeInTheDocument();
			view.unmount();
		}
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

	it("closes a generator cancelled during a pending read without an abort hook", async () => {
		const pending = waitPoint();
		const waiting = waitPoint();
		const cleaned = vi.fn();
		const provider = {
			async *stream() {
				try {
					yield "first";
					waiting.resolve();
					await pending.promise;
					yield "second";
				} finally {
					cleaned();
				}
			},
		};
		const response = await streamOpenUIResponse({ provider, system: "prompt", turns: [] });
		const reader = response.body!.getReader();
		expect(new TextDecoder().decode((await reader.read()).value)).toBe("first");
		await waiting.promise;
		const cancelled = reader.cancel();
		pending.resolve();
		await cancelled;
		expect(cleaned).toHaveBeenCalledOnce();
	});

	it.each([true, false])("closes an iterator when a provider read fails (first: %s)", async (first) => {
		const failure = new Error("provider failed");
		const next = vi.fn();
		if (!first) next.mockResolvedValueOnce({ done: false, value: "first" });
		next.mockRejectedValue(failure);
		const close = vi.fn().mockResolvedValue({ done: true });
		const provider = { stream: () => ({ [Symbol.asyncIterator]: () => ({ next, return: close }) }) };
		const response = streamOpenUIResponse({ provider, system: "prompt", turns: [] });
		if (first) await expect(response).rejects.toBe(failure);
		else await expect((await response).text()).rejects.toBe(failure);
		expect(close).toHaveBeenCalledOnce();
	});

	it("bundles the server without React DOM and confines SDK imports to the adapter", async () => {
		const sdkImporters = new Set<string>();
		const result = await build({
			configFile: false,
			define: { "process.env.NODE_ENV": JSON.stringify("production") },
			ssr: { noExternal: true },
			plugins: [
				{
					name: "server-boundary",
					enforce: "pre",
					resolveId(source, importer) {
						if (source === "@anthropic-ai/sdk" && importer) sdkImporters.add(importer);
						return null;
					},
				},
			],
			build: {
				ssr: join(process.cwd(), "packages/ui/src/openui/server/index.ts"),
				write: false,
				minify: false,
				rollupOptions: { external: isBuiltin },
			},
		});
		expect([...sdkImporters]).toEqual([join(process.cwd(), "packages/ui/src/openui/server/providers/anthropic.ts")]);
		const bundles = Array.isArray(result) ? result : [result];
		const modules = bundles.flatMap((bundle) =>
			"output" in bundle
				? bundle.output.flatMap((output) =>
						output.type === "chunk"
							? Object.entries(output.modules)
									.filter(([, module]) => module.renderedLength > 0)
									.map(([id]) => id)
							: [],
					)
				: [],
		);
		expect(modules.length).toBeGreaterThan(0);
		expect(modules.filter((id) => /node_modules\/react-dom\//.test(id))).toEqual([]);
	});
});

function waitPoint() {
	let resolve!: () => void;
	const promise = new Promise<void>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

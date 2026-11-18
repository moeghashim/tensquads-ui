import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatReply } from "./ChatReply.js";

const fixtures = {
	en: readFileSync(resolve(process.cwd(), "packages/ui/src/react/ChatReply/ChatReply.fixture.en.txt"), "utf8"),
	ar: readFileSync(resolve(process.cwd(), "packages/ui/src/react/ChatReply/ChatReply.fixture.ar.txt"), "utf8"),
};

const en = `# Deployment status

The deployment is **ready**. See the [runbook](https://example.com/runbook).

\`\`\`openui
root = Badge("Ready", "success")
\`\`\`

The checks passed:

\`\`\`openui
root = Button("Continue", "solid", "md", false, false)
\`\`\`

Use \`npm run deploy\` to continue.`;

describe("ChatReply", () => {
	it("renders Markdown and OpenUI blocks in reading order", () => {
		const { container } = render(<ChatReply reply={en} />);
		expect(screen.getByRole("heading", { name: "Deployment status" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "runbook" })).toHaveAttribute("href", "https://example.com/runbook");
		expect(screen.getByText("Ready")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
		const renderedText = container.textContent ?? "";
		expect(renderedText.indexOf("ready")).toBeLessThan(renderedText.indexOf("Ready"));
		expect(renderedText.indexOf("Ready")).toBeLessThan(renderedText.indexOf("The checks passed"));
		expect(renderedText.indexOf("The checks passed")).toBeLessThan(renderedText.indexOf("Continue"));
		expect(renderedText.indexOf("Continue")).toBeLessThan(renderedText.indexOf("Use"));
	});

	it.each(["en", "ar"] as const)("round-trips the %s fixture through both renderers", (locale) => {
		const fixture = fixtures[locale];
		const { container } = render(<ChatReply reply={fixture} locale={locale} />);
		expect(container.querySelectorAll(".ts-chat-reply__openui")).toHaveLength(2);
		expect(container.querySelectorAll(".ts-chat-reply__markdown h1")).toHaveLength(1);
		expect(
			[...container.querySelector(".ts-chat-reply")!.children].map((child) =>
				child.classList.contains("ts-chat-reply__openui") ? "openui" : "markdown",
			),
		).toEqual(["markdown", "openui", "markdown", "openui", "markdown"]);
	});

	it("streams an open OpenUI fence without showing fence text", () => {
		const { rerender, container } = render(<ChatReply reply="" />);
		const stream = `Status\n\n\`\`\`openui\nroot = Badge("Ready", "success")\n\`\`\`\nDone`;
		for (let index = 1; index <= stream.length; index += 1) {
			rerender(<ChatReply reply={stream.slice(0, index)} />);
			expect(container.textContent).not.toContain("```");
			expect(container.textContent).not.toContain("openui");
		}
		expect(screen.getAllByText("Ready").length).toBeGreaterThan(0);
		expect(container.textContent).toContain("Done");
	});

	it("renders unsafe links as text and raw HTML without interpreting it", () => {
		const { container } = render(
			<ChatReply
				reply={'[unsafe](javascript:alert(1)) [safe](mailto:a@example.com) <img src=x onerror="alert(1)">'}
			/>,
		);
		expect(container.querySelector("a[href^='javascript']")).toBeNull();
		expect(screen.getByRole("link", { name: "safe" })).toHaveAttribute("href", "mailto:a@example.com");
		expect(container.querySelector("img")).toBeNull();
		expect(container.textContent).toContain('<img src=x onerror="alert(1)">');
	});
});

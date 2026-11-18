import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, within } from "@testing-library/react";
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

	it.each(["Run `npm run deploy`", "تشغيل `npm run deploy`"])("preserves completed inline code in %s", (reply) => {
		const { container } = render(<ChatReply reply={reply} />);
		expect(container.querySelector("p > code")).toHaveTextContent("npm run deploy");
		expect(container.textContent).not.toContain("`");
	});

	it.each([
		["```text", "```"],
		["````text", "````"],
		["~~~text", "~~~"],
	])("keeps nested OpenUI literal inside %s fences", (opening, closing) => {
		const literal = '```openui\nroot = Badge("Literal", "success")';
		const reply = `${opening}\n${literal}\n${closing}\nAfter\n\n` +
			'```openui\nroot = Badge("Live", "success")\n```';
		const { container, rerender } = render(<ChatReply reply="" />);
		const prefix = `${opening}\n${literal}`;
		for (let index = 1; index <= prefix.length; index += 1) {
			rerender(<ChatReply reply={prefix.slice(0, index)} />);
			expect(container.querySelector(".ts-chat-reply__openui")).toBeNull();
		}
		rerender(<ChatReply reply={reply} />);
		expect(container.querySelector("pre")).toHaveAttribute("dir", "ltr");
		expect(container.querySelector("pre > code")?.textContent).toBe(literal);
		expect(screen.getByText("After")).toBeInTheDocument();
		expect(screen.getByText("Live", { exact: true })).toBeInTheDocument();
		expect(container.querySelectorAll(".ts-chat-reply__openui")).toHaveLength(1);
	});

	it.each(["en", "ar"] as const)("preserves list numbering and nesting in %s", (locale) => {
		const { container } = render(
			<ChatReply locale={locale} reply={"3. Resume\n4. Finish\n\n- Parent\n - Child\n  7. Nested step\n - Next child\n- Sibling\n\n5. Ordered parent\n - Mixed child\n6. Ordered sibling"} />,
		);
		const lists = container.querySelectorAll(".ts-chat-reply__markdown > ol");
		expect(lists[0]).toHaveAttribute("start", "3");
		expect(lists[0]?.querySelectorAll(":scope > li")).toHaveLength(2);
		const parent = screen.getByText("Parent", { exact: true }).closest("li")!;
		expect(parent.tagName).toBe("LI");
		expect(within(parent).getByText("Child", { exact: true }).closest("li")?.parentElement?.tagName).toBe("UL");
		expect(parent.querySelector("ul > li > ol")).toHaveAttribute("start", "7");
		expect(parent.parentElement?.querySelectorAll(":scope > li")).toHaveLength(2);
		expect(lists[1]).toHaveAttribute("start", "5");
		expect(lists[1]?.querySelector("li > ul > li")).toHaveTextContent("Mixed child");
		expect(lists[1]?.querySelectorAll(":scope > li")).toHaveLength(2);
	});

	it.each(["en", "ar"] as const)("keeps loose ordered siblings in one list in %s", (locale) => {
		const { container } = render(<ChatReply locale={locale} reply={"1. First\n\n1. Second\n\n3. Third"} />);
		const lists = container.querySelectorAll("ol");
		expect(lists).toHaveLength(1);
		expect(lists[0]).toHaveAttribute("start", "1");
		expect(lists[0]?.querySelectorAll(":scope > li")).toHaveLength(3);
		expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["First", "Second", "Third"]);
	});

	it.each(["en", "ar"] as const)("preserves loose nested lists and continuation paragraphs in %s", (locale) => {
		const reply = [
			"3. Parent", "", " Continued **details**", "", " - Child", "", "  7. Grandchild", "",
			"  1. Next grandchild", "", " - Next child", "", "4. Sibling", "", "Outside", "", "8. Separate",
		].join("\n");
		const { container } = render(<ChatReply locale={locale} reply={reply} />);
		const roots = container.querySelectorAll(".ts-chat-reply__markdown > ol");
		expect(roots).toHaveLength(2);
		expect(roots[0]).toHaveAttribute("start", "3");
		expect(roots[0]?.querySelectorAll(":scope > li")).toHaveLength(2);
		const parent = screen.getByText("Parent", { exact: true }).closest("li")!;
		expect(parent.querySelector("p > strong")).toHaveTextContent("details");
		expect(parent.querySelectorAll(":scope > ul > li")).toHaveLength(2);
		const grandchildren = parent.querySelector("ul > li > ol");
		expect(grandchildren).toHaveAttribute("start", "7");
		expect(grandchildren?.querySelectorAll(":scope > li")).toHaveLength(2);
		expect(roots[1]).toHaveAttribute("start", "8");
		expect(screen.getByText("Outside").parentElement).toHaveClass("ts-chat-reply__markdown");
	});

	it("keeps unordered parents and ordered children connected across blank lines", () => {
		const { container } = render(<ChatReply reply={"- Parent\n\n 3. Child\n\n 1. Next child\n\n- Sibling"} />);
		const root = container.querySelector(".ts-chat-reply__markdown > ul");
		expect(root?.querySelectorAll(":scope > li")).toHaveLength(2);
		const nested = root?.querySelector("li > ol");
		expect(nested).toHaveAttribute("start", "3");
		expect(nested?.querySelectorAll(":scope > li")).toHaveLength(2);
	});

	it.each([
		["unordered", "- Example:", "", " "],
		["ordered", "3. Example:", "", " "],
		["nested", "- Parent", "\n\n - Example:", "  "],
	] as const)("parses fenced code and headings inside %s list continuations", (_name, first, nested, indent) => {
		const code = "const x = 1;\n\n  const y = 2;\n- literal marker";
		const reply = first + nested + "\n\n" + [
			"```js", ...code.split("\n"), "```", "", "## Learn C#", "", "After code",
		].map((line) => indent + line).join("\n");
		const { container } = render(<ChatReply reply={reply} locale="ar" />);
		const item = screen.getByText("Example:", { exact: true }).closest("li")!;
		const pre = item.querySelector("pre");
		expect(pre).toHaveAttribute("dir", "ltr");
		expect(pre?.querySelector("code")?.textContent).toBe(code);
		expect(within(item).getByRole("heading", { level: 2, name: "Learn C#" })).toBeInTheDocument();
		expect(within(item).getByText("After code")).toBeInTheDocument();
		expect(container.textContent).not.toContain("```");
		expect(item.querySelectorAll("li")).toHaveLength(0);
	});

	it.each(["-", "3."])("parses block syntax on the initial %s item line", (marker) => {
		const reply = marker + " ## Title\n\n" + marker + " ```js\n const x = 1;\n ```";
		const { container } = render(<ChatReply reply={reply} />);
		expect(screen.getByRole("heading", { level: 2, name: "Title" }).closest("li")).toBeInTheDocument();
		expect(container.querySelector("li > pre")).toHaveAttribute("dir", "ltr");
		expect(container.querySelector("li > pre > code")?.textContent).toBe("const x = 1;");
	});

	it.each([
		["unordered", "- ", " "],
		["ordered", "3. ", " "],
		["nested", "- Parent\n - ", "  "],
		["deep ordered", "- Parent\n    3. ", "        "],
		["continuation", "- Example:\n\n ", " "],
		["deep continuation", "- Parent\n    3. Example:\n\n        ", "        "],
	] as const)("isolates literal OpenUI in %s list fences and renders later UI", (_name, prefix, indent) => {
		const literal = '```openui\nroot = Badge("Literal", "success")';
		const code = prefix + "```text\n" + literal.split("\n").map((line) => indent + line).join("\n") + "\n" + indent + "```";
		const live = '```openui\nroot = Badge("Live", "success")\n```';
		const { container, rerender } = render(<ChatReply reply="" />);
		for (let length = 1; length <= code.length; length += 1) {
			rerender(<ChatReply reply={code.slice(0, length)} />);
			expect(container.querySelector(".ts-chat-reply__openui")).toBeNull();
		}
		rerender(<ChatReply reply={code + "\n\n" + live} />);
		expect(container.querySelector("li pre code")?.textContent).toBe(literal);
		expect(container.querySelectorAll(".ts-chat-reply__openui")).toHaveLength(1);
		expect(screen.getByText("Live", { exact: true })).toBeInTheDocument();
		expect(screen.queryByText("Literal", { exact: true })).toBeNull();
	});

	it.each(["-", "3."])("renders real OpenUI after an ordinary %s item code fence", (marker) => {
		const reply = marker + ' ```js\n const x = 1;\n ```\n\n```openui\nroot = Badge("Ready", "success")\n```';
		const { container } = render(<ChatReply reply={reply} />);
		expect(container.querySelector("li pre code")?.textContent).toBe("const x = 1;");
		expect(screen.getByText("Ready", { exact: true })).toBeInTheDocument();
		expect(container.querySelectorAll(".ts-chat-reply__openui")).toHaveLength(1);
	});

	it.each([1, 2, 3, 4, 5, 6])("preserves content hashes in level %i headings", (level) => {
		const marker = "#".repeat(level);
		render(<ChatReply reply={`${marker} Learn C#\n\n${marker} Learn C# ###\n\n${marker} تعلم C#`} />);
		expect(screen.getAllByRole("heading", { level, name: "Learn C#" })).toHaveLength(2);
		expect(screen.getByRole("heading", { level, name: "تعلم C#" })).toBeInTheDocument();
	});

	it.each([
		["paragraph", ""],
		["heading", "# "],
		["unordered item", "- "],
		["ordered item", "3. "],
		["nested item", "- Parent\n - "],
	] as const)("preserves complete link destinations in a %s", (_name, prefix) => {
		const reply =
			prefix + String.raw`[balanced](https://example.com/topic_(detail_(more))) [escaped](https://example.com/topic_\(detail\)) [closing](https://example.com/end\))`;
		const { container } = render(<ChatReply reply={reply} />);
		expect(screen.getByRole("link", { name: "balanced" })).toHaveAttribute(
			"href",
			"https://example.com/topic_(detail_(more))",
		);
		expect(screen.getByRole("link", { name: "escaped" })).toHaveAttribute(
			"href",
			"https://example.com/topic_(detail)",
		);
		expect(screen.getByRole("link", { name: "closing" })).toHaveAttribute("href", "https://example.com/end)");
		expect(container.textContent).toBe(
			prefix.startsWith("- Parent") ? "Parentbalanced escaped closing" : "balanced escaped closing",
		);
	});

	it("keeps incomplete links literal while preserving subsequent inline formatting", () => {
		const { container } = render(<ChatReply reply={"[unfinished](https://example.com/(detail) **ready** `code`"} />);
		expect(screen.queryByRole("link")).toBeNull();
		expect(container.textContent).toBe("[unfinished](https://example.com/(detail) ready code");
		expect(container.querySelector("strong")).toHaveTextContent("ready");
		expect(container.querySelector("code")).toHaveTextContent("code");
	});

	it("accepts only explicit HTTP, HTTPS, and mailto link destinations", () => {
		render(<ChatReply reply={"[http](http://example.com) [https](https://example.com) [mail](mailto:a@example.com) [root](/path) [network](//example.com) [relative](path) [script](javascript:alert(1)) [data](data:text/plain,test)"} />);
		expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
			"http://example.com",
			"https://example.com",
			"mailto:a@example.com",
		]);
		for (const label of ["root", "network", "relative", "script", "data"]) {
			expect(screen.queryByRole("link", { name: label })).toBeNull();
		}
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

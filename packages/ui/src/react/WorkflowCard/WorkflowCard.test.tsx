import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";
import { TensquadsRenderer } from "../../openui/TensquadsRenderer.js";
import "../../openui/registry.js";
import { WorkflowCard, type WorkflowCardProps } from "./WorkflowCard.js";

const props: WorkflowCardProps = {
	name: "Order review",
	status: "live",
	meta: "Store operations",
	stats: [
		{ label: "Runs in 7 days", value: "24" },
		{ label: "Grader pass rate", value: "98%" },
		{ label: "Last run", value: "Today" },
	],
	graph: {
		nodes: [
			{ id: "start", kind: "start", title: "Start", position: { x: -500, y: -100 } },
			{ id: "end", kind: "end", title: "End", position: { x: 400, y: 200 } },
		],
		edges: [{ id: "start-end", from: "start", to: "end" }],
	},
};

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] });

const popoverStyle = document.createElement("style");
beforeAll(() => {
	popoverStyle.textContent = "[popover] { display: block !important; }";
	document.head.append(popoverStyle);
});
afterAll(() => popoverStyle.remove());
afterEach(cleanup);

test("renders one named link, three stats and a decorative graph fitted around its nodes", () => {
	const { container, getAllByRole, getByRole, getByText } = render(
		<WorkflowCard {...props} href="/workflows/order-review" />,
	);
	expect(getAllByRole("link")).toEqual([getByRole("link", { name: "Order review" })]);
	expect(getByRole("link").getAttribute("href")).toBe("/workflows/order-review");
	expect(getByText("Live").getAttribute("data-slot")).toBe("badge");
	expect(getAllByRole("term").map((item) => item.textContent)).toEqual([
		"Runs in 7 days",
		"Grader pass rate",
		"Last run",
	]);
	expect(getAllByRole("definition").map((item) => item.textContent)).toEqual(["24", "98%", "Today"]);
	const graph = container.querySelector(".ts-workflow-card__thumbnail");
	expect(graph?.getAttribute("aria-hidden")).toBe("true");
	expect(graph?.querySelectorAll("path")).toHaveLength(1);
	const [x, y, width, height] = graph?.querySelector("svg")?.getAttribute("viewBox")?.split(" ").map(Number) ?? [];
	expect(x).toBeLessThan(-500);
	expect(y).toBeLessThan(-100);
	expect(x! + width!).toBeGreaterThan(400 + 180);
	expect(y! + height!).toBeGreaterThan(200 + 48);
});

test.each([
	["live", "Unpublish", "unpublish"],
	["draft", "Publish", "publish"],
] as const)("the %s menu supports keyboard activation and separates Delete", async (status, publishLabel, action) => {
	const onAction = vi.fn();
	const { getByRole, getAllByRole } = render(
		<WorkflowCard {...props} status={status} href="/workflows/order-review" onAction={onAction} />,
	);
	const trigger = getByRole("button", { name: "Actions for Order review" });
	fireEvent.keyDown(trigger, { key: "ArrowDown" });
	await waitFor(() => expect(document.activeElement).toBe(getByRole("menuitem", { name: "Open" })));
	expect(onAction).not.toHaveBeenCalled();
	const items = getAllByRole("menuitem");
	expect(items.map((item) => item.textContent)).toEqual(["Open", "Duplicate", publishLabel, "Delete"]);
	const remove = items.at(-1)!;
	expect(remove.previousElementSibling).toBe(getByRole("separator"));
	expect(remove.hasAttribute("data-destructive")).toBe(true);
	expect(remove.getAttribute("data-agent-confirm")).toContain("Order review");
	const publish = getByRole("menuitem", { name: publishLabel });
	if (status === "live") expect(publish.getAttribute("data-agent-confirm")).toContain("Order review");
	fireEvent.click(publish);
	expect(onAction).toHaveBeenCalledExactlyOnceWith(action);
});

test("renders the empty graph as a draft summary without any controls", () => {
	const { container, getByText, queryByRole } = render(
		<WorkflowCard {...props} status="draft" graph={{ nodes: [], edges: [] }} />,
	);
	expect(getByText("Draft")).toBeTruthy();
	expect(container.querySelector(".ts-workflow-card__thumbnail svg")).toBeNull();
	expect(queryByRole("link")).toBeNull();
	expect(queryByRole("button")).toBeNull();
});

test("waits for the graph in an incomplete stream and renders the completed summary", () => {
	const fixture = readFileSync("packages/ui/src/react/WorkflowCard/WorkflowCard.fixture.ar.txt", "utf8");
	const onError = vi.fn();
	const { getByRole, queryByRole, rerender } = render(
		<TensquadsRenderer stream={fixture.split('{"nodes":')[0]!} locale="ar" isStreaming onError={onError} />,
	);
	expect(queryByRole("article")).toBeNull();
	rerender(<TensquadsRenderer stream={fixture} locale="ar" onError={onError} />);
	expect(getByRole("article")).toHaveTextContent("تنبيهات المخزون");
	expect(getByRole("article")).toHaveTextContent("منشور");
	expect(onError).toHaveBeenLastCalledWith([]);
});

// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { afterEach, expect, test, vi } from "vitest";
import { ListDetail } from "../../../templates/list-detail/ListDetail";

let approved = false;
const agent = createAgent({ allow: (step) => !step.confirm || approved });

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

test("agents can find named order tools and need approval to request a refund", async () => {
	vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
	const refund = vi.fn();
	render(<ListDetail onExport={vi.fn()} onRefundRequest={refund} onContact={vi.fn()} />);

	const controls = agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more");
	const names = controls.map(({ label }) => label);
	for (const name of names) expect(name).toBeTruthy();
	expect(names).toEqual(
		expect.arrayContaining(["Order dates", "Export", "Search orders", "Status: All", "Refund", "Contact customer"]),
	);

	const request = { steps: [{ ref: "Refund", action: "press" }] };
	await act(async () => {
		expect((await agent.act(request)).ok).toBe(false);
	});
	expect(refund).not.toHaveBeenCalled();

	approved = true;
	await act(async () => {
		expect((await agent.act(request)).ok).toBe(true);
	});
	expect(refund).toHaveBeenCalledWith(expect.objectContaining({ id: 1044 }));

	let change: ReturnType<typeof agent.act> | undefined;
	await act(async () => {
		change = agent.act({ steps: [{ ref: "Search orders", action: "setValue", args: ["Yousef"] }] });
	});
	const result = await change;
	expect(result?.ok, result?.error?.message).toBe(true);
	expect((screen.getByRole("searchbox", { name: "Search orders" }) as HTMLInputElement).value).toBe("Yousef");
});

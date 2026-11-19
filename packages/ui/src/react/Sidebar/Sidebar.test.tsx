import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Sidebar, SidebarAgent, SidebarBrand, SidebarItem, SidebarSection, SidebarUser } from "./Sidebar.js";

afterEach(cleanup);

beforeEach(() => {
	HTMLElement.prototype.showPopover = () => {};
	HTMLElement.prototype.hidePopover = () => {};
	Element.prototype.getAnimations = () => [];
	Element.prototype.getClientRects = () => [] as unknown as DOMRectList;
	Element.prototype.checkVisibility = () => true;
	if (!document.querySelector("style[data-sidebar-test]")) {
		document.head.append(
			Object.assign(document.createElement("style"), {
				textContent: "[popover] { display: block !important }",
				"data-sidebar-test": "",
			}),
		);
	}
});

describe("Sidebar", () => {
	it.each([false, true])("preserves state classes during async actions with link rendering %s", async (asLink) => {
		let finishAction!: () => void;
		const action = new Promise<void>((resolve) => {
			finishAction = resolve;
		});
		const { getByRole } = render(
			<SidebarItem
				icon={<svg />}
				active
				render={asLink ? <a href="#save">Save</a> : undefined}
				onClick={() => action}
				className={({ pending }) => (pending ? "saving" : "ready")}
			>
				Save
			</SidebarItem>,
		);
		const item = getByRole(asLink ? "link" : "button", { name: "Save" });
		expect(item).toHaveClass("ts-sidebar-item", "ready");
		expect(item).toHaveAttribute("aria-current", "page");
		fireEvent.click(item);
		expect(item).toHaveAttribute("aria-busy", "true");
		expect(item).toHaveClass("ts-sidebar-item", "saving");
		expect(item).not.toHaveClass("ready");
		await act(async () => finishAction());
		expect(item).not.toHaveAttribute("aria-busy");
		expect(item).toHaveClass("ts-sidebar-item", "ready");
		expect(item).not.toHaveClass("saving");
	});

	it("updates the current page when active changes and preserves string classes", () => {
		const item = (active: boolean) => (
			<SidebarItem icon={<svg />} active={active} className="custom">
				Overview
			</SidebarItem>
		);
		const { getByRole, rerender } = render(item(false));
		const button = getByRole("button", { name: "Overview" });
		expect(button).not.toHaveAttribute("aria-current");
		rerender(item(true));
		expect(button).toHaveAttribute("aria-current", "page");
		rerender(item(false));
		expect(button).not.toHaveAttribute("aria-current");
		expect(button).toHaveClass("ts-sidebar-item", "custom");
	});

	it("renders named navigation, active links, attention counts and unavailable items", () => {
		const { getByRole, getByText, queryByRole } = render(
			<Sidebar label="Main navigation">
				<SidebarBrand icon={<svg />} title="Platform admin" subtitle="Your company account" />
				<SidebarSection label="Workspace">
					<SidebarItem icon={<svg />} active render={<a href="/overview" />}>
						Overview
					</SidebarItem>
					<SidebarItem icon={<svg />} count={8}>
						Companies
					</SidebarItem>
					<SidebarItem icon={<svg />} disabled>
						Billing
					</SidebarItem>
				</SidebarSection>
				<SidebarUser initials="MG" name="Moe Ghashim" userRole="Platform admin" />
			</Sidebar>,
		);
		const link = getByRole("link", { name: "Overview" });
		expect(getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
		expect(link).toHaveAttribute("aria-current", "page");
		expect(link).toHaveAttribute("href", "/overview");
		expect(getByText("8")).toHaveClass("ts-sidebar-count");
		expect(getByText("Billing").closest("div")).toHaveAttribute("aria-disabled", "true");
		expect(queryByRole("link", { name: "Billing" })).not.toBeInTheDocument();
	});

	it("shows squad status text and opens the mobile sheet", async () => {
		const { getByRole, findByRole, getAllByRole, queryByRole } = render(
			<Sidebar label="Main navigation" mobileLabel="Open navigation">
				<SidebarItem icon={<svg />} active className={({ pending }) => (pending ? "saving" : "ready")}>
					Orders
				</SidebarItem>
				<SidebarAgent agent="pisa" state="running" name="Pisa" roleLabel="Orders" status="online" />
			</Sidebar>,
		);
		const trigger = getByRole("button", { name: "Open navigation" });
		fireEvent.click(trigger);
		const dialog = await findByRole("dialog", { name: "Main navigation" });
		expect(getAllByRole("navigation", { name: "Main navigation" })).toHaveLength(2);
		expect(dialog.querySelector(".ts-sidebar-visually-hidden")).toHaveTextContent("Online");
		expect(dialog.querySelector("button.ts-sidebar-item")).toHaveClass("ts-sidebar-item", "ready");
		expect(dialog.querySelector("button.ts-sidebar-item")).toHaveAttribute("aria-current", "page");
		fireEvent.click(dialog.querySelector("button.ts-sidebar-item")!);
		await waitFor(() => expect(queryByRole("dialog")).not.toBeInTheDocument());
		expect(getByRole("button", { name: "Open navigation" })).toBeInTheDocument();
	});
});

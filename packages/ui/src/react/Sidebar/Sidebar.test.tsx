import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
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
				<SidebarItem icon={<svg />}>Orders</SidebarItem>
				<SidebarAgent agent="pisa" state="running" name="Pisa" roleLabel="Orders" status="online" />
			</Sidebar>,
		);
		const trigger = getByRole("button", { name: "Open navigation" });
		fireEvent.click(trigger);
		const dialog = await findByRole("dialog", { name: "Main navigation" });
		expect(getAllByRole("navigation", { name: "Main navigation" })).toHaveLength(2);
		expect(dialog.querySelector(".ts-sidebar-visually-hidden")).toHaveTextContent("Online");
		fireEvent.click(dialog.querySelector("button.ts-sidebar-item")!);
		await waitFor(() => expect(queryByRole("dialog")).not.toBeInTheDocument());
		expect(getByRole("button", { name: "Open navigation" })).toBeInTheDocument();
	});
});

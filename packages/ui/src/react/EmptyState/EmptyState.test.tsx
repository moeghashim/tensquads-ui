import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState.js";

describe("EmptyState", () => {
	it("names the empty content and its next step", () => {
		render(<EmptyState title="No companies match" description="Clear the search to see all companies." />);
		expect(screen.getByRole("heading", { name: "No companies match" })).toBeVisible();
		expect(screen.getByText("Clear the search to see all companies.")).toBeVisible();
	});
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { Badge } from "./Badge.js";

afterEach(cleanup);

describe("Badge", () => {
	it.each(["default", "success", "warning", "danger", "info"] as const)(
		"renders the %s tone as a plain label",
		(tone) => {
			const { getByText } = render(
				<Badge tone={tone} data-testid="badge">
					Ready
				</Badge>,
			);
			const badge = getByText("Ready");
			expect(badge.tagName).toBe("SPAN");
			expect(badge).toHaveClass("ts-badge", `ts-badge--${tone}`);
			expect(badge).toHaveAttribute("data-testid", "badge");
			expect(badge).not.toHaveAttribute("role");
			expect(badge).not.toHaveAttribute("tabindex");
		},
	);

	it("forwards span props and composes a custom class", () => {
		const { getByText } = render(
			<Badge title="Current state" className="custom">
				Ready
			</Badge>,
		);
		expect(getByText("Ready")).toHaveAttribute("title", "Current state");
		expect(getByText("Ready")).toHaveClass("ts-badge", "ts-badge--default", "custom");
	});
});

describe("OpenUI round trips", () => {
	it("registers English and Arabic fixtures and renders both without errors", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("Badge");
		for (const locale of ["en", "ar"] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/Badge", `Badge.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByText } = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
			expect(getByText(locale === "en" ? "Ready" : "جاهز")).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});

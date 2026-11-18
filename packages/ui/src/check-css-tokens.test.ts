import { describe, expect, it } from "vitest";
import { findRawColors } from "../../../scripts/check-css-tokens.mjs";

describe("CSS color token check", () => {
	it.each(["#fff", "rgb(1 2 3)", "hsl(10 20% 30%)", "oklch(50% 0.2 30)", "red"])("rejects raw color %s", (color) => {
		expect(findRawColors(`.sample { color: ${color}; }`)).toHaveLength(1);
	});

	it("allows color tokens and CSS-wide keywords", () => {
		expect(
			findRawColors(`
				.sample {
					color: var(--ts-brand-color);
					background-color: var(--ts-red-500);
					border-color: transparent;
					outline-color: currentColor;
					box-shadow: 0 0 0 1px var(--ts-ring);
					fill: inherit;
					stroke: initial;
					background: revert;
					color: unset;
					border-color: revert-layer;
				}
			`),
		).toEqual([]);
	});

	it("still checks raw colors used as variable fallbacks", () => {
		expect(findRawColors(".sample { color: var(--ts-color, red); }")).toHaveLength(1);
	});
});

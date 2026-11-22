import { describe, expect, it } from "vitest";
import { toLogical, toPhysical } from "./viewport.js";

describe("canvas viewport direction adapter", () => {
	it("keeps LTR coordinates unchanged", () => {
		const viewport = { x: 72, y: -14, zoom: 1.5 };
		expect(toPhysical(viewport, 640, false)).toEqual(viewport);
		expect(toLogical(viewport, 640, false)).toEqual(viewport);
	});

	it("mirrors x in RTL and round trips", () => {
		const logical = { x: 72, y: -14, zoom: 1.5 };
		const physical = toPhysical(logical, 640, true);
		expect(physical).toEqual({ x: 568, y: -14, zoom: 1.5 });
		expect(toLogical(physical, 640, true)).toEqual(logical);
	});

	it("recomputes the physical origin after a resize", () => {
		const logical = { x: 72, y: 18, zoom: 1 };
		const before = toPhysical(logical, 640, true);
		const afterResize = toPhysical(toLogical(before, 640, true), 900, true);
		expect(afterResize).toEqual({ x: 828, y: 18, zoom: 1 });
		expect(toLogical(afterResize, 900, true)).toEqual(logical);
	});
});

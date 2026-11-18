import { describe, expect, it } from "vitest";
import { getPreviewAttributes } from "./state";

describe("getPreviewAttributes", () => {
	it("follows Arabic locale and keeps the system theme unset", () => {
		expect(getPreviewAttributes({ locale: "ar" })).toEqual({ lang: "ar", dir: "rtl" });
	});

	it("sets an explicit theme and supports a direction override", () => {
		expect(getPreviewAttributes({ locale: "ar", dir: "ltr", theme: "dark" })).toEqual({
			lang: "ar",
			dir: "ltr",
			"data-theme": "dark",
		});
	});
});

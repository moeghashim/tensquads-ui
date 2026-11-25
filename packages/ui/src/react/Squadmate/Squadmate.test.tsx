import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AGENT_ROLE_TO_SLUG, AGENT_SLUG_TO_ROLE, AgentRoleSchema } from "../../schemas/index.js";
import {
	AGENT_LOOP_STATES,
	SQUADMATES,
	Squadmate,
	squadmateMarkup,
	UnknownSquadmateError,
	UnknownSquadmateStateError,
} from "../../squadmates/index.js";
import { squadmateAccessibleName } from "./Squadmate.js";

const golden = JSON.parse(
	readFileSync(join(process.cwd(), "packages/ui/src/squadmates/markup.golden.json"), "utf8"),
) as Record<string, string>;

describe("squadmate source behavior", () => {
	it("preserves the roster and role-to-slug mapping", () => {
		expect(AgentRoleSchema.options).toHaveLength(13);
		expect(SQUADMATES).toHaveLength(13);
		expect(AGENT_ROLE_TO_SLUG.master).toBe("petra");
		expect(AGENT_SLUG_TO_ROLE.petra).toBe("master");
		expect(SQUADMATES.map((mate) => mate.name)).toContain("Petra");
	});

	it("matches the approved markup golden file for every agent and state", () => {
		for (const mate of SQUADMATES) {
			for (const state of ["idle", ...AGENT_LOOP_STATES.map(({ id }) => id)]) {
				expect(squadmateMarkup(mate.id, state, 64), `${mate.id}:${state}`).toBe(golden[`${mate.id}:${state}`]);
			}
		}
	});

	it("preserves errors and sizing", () => {
		expect(() => squadmateMarkup("missing", "idle", 64)).toThrow(UnknownSquadmateError);
		expect(() => squadmateMarkup("orders", "asleep", 64)).toThrow(UnknownSquadmateStateError);
		expect(squadmateMarkup("support", "idle", 24)).toContain('width="24" height="24"');
	});
});

describe("Squadmate image", () => {
	it("uses a localized character and state name without adding keyboard focus", () => {
		const { container } = render(<Squadmate agent="petra" state="planning" locale="en" />);
		const image = screen.getByRole("img", { name: "Petra, Planning" });
		expect(image.tagName).toBe("IMG");
		expect(image).toHaveAttribute(
			"src",
			`data:image/svg+xml;charset=utf-8,${encodeURIComponent(golden["master:planning"] ?? "")}`,
		);
		expect(image).not.toHaveAttribute("tabindex");
		expect(image).not.toHaveAttribute("role", "button");
		expect(container.querySelector("button, a, input, [tabindex]")).toBeNull();
	});

	it("serves distinct inline drawings with local gradient references and the same accessible name", () => {
		const pair = (
			<>
				<Squadmate agent="petra" state="planning" animated />
				<Squadmate agent="petra" state="planning" animated />
			</>
		);
		const { container } = render(pair);
		const images = within(container).getAllByRole("img", { name: "Petra, Planning" });
		expect(images).toHaveLength(2);
		expect(renderToString(pair)).toContain('aria-label="Petra, Planning"');
		const gradients = new Set<string>();
		for (const image of images) {
			expect(image).toHaveAttribute("data-state", "planning");
			expect(image).toHaveAttribute("data-size", "64");
			expect(image.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
			const localIds = new Set(Array.from(image.querySelectorAll("radialGradient[id]"), ({ id }) => id));
			expect(localIds.size).toBeGreaterThan(0);
			for (const id of localIds) {
				expect(gradients.has(id)).toBe(false);
				gradients.add(id);
			}
			for (const shape of image.querySelectorAll('[fill^="url(#"]')) {
				const id = shape.getAttribute("fill")?.slice(5, -1);
				expect(localIds.has(id ?? "")).toBe(true);
			}
		}
		expect(container.querySelector("img")).toBeNull();
	});

	it("replaces the SVG on state changes and keeps it when the name changes", () => {
		const { container, rerender } = render(<Squadmate agent="petra" state="planning" animated />);
		const initialSvg = container.querySelector("svg");
		rerender(<Squadmate agent="petra" state="planning" locale="ar" animated />);
		expect(container.querySelector("svg")).toBe(initialSvg);
		rerender(<Squadmate agent="petra" state="done" locale="ar" animated />);
		expect(container.querySelector("svg")).not.toBe(initialSvg);
		expect(screen.getByRole("img", { name: "بترا، تم" })).toHaveAttribute("data-state", "done");
	});

	it("uses the website's Arabic name and available state copy", () => {
		render(<Squadmate agent="petra" state="planning" locale="ar" />);
		expect(screen.getByRole("img", { name: "بترا، تخطيط" })).toBeInTheDocument();
	});

	it("names every state using roster English and the D18 Arabic labels", () => {
		const states = [
			["blocked", "Blocked", "معلّق"],
			["checking", "Checking", "قيد التحقق"],
			["done", "Done", "تم"],
			["dropped", "Dropped", "أُلغي"],
			["escalated", "Escalated", "بانتظار قرارك"],
			["idle", "Idle", "في استراحة"],
			["planning", "Planning", "تخطيط"],
			["running", "Running skill", "قيد العمل"],
			["sentback", "Sent back", "إعادة للتعديل"],
			["waiting", "Waiting", "بانتظارك"],
		] as const;
		for (const [state, english, arabic] of states) {
			expect(squadmateAccessibleName("machu", state, "en")).toBe(`Machu, ${english}`);
			expect(squadmateAccessibleName("machu", state, "ar")).toBe(`ماتشو، ${arabic}`);
		}
	});
});

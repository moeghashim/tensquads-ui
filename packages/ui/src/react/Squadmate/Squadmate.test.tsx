import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
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
		expect(image).not.toHaveAttribute("tabindex");
		expect(image).not.toHaveAttribute("role", "button");
		expect(container.querySelector("button, a, input, [tabindex]")).toBeNull();
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

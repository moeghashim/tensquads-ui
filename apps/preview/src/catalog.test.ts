import { expect, test } from "vitest";
import { catalogGroups, openUIComponents, reactOnlyComponents } from "./catalog";
import { siteCopy } from "./copy";

test("every documented component belongs to exactly one category", () => {
	const names = Object.values(catalogGroups).flat();
	const documents = Object.keys(import.meta.glob("../../../packages/ui/src/react/*/*.md")).map((path) => {
		const name = path.split("/").at(-2);
		return name === "OwnerMessage" ? "OwnerMessageView" : name;
	});
	expect([...names].sort()).toEqual(documents.sort());
	expect([...names].sort()).toEqual([...openUIComponents.keys(), ...reactOnlyComponents].sort());
	for (const copy of Object.values(siteCopy)) {
		expect(Object.keys(copy.designSystem.componentLeads).sort()).toEqual([...names].sort());
	}
});

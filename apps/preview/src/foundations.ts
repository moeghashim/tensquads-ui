import tokens from "../../../design/tokens.json";
import type { siteCopy } from "./copy";
import type { Locale } from "./state";

export type DesignCopy = (typeof siteCopy)[Locale]["designSystem"];
export type Token = { name: string; value: string | { light: string; dark: string }; usage: string };

export function variable(name: string) {
	return `--ts-${name}`;
}

const primitiveNames = /^(gray|blue|green|red|orange|yellow|purple|pink|alpha)-/;
const statusNames = /^(info|warning|caution|danger|success|discovery)-/;
const workflowNames = /^(node-|tint-|branch-|edge|connection-line|handle|toolbar-bg|dot-grid)/;

const colours = tokens.color.tokens;
export const primitives = new Map<string, Token[]>();
for (const token of colours) {
	const family = primitiveNames.exec(token.name)?.[1];
	if (!family) continue;
	const group = primitives.get(family) ?? [];
	group.push(token);
	primitives.set(family, group);
}
export const colourGroups: { id: string; label: "coreRoles" | "statusColours" | "workflowColours"; rows: Token[] }[] = [
	{
		id: "roles",
		label: "coreRoles",
		rows: colours.filter(
			({ name }) => !primitiveNames.test(name) && !statusNames.test(name) && !workflowNames.test(name),
		),
	},
	{ id: "status", label: "statusColours", rows: colours.filter(({ name }) => statusNames.test(name)) },
	{ id: "workflow-colours", label: "workflowColours", rows: colours.filter(({ name }) => workflowNames.test(name)) },
];

export function logoGroups(copy: DesignCopy) {
	return [
		{ title: copy.signal, files: ["logo.svg", "logo-dark.svg", "logo-512.png", "logo-dark-512.png"] },
		{ title: copy.wordmark, files: ["wordmark.svg", "wordmark-dark.svg"] },
		{ title: copy.appIcons, files: ["favicon.svg", "favicon-32.png", "apple-touch-icon.png"] },
	];
}

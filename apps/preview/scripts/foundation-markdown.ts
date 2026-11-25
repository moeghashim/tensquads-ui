import mascots from "../../../design/mascots/mascots.json";
import tokens from "../../../design/tokens.json";
import { squadmateCharacterName, squadmateStateLabel } from "../../../packages/ui/src/react/Squadmate/Squadmate";
import { AGENT_ROLE_TO_SLUG } from "../../../packages/ui/src/schemas";
import { AGENT_LOOP_STATES } from "../../../packages/ui/src/squadmates/roster";
import { tokens as resolvedTokens, type TokenName } from "../../../packages/ui/src/tokens/tokens";
import { siteCopy } from "../src/copy";
import { colourGroups, logoGroups, primitives, type Token, variable } from "../src/foundations";
import { alarmSizes, mascotMotionCopy, mascotMotionPath, motionSizes, motionStates, motionSteps } from "../src/mascot-motion-copy";
import { markdownPath } from "../src/markdown-path";
import type { FoundationName } from "../src/reference";
import type { Locale } from "../src/state";
import { blocks, code, heading, item, table } from "./markdown-format";

const states = ["idle", ...AGENT_LOOP_STATES.map(({ id }) => id)] as const;

function tokenTable(
	rows: readonly Token[],
	locale: Locale,
	themed = rows.some(({ value }) => typeof value !== "string"),
) {
	const { designSystem: copy, theme } = siteCopy[locale];
	return table(
		[
			copy.variable,
			...(themed ? [theme.light, theme.dark] : [copy.value]),
			locale === "ar" ? copy.sourceUsage : copy.usage,
		],
		rows.map(({ name, usage }) => {
			const { light, dark } = resolvedTokens[name as TokenName];
			return [code(variable(name)), code(light), ...(themed ? [code(dark)] : []), usage];
		}),
	);
}

export function mascotStates(locale: Locale) {
	const copy = siteCopy[locale].designSystem;
	return table(
		[copy.mascotStates, copy.sourceUsage],
		states.map((state) => [
			squadmateStateLabel(state, locale),
			AGENT_LOOP_STATES.find(({ id }) => id === state)?.hint ?? "",
		]),
	);
}

export function mascotMotionMarkdown(locale: Locale) {
	const copy = mascotMotionCopy[locale];
	return blocks(
		heading(2, copy.principlesTitle),
		copy.principlesLead,
		...copy.principles.flatMap(([title, text]) => [heading(3, title), text]),
		heading(2, copy.statesTitle),
		copy.statesLead,
		motionStates.map(({ state, kind }) => {
			const [name, motion, reason] = copy.states[state];
			return `- **${name}** (${copy.kinds[kind]}). ${motion}. ${reason}`;
		}).join("\n"),
		heading(2, copy.flowTitle),
		copy.flowLead,
		motionSteps.map(({ state }, index) => `${index + 1}. ${copy.states[state][0]}`).join("\n"),
		copy.flowHold,
		heading(2, copy.sizeTitle),
		copy.sizeLead,
		[...motionSizes.map(copy.pixels), ...alarmSizes.map(copy.alarmSize)].map((label) => `- ${label}`).join("\n"),
		heading(2, copy.specTitle),
		copy.specLead,
		table(copy.columns, motionStates.map(({ state, kind }) => {
			const [name, motion, , spec] = copy.states[state];
			return [name, copy.kinds[kind], motion, spec];
		})),
		heading(2, copy.guidanceTitle),
		heading(3, copy.doTitle),
		copy.do.map((text) => `- ${text}`).join("\n"),
		heading(3, copy.dontTitle),
		copy.dont.map((text) => `- ${text}`).join("\n"),
	);
}

export function foundationMarkdown(name: FoundationName, locale: Locale) {
	const copy = siteCopy[locale].designSystem;
	switch (name) {
		case "colour":
			return blocks(
				heading(2, copy.themes),
				copy.themeLead,
				...colourGroups.flatMap(({ label, rows }) => [heading(2, copy[label]), tokenTable(rows, locale, true)]),
				heading(2, copy.palette),
				copy.paletteLead,
				...Array.from(primitives, ([family, rows]) => blocks(heading(3, family), tokenTable(rows, locale, true))),
			);
		case "typography":
			return blocks(
				heading(2, copy.fontFamilies),
				table(
					[copy.variable, copy.value],
					Object.entries(tokens.type.families).map(([name, value]) => [code(variable(`font-${name}`)), code(value)]),
				),
				heading(2, copy.styles),
				...tokens.type.groups.map(({ name, styles }) =>
					blocks(
						heading(3, name),
						table(
							[copy.variable, copy.size, copy.lineHeight, copy.weight, copy.tracking],
							styles.map((style) => [
								code(style.name),
								code(style.fontSize),
								code(style.lineHeight),
								code(style.fontWeight),
								code(style.letterSpacing),
							]),
						),
					),
				),
			);
		case "spacing":
		case "radius":
		case "shadow":
			return tokenTable(tokens[name].tokens, locale);
		case "motion":
			return blocks(
				heading(2, copy.easing),
				tokenTable(tokens.easing.tokens, locale),
				heading(2, copy.duration),
				tokenTable(tokens.duration.tokens, locale),
			);
		case "logo":
			return blocks(
				...logoGroups(copy).map(({ title, files }) =>
					blocks(heading(2, title), files.map((file) => item(file, `/design/logo/${file}`)).join("\n")),
				),
			);
		case "mascots":
			return blocks(
				item(mascotMotionCopy[locale].title, markdownPath(mascotMotionPath, locale)),
				...mascots.map((mascot) => {
					const agent = AGENT_ROLE_TO_SLUG[mascot.id as keyof typeof AGENT_ROLE_TO_SLUG];
					return blocks(
						heading(2, squadmateCharacterName(agent, locale)),
						mascot.namedAfter,
						item("SVG", `/design/${mascot.files.svg}`),
						table(
							[copy.mascotPalette, copy.value],
							Object.entries(mascot.palette).map(([name, value]) => [code(name), code(value)]),
						),
					);
				}),
				heading(2, copy.mascotStates),
				mascotStates(locale),
			);
	}
}

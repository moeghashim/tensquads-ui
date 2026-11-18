import type { AgentSlug, AgentState, Locale } from "../../schemas/index.js";
import { squadmateMarkup } from "../../squadmates/draw.js";
import { AGENT_LOOP_STATES, SQUADMATES } from "../../squadmates/roster.js";

const ARABIC_NAMES: Record<AgentSlug, string> = {
	petra: "بترا",
	pisa: "بيزا",
	kyoto: "كيوتو",
	rio: "ريو",
	zurich: "زيورخ",
	giza: "الجيزة",
	machu: "ماتشو",
	angkor: "أنغكور",
	delphi: "دلفي",
	sydney: "سيدني",
	greenwich: "غرينتش",
	alexandria: "الإسكندرية",
	venice: "البندقية",
};

const ARABIC_STATES: Record<AgentState, string> = {
	waiting: "بانتظارك",
	planning: "تخطيط",
	running: "يعمل",
	checking: "يتحقق",
	done: "تم",
	sentback: "أُعيد",
	blocked: "محظور",
	escalated: "مُصعّد",
	dropped: "متوقف",
	idle: "خامل",
};

const ENGLISH_STATES = Object.fromEntries([...AGENT_LOOP_STATES.map(({ id, label }) => [id, label]), ["idle", "Idle"]]);

export function squadmateCharacterName(agent: AgentSlug, locale: Locale = "en"): string {
	const mate = SQUADMATES.find((entry) => entry.name.toLowerCase() === agent);
	return locale === "ar" ? ARABIC_NAMES[agent] : (mate?.name ?? agent);
}

export function squadmateStateLabel(state: AgentState, locale: Locale = "en"): string {
	return locale === "ar" ? ARABIC_STATES[state] : ENGLISH_STATES[state];
}

export function squadmateAccessibleName(agent: AgentSlug, state: AgentState, locale: Locale = "en"): string {
	const name = squadmateCharacterName(agent, locale);
	const stateLabel = squadmateStateLabel(state, locale);
	return `${name}${locale === "ar" ? "،" : ","} ${stateLabel}`;
}

export type SquadmateProps = {
	agent: AgentSlug;
	state: AgentState;
	size?: number;
	locale?: Locale;
};

export function Squadmate({ agent, state, size = 64, locale = "en" }: SquadmateProps) {
	const mate = SQUADMATES.find((entry) => entry.name.toLowerCase() === agent);
	if (!mate) throw new Error(`Unknown squadmate agent: ${agent}`);
	const markup = squadmateMarkup(mate.id, state, size);
	const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
	return <img src={src} width={size} height={size} alt={squadmateAccessibleName(agent, state, locale)} />;
}

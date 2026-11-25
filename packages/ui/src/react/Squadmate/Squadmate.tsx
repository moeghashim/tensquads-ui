import { useId, useMemo } from "react";
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
	running: "قيد العمل",
	checking: "قيد التحقق",
	done: "تم",
	sentback: "إعادة للتعديل",
	blocked: "معلّق",
	escalated: "بانتظار قرارك",
	dropped: "أُلغي",
	idle: "في استراحة",
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
	animated?: boolean;
};

export function Squadmate({ agent, state, size = 64, locale = "en", animated = false }: SquadmateProps) {
	const mate = SQUADMATES.find((entry) => entry.name.toLowerCase() === agent);
	if (!mate) throw new Error(`Unknown squadmate agent: ${agent}`);
	if (animated && typeof size !== "number") throw new TypeError("Squadmate size must be a number");
	const markup = squadmateMarkup(mate.id, state, size);
	const name = squadmateAccessibleName(agent, state, locale);
	if (animated) {
		return <AnimatedSquadmate agent={agent} state={state} size={size} markup={markup} name={name} />;
	}
	const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
	return <img src={src} width={size} height={size} alt={name} />;
}

function AnimatedSquadmate({
	agent,
	state,
	size,
	markup,
	name,
}: Pick<SquadmateProps, "agent" | "state"> & { size: number; markup: string; name: string }) {
	const id = useId();
	const drawing = useMemo(() => {
		// Only the synced drawing supplies markup. Scope its paint servers to this instance.
		const prefix = `sm-${agent}-`;
		const scopedPrefix = `${id.replace(/[^a-z0-9-]/gi, (char) => `_${char.charCodeAt(0).toString(16)}_`)}-${prefix}`;
		const svg = markup
			.replaceAll(`id="${prefix}`, `id="${scopedPrefix}`)
			.replaceAll(`url(#${prefix}`, `url(#${scopedPrefix}`)
			.replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');
		const artwork =
			state === "escalated"
				? svg.replace(
						'<g class="sm-badge">',
						'<g class="sm-badge"><circle class="sm-ring" cx="53" cy="53" r="8" opacity="0"/>',
					)
				: svg;
		return { __html: artwork };
	}, [agent, id, markup, state]);
	return (
		<span
			key={state}
			className="ts-squadmate"
			role="img"
			aria-label={name}
			data-animated=""
			data-state={state}
			data-size={size}
			data-bust={size < 64 ? "" : undefined}
			data-small={size <= 24 ? "" : undefined}
			dangerouslySetInnerHTML={drawing}
		/>
	);
}

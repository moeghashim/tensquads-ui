import { Squadmate, squadmateCharacterName } from "@tensquads/ui/react";
import { AGENT_SLUG_TO_ROLE, type AgentRole, type AgentSlug, type AgentState } from "@tensquads/ui/schemas";
import { SQUADMATES } from "@tensquads/ui/squadmates";
import { useEffect, useRef } from "react";
import { getMascotHeroCopy } from "../mascot-hero-copy";
import type { Locale } from "../state";
import "../styles/mascot-hero.css";

type PosedMate = readonly [AgentSlug, string, AgentState];

const BACK = [
	["giza", "step", "idle"],
	["angkor", "peek", "running"],
	["machu", "cheer", "done"],
	["greenwich", "lean-out", "idle"],
	["alexandria", "jump", "done"],
	["venice", "wave", "done"],
] as const satisfies readonly PosedMate[];
const FRONT = [
	["rio", "cheer", "done"],
	["zurich", "wave", "idle"],
	["kyoto", "lean-in", "running"],
	["petra", "leader", "idle"],
	["pisa", "hips", "idle"],
	["delphi", "think", "planning"],
	["sydney", "jump", "done"],
] as const satisfies readonly PosedMate[];

const rolesAr: Record<AgentRole, string> = {
	master: "قائد الفريق",
	orders: "الطلبات",
	support: "الدعم",
	marketing: "التسويق",
	finance: "المالية",
	inventory: "المخزون",
	market: "باحث السوق",
	website: "منشئ المواقع",
	analytics: "التحليلات",
	hr: "الموارد البشرية",
	places: "المواقع",
	catalog: "الكتالوج",
	channels: "القنوات",
};
const rolesEn = new Map<AgentRole, string>(SQUADMATES.map(({ id, role }) => [id, role]));

function startHops(stage: HTMLDivElement) {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	const drawings = Array.from(stage.querySelectorAll<HTMLElement>(".mascot-hero__drawing"));
	let interval: number | undefined;
	let index = 0;

	function stop() {
		window.clearInterval(interval);
		interval = undefined;
		for (const drawing of drawings) delete drawing.dataset.hopping;
	}

	function tick() {
		const rtl = getComputedStyle(stage).direction === "rtl";
		const ordered = drawings
			.map((drawing) => {
				const { left, right } = drawing.getBoundingClientRect();
				return { drawing, start: rtl ? -right : left };
			})
			.sort((a, b) => a.start - b.start);
		const next = ordered[index % ordered.length];
		if (next) next.drawing.dataset.hopping = "";
		index += 1;
	}

	function sync() {
		if (document.hidden || reducedMotion.matches) {
			stop();
		} else if (interval === undefined) {
			interval = window.setInterval(tick, 420);
		}
	}

	document.addEventListener("visibilitychange", sync);
	reducedMotion.addEventListener("change", sync);
	sync();
	return () => {
		stop();
		document.removeEventListener("visibilitychange", sync);
		reducedMotion.removeEventListener("change", sync);
	};
}

function MascotRow({ row, mates, locale }: { row: "back" | "front"; mates: readonly PosedMate[]; locale: Locale }) {
	return (
		<div className={`mascot-hero__row mascot-hero__row--${row}`}>
			{mates.map(([agent, pose, state]) => {
				const name = squadmateCharacterName(agent, locale);
				const id = AGENT_SLUG_TO_ROLE[agent];
				const role = locale === "ar" ? rolesAr[id] : rolesEn.get(id);
				const size = row === "back" ? 156 : agent === "petra" ? 214 : 182;
				return (
					<figure
						key={agent}
						className="mascot-hero__mate"
						data-agent={agent}
						data-pose={pose}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Focus reveals the name and role.
						tabIndex={0}
						aria-label={`${name}${locale === "ar" ? "،" : ","} ${role}`}
					>
						<div
							className="mascot-hero__drawing"
							aria-hidden="true"
							onAnimationEnd={({ currentTarget }) => {
								delete currentTarget.dataset.hopping;
							}}
						>
							<Squadmate agent={agent} state={state} size={size} locale={locale} animated />
						</div>
						<figcaption className="mascot-hero__tag" aria-hidden="true">
							{name}
							<small>{role}</small>
						</figcaption>
					</figure>
				);
			})}
		</div>
	);
}

export function MascotHero({ locale }: { locale: Locale }) {
	const copy = getMascotHeroCopy(locale);
	const stage = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (stage.current) return startHops(stage.current);
	}, []);

	return (
		<section className="mascot-hero" aria-labelledby="mascot-hero-title">
			<header className="mascot-hero__header">
				<div>
					<p className="mascot-hero__eyebrow">{copy.eyebrow}</p>
					<h1 id="mascot-hero-title">{copy.title}</h1>
					<p className="mascot-hero__lead">{copy.lead}</p>
				</div>
				<div className="mascot-hero__counts">
					{copy.counts.map(({ value, label }) => (
						<span key={label}>
							<b>{value}</b> {label}
						</span>
					))}
				</div>
			</header>
			<div className="mascot-hero__stage" ref={stage}>
				<MascotRow row="back" mates={BACK} locale={locale} />
				<MascotRow row="front" mates={FRONT} locale={locale} />
			</div>
			<footer className="mascot-hero__footer">
				<span>{copy.instructions}</span>
				<a href="#states">
					{copy.jump} <span aria-hidden="true">↓</span>
				</a>
			</footer>
		</section>
	);
}

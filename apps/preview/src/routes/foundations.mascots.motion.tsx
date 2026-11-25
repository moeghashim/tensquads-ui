import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Badge, Button, Squadmate } from "@tensquads/ui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { ReferenceIntro } from "../components/design-reference";
import { alarmSizes, mascotMotionCopy, motionSizes, motionStates, motionSteps } from "../mascot-motion-copy";
import { getPreviewState, type Locale } from "../state";
import "../styles/mascot-motion.css";

export const Route = createFileRoute("/foundations/mascots/motion")({ component: MascotMotionPage });

function MascotMotionPage() {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale } = getPreviewState(search);
	const copy = mascotMotionCopy[locale];
	const main = useRef<HTMLElement>(null);
	const [replay, setReplay] = useState(0);
	const [paused, setPaused] = useState(false);
	const [reduce, setReduce] = useState(false);
	const [systemReduced, setSystemReduced] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [flowVisible, setFlowVisible] = useState(false);

	useEffect(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const updatePreference = () => setSystemReduced(media.matches);
		const updateVisibility = () => setHidden(document.hidden);
		updatePreference();
		updateVisibility();
		media.addEventListener("change", updatePreference);
		document.addEventListener("visibilitychange", updateVisibility);

		const observer = new IntersectionObserver((entries) => {
			for (const { target, isIntersecting } of entries) {
				target.toggleAttribute("data-in-view", isIntersecting);
				if (target.hasAttribute("data-motion-flow")) setFlowVisible(isIntersecting);
			}
		});
		for (const stage of main.current?.querySelectorAll("[data-motion-stage]") ?? []) observer.observe(stage);

		return () => {
			observer.disconnect();
			media.removeEventListener("change", updatePreference);
			document.removeEventListener("visibilitychange", updateVisibility);
		};
	}, []);

	return (
		<main
			ref={main}
			id="main"
			className="design-wrap mascot-motion"
			data-paused={paused || hidden ? "" : undefined}
			data-reduced={reduce ? "" : undefined}
		>
			<ReferenceIntro title={copy.title} lead={copy.lead} />
			<div className="mascot-motion__controls">
				<Button pill variant="soft" onClick={() => setReplay((value) => value + 1)}>
					{copy.replay}
				</Button>
				<Button pill variant={reduce ? "solid" : "soft"} aria-pressed={reduce} onClick={() => setReduce(!reduce)}>
					{copy.reduce}
				</Button>
				<Button pill variant={paused ? "solid" : "soft"} aria-pressed={paused} onClick={() => setPaused(!paused)}>
					{copy.pause}
				</Button>
			</div>

			<section className="mascot-motion__section">
				<h2>{copy.principlesTitle}</h2>
				<p>{copy.principlesLead}</p>
				<div className="mascot-motion__principles">
					{copy.principles.map(([title, body]) => (
						<article className="mascot-motion__card" key={title}>
							<h3>{title}</h3>
							<p>
								{body.split("`").map((part, index) => (
									<Fragment key={part}>{index % 2 ? <code dir="ltr">{part}</code> : part}</Fragment>
								))}
							</p>
						</article>
					))}
				</div>
			</section>

			<section className="mascot-motion__section">
				<h2>{copy.statesTitle}</h2>
				<p>{copy.statesLead}</p>
				<div className="mascot-motion__states">
					{motionStates.map(({ state, kind }) => {
						const [label, motion, reason, spec] = copy.states[state];
						return (
							<article className="mascot-motion__card" key={state}>
								<div className="mascot-motion__stage" data-motion-stage="">
									<Squadmate
										key={kind === "loop" ? state : replay}
										agent="petra"
										state={state}
										size={128}
										locale={locale}
										animated
									/>
								</div>
								<h3>{label}</h3>
								<Badge tone="default">{copy.kinds[kind]}</Badge>
								<p>
									<strong>
										{motion}. {reason}
									</strong>
								</p>
								<p>{spec}</p>
							</article>
						);
					})}
				</div>
			</section>

			<section className="mascot-motion__section">
				<h2>{copy.flowTitle}</h2>
				<p>{copy.flowLead}</p>
				<MotionFlow locale={locale} playing={flowVisible && !paused && !hidden && !reduce && !systemReduced} />
			</section>

			<section className="mascot-motion__section">
				<h2>{copy.sizeTitle}</h2>
				<p>{copy.sizeLead}</p>
				<div className="mascot-motion__sizes">
					{motionSizes.map((size) => (
						<figure data-motion-stage="" key={size}>
							<Squadmate agent="delphi" state="running" size={size} locale={locale} animated />
							<figcaption>{copy.pixels(size)}</figcaption>
						</figure>
					))}
					{alarmSizes.map((size) => (
						<figure data-motion-stage="" key={`alarm-${size}`}>
							<Squadmate agent="zurich" state="escalated" size={size} locale={locale} animated />
							<figcaption>{copy.alarmSize(size)}</figcaption>
						</figure>
					))}
				</div>
			</section>

			<section className="mascot-motion__section">
				<h2>{copy.specTitle}</h2>
				<p>{copy.specLead}</p>
				<table className="foundation-table mascot-motion__spec">
					<thead>
						<tr>
							{copy.columns.map((column) => (
								<th key={column} scope="col">
									{column}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{motionStates.map(({ state, kind }) => {
							const [label, motion, , spec] = copy.states[state];
							return (
								<tr key={state}>
									<th scope="row">{label}</th>
									<td>{copy.kinds[kind]}</td>
									<td>{motion}</td>
									<td>{spec}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</section>

			<section className="mascot-motion__section">
				<h2>{copy.guidanceTitle}</h2>
				<div className="mascot-motion__guidance">
					{(
						[
							[copy.doTitle, copy.do, "do"],
							[copy.dontTitle, copy.dont, "dont"],
						] as const
					).map(([title, items, kind]) => (
						<article className="mascot-motion__card" key={kind} data-guidance={kind}>
							<h3>{title}</h3>
							<ul>
								{items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}

function MotionFlow({ locale, playing }: { locale: Locale; playing: boolean }) {
	const copy = mascotMotionCopy[locale];
	const [step, setStep] = useState(0);
	const [previous, setPrevious] = useState<number>();
	const [entered, setEntered] = useState(true);

	useEffect(() => {
		if (!playing) return;
		const timer = window.setTimeout(() => {
			setEntered(false);
			setPrevious(step);
			setStep((step + 1) % motionSteps.length);
		}, 2200);
		return () => window.clearTimeout(timer);
	}, [playing, step]);

	return (
		<div className="mascot-motion__flow">
			<div className="mascot-motion__stage" data-motion-stage="" data-motion-flow="">
				<div className="mascot-motion__swap">
					{motionSteps.map(({ id, state }, index) => {
						if (index !== step && index !== previous) return null;
						const exiting = index === previous;
						return (
							<div
								key={id}
								className="mascot-motion__pose"
								aria-hidden={exiting || undefined}
								data-exiting={exiting ? "" : undefined}
								data-entering={!exiting && !entered ? "" : undefined}
								onAnimationEnd={(event) => {
									if (event.target !== event.currentTarget) return;
									if (exiting) setPrevious(undefined);
									else setEntered(true);
								}}
							>
								<Squadmate agent="pisa" state={state} size={160} locale={locale} animated />
							</div>
						);
					})}
				</div>
			</div>
			<div>
				<ol className="mascot-motion__steps">
					{motionSteps.map(({ id, state }, index) => (
						<li key={id} aria-current={index === step ? "step" : undefined}>
							{copy.states[state][0]}
						</li>
					))}
				</ol>
				<p>{copy.flowHold}</p>
			</div>
		</div>
	);
}

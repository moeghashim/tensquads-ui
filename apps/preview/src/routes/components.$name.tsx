import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { TensquadsRenderer } from "@tensquads/ui/openui";
import { Button } from "../../../../packages/ui/src/react/Button/Button";
import {
	SegmentedControl,
	SegmentedControlIndicator,
	SegmentedControlItem,
} from "../../../../packages/ui/src/react/SegmentedControl/SegmentedControl";
import {
	Squadmate,
	squadmateCharacterName,
	squadmateStateLabel,
} from "../../../../packages/ui/src/react/Squadmate/Squadmate";
import { Switch, SwitchThumb } from "../../../../packages/ui/src/react/Switch/Switch";
import { AGENT_ROLE_TO_SLUG, type AgentState } from "../../../../packages/ui/src/schemas";
import { AGENT_LOOP_STATES, SQUADMATES } from "../../../../packages/ui/src/squadmates";
import { getPreviewState } from "../state";

const fixtures = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});

export const Route = createFileRoute("/components/$name")({ component: ComponentPage });

function ComponentPage() {
	const { name } = Route.useParams();
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale } = getPreviewState(search);
	const stream = fixtures[`../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`];
	if (name === "Squadmate") {
		const states: AgentState[] = ["idle", ...AGENT_LOOP_STATES.map(({ id }) => id)];
		return (
			<main className="gallery">
				<Link className="route-example" to="/" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>Squadmate</h1>
				<section
					className="squadmate-gallery"
					aria-label={locale === "ar" ? "الزملاء وحالاتهم" : "Squadmates and states"}
				>
					{SQUADMATES.map((mate) => (
						<div className="squadmate-gallery__agent" key={mate.id}>
							<h2>{squadmateCharacterName(AGENT_ROLE_TO_SLUG[mate.id], locale)}</h2>
							<div className="squadmate-gallery__states">
								{states.map((state) => (
									<figure key={state}>
										<Squadmate agent={AGENT_ROLE_TO_SLUG[mate.id]} state={state} size={48} locale={locale} />
										<figcaption>{squadmateStateLabel(state, locale)}</figcaption>
									</figure>
								))}
							</div>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</main>
		);
	}
	if (name === "Switch") {
		const label = locale === "ar" ? "تحديثات المنتج" : "Product updates";
		return (
			<main className="gallery component-preview">
				<Link className="route-example" to="/" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>Switch</h1>
				<section
					className="component-list switch-preview"
					aria-label={locale === "ar" ? "حالات المفتاح" : "Switch states"}
				>
					<div className="ts-switch-field">
						<span>{label}</span>
						<Switch aria-label={label} defaultChecked>
							<SwitchThumb />
						</Switch>
					</div>
					<div className="ts-switch-field">
						<span>{locale === "ar" ? "الإشعارات" : "Notifications off"}</span>
						<Switch aria-label={locale === "ar" ? "الإشعارات" : "Notifications off"}>
							<SwitchThumb />
						</Switch>
					</div>
					<div className="ts-switch-field">
						<span>{locale === "ar" ? "مُعطّل" : "Disabled"}</span>
						<Switch aria-label={locale === "ar" ? "مُعطّل" : "Disabled"} disabled defaultChecked>
							<SwitchThumb />
						</Switch>
					</div>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</main>
		);
	}
	if (name === "SegmentedControl") {
		const options = locale === "ar" ? ["قائمة", "شبكة", "لوحة"] : ["List", "Grid", "Board"];
		const iconOptions = locale === "ar" ? ["تحرير", "معاينة"] : ["Edit", "Preview"];
		return (
			<main className="gallery component-preview">
				<Link className="route-example" to="/" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>SegmentedControl</h1>
				<section
					className="component-list segmented-preview"
					aria-label={locale === "ar" ? "أوضاع العرض" : "View modes"}
				>
					<SegmentedControl aria-label={locale === "ar" ? "طريقة العرض" : "View"} defaultValue={options[1]}>
						<SegmentedControlIndicator />
						{options.map((option) => (
							<SegmentedControlItem value={option} key={option}>
								{option}
							</SegmentedControlItem>
						))}
					</SegmentedControl>
					<SegmentedControl aria-label={locale === "ar" ? "تخطيط" : "Layout"} defaultValue="preview">
						<SegmentedControlIndicator />
						<SegmentedControlItem value="edit" aria-label={iconOptions[0]}>
							<span aria-hidden="true">✎</span>
						</SegmentedControlItem>
						<SegmentedControlItem value="preview" aria-label={iconOptions[1]}>
							<span aria-hidden="true">◉</span>
						</SegmentedControlItem>
					</SegmentedControl>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</main>
		);
	}
	if (name === "Button") {
		const variants = ["solid", "soft", "outline", "ghost", "danger"] as const;
		const sizes = ["sm", "md", "lg"] as const;
		return (
			<main className="gallery button-preview">
				<Link className="route-example" to="/" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>Button</h1>
				<section
					className="button-preview__grid"
					aria-label={locale === "ar" ? "أنواع الأزرار" : "Button variants and sizes"}
				>
					{variants.map((variant) => (
						<div className="button-preview__row" key={variant}>
							<h2>{variant}</h2>
							{sizes.map((size) => (
								<Button key={size} variant={variant} size={size}>
									{locale === "ar" ? "متابعة" : "Continue"}
								</Button>
							))}
							<Button variant={variant} pill>
								{locale === "ar" ? "دائري" : "Pill"}
							</Button>
							<Button variant={variant} iconOnly aria-label={locale === "ar" ? "إضافة" : "Add"}>
								<span aria-hidden="true">+</span>
							</Button>
							<Button variant={variant} disabled>
								{locale === "ar" ? "معطّل" : "Disabled"}
							</Button>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</main>
		);
	}
	return (
		<main className="gallery">
			<Link to="/" search={search as never}>
				Back to gallery
			</Link>
			<p className="eyebrow">Component preview</p>
			<h1>{name}</h1>
			<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
				{stream ? (
					<TensquadsRenderer stream={stream} locale={locale} />
				) : (
					<p className="empty-state">No {locale} OpenUI fixture is registered for this component.</p>
				)}
			</section>
		</main>
	);
}

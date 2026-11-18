import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { TensquadsRenderer } from "@tensquads/ui/openui";
import { Badge } from "../../../../packages/ui/src/react/Badge/Badge";
import { Chip } from "../../../../packages/ui/src/react/Chip/Chip";
import { Button } from "../../../../packages/ui/src/react/Button/Button";
import { Field, FieldDescription, FieldError, FieldLabel } from "../../../../packages/ui/src/react/Field/Field";
import { Input } from "../../../../packages/ui/src/react/Input/Input";
import {
	Squadmate,
	squadmateCharacterName,
	squadmateStateLabel,
} from "../../../../packages/ui/src/react/Squadmate/Squadmate";
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
	if (name === "Input" || name === "Field") {
		const ar = locale === "ar";
		const labels = ar
			? {
					title: "حالات الإدخال",
					empty: "فارغ",
					placeholder: "عنصر نائب",
					filled: "معبأ",
					description: "وصف",
					error: "خطأ",
					disabled: "معطّل",
					readOnly: "للقراءة فقط",
					label: "اسم المشروع",
					helper: "استخدم اسماً يعرفه فريقك.",
					invalid: "هذا الحقل مطلوب.",
				}
			: {
					title: "Input states",
					empty: "Empty",
					placeholder: "Placeholder",
					filled: "Filled",
					description: "Description",
					error: "Error",
					disabled: "Disabled",
					readOnly: "Read only",
					label: "Project name",
					helper: "Use a name your team recognizes.",
					invalid: "This field is required.",
				};
		const examples = [
			{ label: labels.empty, props: {} },
			{ label: labels.placeholder, props: { placeholder: ar ? "أدخل اسماً" : "Enter a name" } },
			{ label: labels.filled, props: { defaultValue: ar ? "بنّاء" : "Northstar" } },
			{ label: labels.disabled, props: { disabled: true, defaultValue: ar ? "غير متاح" : "Unavailable" } },
			{ label: labels.readOnly, props: { readOnly: true, defaultValue: ar ? "للقراءة" : "Read only" } },
		];
		return (
			<main className="gallery input-preview">
				<Link className="route-example" to="/" search={search as never}>
					{ar ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{ar ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>{name}</h1>
				<section className="input-preview__grid" aria-label={labels.title}>
					{examples.map(({ label, props }) => (
						<div className="input-preview__item" key={label}>
							{name === "Input" && <h2>{label}</h2>}
							{name === "Input" ? (
								<Input aria-label={label} {...props} />
							) : (
								<Field name={label}>
									<FieldLabel>{label}</FieldLabel>
									<Input {...props} />
								</Field>
							)}
						</div>
					))}
					{name === "Field" && (
						<>
							<div className="input-preview__item">
								<h2>{labels.description}</h2>
								<Field name="description">
									<FieldLabel>{labels.label}</FieldLabel>
									<Input defaultValue={ar ? "بنّاء" : "Northstar"} />
									<FieldDescription>{labels.helper}</FieldDescription>
								</Field>
							</div>
							<div className="input-preview__item">
								<h2>{labels.error}</h2>
								<Field name="error" invalid>
									<FieldLabel>{labels.label}</FieldLabel>
									<Input aria-invalid="true" />
									<FieldError match>{labels.invalid}</FieldError>
								</Field>
							</div>
						</>
					)}
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
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
	if (name === "Badge") {
		const tones = ["default", "success", "warning", "danger", "info"] as const;
		const labels =
			locale === "ar"
				? { default: "مسودة", success: "مكتمل", warning: "قيد الانتظار", danger: "فشل", info: "معلومات" }
				: { default: "Draft", success: "Complete", warning: "Pending", danger: "Failed", info: "Information" };
		return (
			<main className="gallery badge-preview">
				<Link className="route-example" to="/" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>Badge</h1>
				<section className="badge-preview__grid" aria-label={locale === "ar" ? "نغمات الشارة" : "Badge tones"}>
					{tones.map((tone) => (
						<Badge key={tone} tone={tone}>
							{labels[tone]}
						</Badge>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</main>
		);
	}
	if (name === "Chip") {
		return (
			<main className="gallery chip-preview">
				<Link className="route-example" to="/" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>Chip</h1>
				<section className="chip-preview__grid" aria-label={locale === "ar" ? "حالات الرقاقة" : "Chip states"}>
					<h2>{locale === "ar" ? "مع أيقونة" : "With icon"}</h2>
					<Chip name="response_schema" icon={<span aria-hidden="true">◇</span>} onClick={() => undefined} />
					<Chip name="tool_search" icon={<span aria-hidden="true">⌕</span>} onClick={() => undefined} />
					<h2>{locale === "ar" ? "من دون أيقونة" : "Without icon"}</h2>
					<Chip name="output_format" icon={null} onClick={() => undefined} />
					<h2>{locale === "ar" ? "معطّل" : "Disabled"}</h2>
					<Chip name="disabled_object" icon={<span aria-hidden="true">◇</span>} disabled />
					<h2>{locale === "ar" ? "معرّف طويل" : "Long identifier"}</h2>
					<Chip
						name="this_is_a_long_object_identifier_that_stays_visible"
						icon={<span aria-hidden="true">◇</span>}
					/>
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

import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { TensquadsRenderer } from "@tensquads/ui/openui";
import { Badge } from "../../../../packages/ui/src/react/Badge/Badge";
import { Button } from "../../../../packages/ui/src/react/Button/Button";
import { Chip } from "../../../../packages/ui/src/react/Chip/Chip";
import {
	Dialog,
	DialogBackdrop,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../../../../packages/ui/src/react/Dialog/Dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "../../../../packages/ui/src/react/Field/Field";
import { Input } from "../../../../packages/ui/src/react/Input/Input";
import {
	Menu,
	MenuContent,
	MenuItem,
	MenuItemIcon,
	MenuSeparator,
	MenuTrigger,
} from "../../../../packages/ui/src/react/Menu/Menu";
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
import {
	Tooltip,
	TooltipArrow,
	TooltipContent,
	TooltipShortcut,
	TooltipTrigger,
} from "../../../../packages/ui/src/react/Tooltip/Tooltip";
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
	if (name === "Dialog") {
		const ar = locale === "ar";
		const copy = ar
			? {
					back: "العودة إلى المعرض",
					eyebrow: "معاينة المكوّن",
					simple: "حوار بسيط",
					open: "فتح الحوار",
					close: "إغلاق",
					simpleTitle: "مراجعة الطلب",
					simpleDescription: "طلب عضو جديد الانضمام إلى نورث ستار.",
					body: "راجع ملفه الشخصي قبل إضافته إلى الفريق.",
					form: "حوار مع نموذج",
					formOpen: "تعديل المشروع",
					formTitle: "تعديل المشروع",
					formDescription: "حدّث اسم المشروع ووصفه.",
					name: "اسم المشروع",
					nameValue: "نورث ستار",
					save: "حفظ التغييرات",
					cancel: "إلغاء",
					destructive: "إجراء تدميري",
					deleteOpen: "حذف المشروع",
					deleteTitle: "حذف المشروع؟",
					deleteDescription: "سيؤدي هذا إلى إزالة المشروع نهائياً.",
					deleteBody: "لا يمكن التراجع عن هذا الإجراء.",
					delete: "حذف المشروع",
				}
			: {
					back: "Back to gallery",
					eyebrow: "Component preview",
					simple: "Simple dialog",
					open: "Open dialog",
					close: "Close",
					simpleTitle: "Review request",
					simpleDescription: "A new member asked to join Northstar.",
					body: "Review their profile before adding them to the squad.",
					form: "Dialog with form",
					formOpen: "Edit project",
					formTitle: "Edit project",
					formDescription: "Update the project name and description.",
					name: "Project name",
					nameValue: "Northstar",
					save: "Save changes",
					cancel: "Cancel",
					destructive: "Destructive action",
					deleteOpen: "Delete project",
					deleteTitle: "Delete project?",
					deleteDescription: "This will permanently remove the project.",
					deleteBody: "This action cannot be undone.",
					delete: "Delete project",
				};
		return (
			<main className="gallery dialog-preview">
				<Link className="route-example" to="/" search={search as never}>
					{copy.back}
				</Link>
				<p className="eyebrow">{copy.eyebrow}</p>
				<h1>Dialog</h1>
				<section className="dialog-preview__grid" aria-label={ar ? "أمثلة الحوار" : "Dialog examples"}>
					<div className="dialog-preview__item">
						<h2>{copy.simple}</h2>
						<Dialog>
							<DialogTrigger render={<Button variant="outline" />}>{copy.open}</DialogTrigger>
							<DialogBackdrop />
							<DialogContent>
								<DialogTitle>{copy.simpleTitle}</DialogTitle>
								<DialogDescription>{copy.simpleDescription}</DialogDescription>
								<p data-slot="dialog-body">{copy.body}</p>
								<div data-slot="dialog-actions">
									<DialogClose render={<Button variant="solid" />}>{copy.close}</DialogClose>
								</div>
							</DialogContent>
						</Dialog>
					</div>
					<div className="dialog-preview__item">
						<h2>{copy.form}</h2>
						<Dialog>
							<DialogTrigger render={<Button variant="outline" />}>{copy.formOpen}</DialogTrigger>
							<DialogBackdrop />
							<DialogContent>
								<DialogTitle>{copy.formTitle}</DialogTitle>
								<DialogDescription>{copy.formDescription}</DialogDescription>
								<form data-slot="dialog-form" onSubmit={(event) => event.preventDefault()}>
									<Field name="project-name">
										<FieldLabel>{copy.name}</FieldLabel>
										<Input defaultValue={copy.nameValue} />
									</Field>
									<div data-slot="dialog-actions">
										<DialogClose value="cancel" render={<Button variant="outline" />}>
											{copy.cancel}
										</DialogClose>
										<DialogClose value="save" render={<Button variant="solid" />}>
											{copy.save}
										</DialogClose>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>
					<div className="dialog-preview__item">
						<h2>{copy.destructive}</h2>
						<Dialog>
							<DialogTrigger render={<Button variant="danger" />}>{copy.deleteOpen}</DialogTrigger>
							<DialogBackdrop />
							<DialogContent>
								<DialogTitle>{copy.deleteTitle}</DialogTitle>
								<DialogDescription>{copy.deleteDescription}</DialogDescription>
								<p data-slot="dialog-body">{copy.deleteBody}</p>
								<div data-slot="dialog-actions">
									<DialogClose value="cancel" render={<Button variant="outline" />}>
										{copy.cancel}
									</DialogClose>
									<DialogClose value="delete" render={<Button variant="danger" />}>
										{copy.delete}
									</DialogClose>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</main>
		);
	}
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
	if (name === "Tooltip") {
		const ar = locale === "ar";
		const sides = ["top", "right", "bottom", "left"] as const;
		const logicalSides = { top: "top", right: "end", bottom: "bottom", left: "start" } as const;
		const labels = ar
			? { title: "مواضع التلميح", action: "إضافة عنصر", hint: "أنشئ عنصراً جديداً" }
			: { title: "Tooltip placements", action: "Add item", hint: "Create a new item" };
		return (
			<main className="gallery tooltip-preview">
				<Link className="route-example" to="/" search={search as never}>
					{ar ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{ar ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>Tooltip</h1>
				<section className="tooltip-preview__grid" aria-label={labels.title}>
					{sides.map((side) => (
						<div className="tooltip-preview__item" key={side}>
							<h2>{side}</h2>
							<Tooltip shortcut="k">
								<TooltipTrigger render={<Button iconOnly aria-label={labels.action} />}>
									<span aria-hidden="true">+</span>
								</TooltipTrigger>
								<TooltipContent side={logicalSides[side]}>
									{labels.hint}
									<TooltipShortcut />
									<TooltipArrow />
								</TooltipContent>
							</Tooltip>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</main>
		);
	}
	if (name === "Menu") {
		const labels =
			locale === "ar"
				? {
						trigger: "إجراءات المشروع",
						open: "فتح المشروع",
						duplicate: "نسخ المشروع",
						disabled: "مشاركة",
						danger: "حذف المشروع",
					}
				: {
						trigger: "Project actions",
						open: "Open project",
						duplicate: "Duplicate",
						disabled: "Share",
						danger: "Delete project",
					};
		const icon = (kind: "open" | "duplicate" | "share" | "delete") => {
			const paths = {
				open: <path d="M3 5.5h7l2 2h9v11H3z" />,
				duplicate: (
					<>
						<rect x="7" y="7" width="13" height="13" rx="2" />
						<path d="M5 17H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
					</>
				),
				share: (
					<>
						<circle cx="18" cy="5" r="2" />
						<circle cx="6" cy="12" r="2" />
						<circle cx="18" cy="19" r="2" />
						<path d="m8 11 8-5M8 13l8 5" />
					</>
				),
				delete: <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />,
			};
			return (
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.7"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					{paths[kind]}
				</svg>
			);
		};
		const menuContents = (
			<>
				<MenuItem value="open">
					<MenuItemIcon>{icon("open")}</MenuItemIcon>
					{labels.open}
				</MenuItem>
				<MenuItem value="duplicate">
					<MenuItemIcon>{icon("duplicate")}</MenuItemIcon>
					{labels.duplicate}
				</MenuItem>
				<MenuItem value="share" disabled>
					<MenuItemIcon>{icon("share")}</MenuItemIcon>
					{labels.disabled}
				</MenuItem>
				<MenuSeparator />
				<MenuItem value="delete" destructive>
					<MenuItemIcon>{icon("delete")}</MenuItemIcon>
					{labels.danger}
				</MenuItem>
			</>
		);
		return (
			<main className="gallery menu-preview">
				<Link className="route-example" to="/" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>Menu</h1>
				<section className="menu-preview__examples" aria-label={locale === "ar" ? "حالات القائمة" : "Menu states"}>
					<div>
						<h2>{locale === "ar" ? "مغلق" : "Closed"}</h2>
						<Menu onAction={() => undefined}>
							<MenuTrigger>{labels.trigger}</MenuTrigger>
							<MenuContent side="bottom" align="start">
								{menuContents}
							</MenuContent>
						</Menu>
					</div>
					<div>
						<h2>{locale === "ar" ? "مفتوح" : "Open"}</h2>
						<Menu defaultOpen onAction={() => undefined}>
							<MenuTrigger>{labels.trigger}</MenuTrigger>
							<MenuContent side="bottom" align="start">
								{menuContents}
							</MenuContent>
						</Menu>
					</div>
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

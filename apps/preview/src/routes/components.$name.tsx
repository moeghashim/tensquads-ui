import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { getRegisteredComponents, TensquadsRenderer } from "@tensquads/ui/openui";
import { Badge } from "../../../../packages/ui/src/react/Badge/Badge";
import { Button } from "../../../../packages/ui/src/react/Button/Button";
import {
	Chat,
	ChatComposer,
	ChatHeader,
	ChatLog,
	ChatStep,
	ChatUserMessage,
} from "../../../../packages/ui/src/react/Chat/Chat";
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
import { CopyCodeButton } from "../components/copy-code-button";
import { MarkdownDocument } from "../components/docs/markdown-document";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

const fixtures = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});
const documents = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
});
const componentOrder = [...getRegisteredComponents().map(({ name }) => name), "Chat"];

export const Route = createFileRoute("/components/$name")({ component: ComponentPage });

function ComponentPage() {
	const { name } = Route.useParams();
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale].componentPage;
	const markdown = documents[`../../../../packages/ui/src/react/${name}/${name}.md`];
	const stream = fixtures[`../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`];
	const index = componentOrder.indexOf(name);
	const previous = index > 0 ? componentOrder[index - 1] : undefined;
	const next = index >= 0 ? componentOrder[index + 1] : undefined;
	const noFixtureReason = markdown?.match(/(?:OpenUI[^.]*does not[^.]*\.|without an OpenUI definition[^.]*\.)/i)?.[0];
	if (!markdown)
		return (
			<main className="content-page">
				<h1>{name}</h1>
				<p className="intro">{copy.unavailable}</p>
			</main>
		);
	return (
		<main className="component-doc-page">
			<div className="component-doc-page__header">
				<Link className="back-link" to="/components" search={search as never}>
					{copy.backToComponents}
				</Link>
				<p className="eyebrow">{siteCopy[locale].nav.components}</p>
				<h1>{name}</h1>
			</div>
			<section className="component-doc-page__section" aria-label={copy.apiReference}>
				<MarkdownDocument
					markdown={markdown}
					labels={{
						copy: copy.copy,
						copied: copy.copied,
						copyFailed: copy.copyFailed,
						codeLabel: copy.code,
						description: copy.description,
						props: copy.props,
						usage: copy.usage,
					}}
				/>
			</section>
			<section className="component-doc-page__section" aria-labelledby="component-preview-heading">
				<h2 id="component-preview-heading">{copy.preview}</h2>
				<ComponentExample />
			</section>
			<div className="component-doc-page__section">
				<h2 id="component-fixture-heading">{copy.fixture}</h2>
				{!stream && <p>{noFixtureReason ?? copy.noFixture}</p>}
				{stream && (
					<details className="fixture-source">
						<summary>{copy.fixtureSource}</summary>
						<ExampleCodeBlock code={stream.trim()} />
					</details>
				)}
			</div>
			<nav className="component-doc-nav" aria-label={copy.pageNavigation}>
				{previous ? (
					<Link to="/components/$name" params={{ name: previous }} search={search as never} rel="prev">
						<span aria-hidden="true">{direction === "rtl" ? "→" : "←"}</span> {copy.previous}: {previous}
					</Link>
				) : (
					<span />
				)}
				{next ? (
					<Link to="/components/$name" params={{ name: next }} search={search as never} rel="next">
						{copy.next}: {next} <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>
					</Link>
				) : (
					<span />
				)}
			</nav>
		</main>
	);
}

function ComponentExample() {
	const { name } = Route.useParams();
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale } = getPreviewState(search);
	const stream = fixtures[`../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`];
	if (name === "Chat") {
		const ar = locale === "ar";
		return (
			<div className="gallery chat-preview">
				<Chat className="chat-preview__surface">
					<ChatHeader locale={locale}>{ar ? "محادثة الوكيل" : "Agent chat"}</ChatHeader>
					<ChatLog>
						<ChatUserMessage>{ar ? "ساعدني في تخطيط المشروع" : "Help me plan the project"}</ChatUserMessage>
						<ChatStep
							name={ar ? "المخطط" : "Planner"}
							glyph={<span aria-hidden="true">◇</span>}
							status={ar ? "تم التوجيه" : "Routed"}
							responseId="resp_8f31"
							reply={
								<>
									<p>{ar ? "سأقسّم العمل إلى خطوات واضحة." : "I will break the work into clear steps."}</p>
									<ul>
										<li>{ar ? "تحديد الهدف" : "Define the goal"}</li>
										<li>{ar ? "ترتيب الخطوات" : "Order the steps"}</li>
									</ul>
								</>
							}
						/>
						<ChatStep name={ar ? "البحث" : "Research"} glyph={<span aria-hidden="true">⌕</span>} running />
					</ChatLog>
					<ChatComposer
						placeholder={ar ? "اكتب رسالة" : "Write a message"}
						locale={locale}
						sendLabel={ar ? "إرسال" : "Send"}
						stopLabel={ar ? "إيقاف" : "Stop"}
						onSend={() => undefined}
						attach={
							<Button variant="ghost" iconOnly aria-label={ar ? "إرفاق ملف" : "Attach file"}>
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.7"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="m12 5-6.5 6.5a4 4 0 0 0 5.7 5.7l7.2-7.2a2.5 2.5 0 0 0-3.5-3.5l-7.1 7.1a1 1 0 0 0 1.4 1.4l6.4-6.4" />
								</svg>
							</Button>
						}
					/>
				</Chat>
			</div>
		);
	}
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
			<div className="gallery dialog-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{copy.back}
				</Link>
				<p className="eyebrow">{copy.eyebrow}</p>
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
						<ExampleCodeBlock
							code={`<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>${copy.open}</DialogTrigger>
  <DialogBackdrop />
  <DialogContent>
    <DialogTitle>${copy.simpleTitle}</DialogTitle>
    <DialogDescription>${copy.simpleDescription}</DialogDescription>
    <p data-slot="dialog-body">${copy.body}</p>
    <div data-slot="dialog-actions">
      <DialogClose render={<Button variant="solid" />}>${copy.close}</DialogClose>
    </div>
  </DialogContent>
</Dialog>`}
						/>
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
						<ExampleCodeBlock
							code={`<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>${copy.formOpen}</DialogTrigger>
  <DialogBackdrop />
  <DialogContent>
    <DialogTitle>${copy.formTitle}</DialogTitle>
    <DialogDescription>${copy.formDescription}</DialogDescription>
    <form data-slot="dialog-form" onSubmit={(event) => event.preventDefault()}>
      <Field name="project-name">
        <FieldLabel>${copy.name}</FieldLabel>
        <Input defaultValue="${copy.nameValue}" />
      </Field>
      <div data-slot="dialog-actions">
        <DialogClose value="cancel" render={<Button variant="outline" />}>
          ${copy.cancel}
        </DialogClose>
        <DialogClose value="save" render={<Button variant="solid" />}>
          ${copy.save}
        </DialogClose>
      </div>
    </form>
  </DialogContent>
</Dialog>`}
						/>
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
						<ExampleCodeBlock
							code={`<Dialog>
  <DialogTrigger render={<Button variant="danger" />}>${copy.deleteOpen}</DialogTrigger>
  <DialogBackdrop />
  <DialogContent>
    <DialogTitle>${copy.deleteTitle}</DialogTitle>
    <DialogDescription>${copy.deleteDescription}</DialogDescription>
    <p data-slot="dialog-body">${copy.deleteBody}</p>
    <div data-slot="dialog-actions">
      <DialogClose value="cancel" render={<Button variant="outline" />}>
        ${copy.cancel}
      </DialogClose>
      <DialogClose value="delete" render={<Button variant="danger" />}>
        ${copy.delete}
      </DialogClose>
    </div>
  </DialogContent>
</Dialog>`}
						/>
					</div>
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Squadmate") {
		const states: AgentState[] = ["idle", ...AGENT_LOOP_STATES.map(({ id }) => id)];
		return (
			<div className="gallery">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
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
							<ExampleCodeBlock
								code={states
									.map(
										(state) =>
											`<Squadmate agent="${AGENT_ROLE_TO_SLUG[mate.id]}" state="${state}" size={48} locale="${locale}" />`,
									)
									.join("\n")}
							/>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
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
			<div className="gallery input-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{ar ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{ar ? "معاينة المكوّن" : "Component preview"}</p>
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
							<ExampleCodeBlock
								code={
									name === "Input"
										? `<Input aria-label="${label}"${props.placeholder ? ` placeholder="${props.placeholder}"` : ""}${props.defaultValue ? ` defaultValue="${props.defaultValue}"` : ""}${props.disabled ? " disabled" : ""}${props.readOnly ? " readOnly" : ""} />`
										: `<Field name="${label}">\n  <FieldLabel>${label}</FieldLabel>\n  <Input${props.placeholder ? ` placeholder="${props.placeholder}"` : ""}${props.defaultValue ? ` defaultValue="${props.defaultValue}"` : ""}${props.disabled ? " disabled" : ""}${props.readOnly ? " readOnly" : ""} />\n</Field>`
								}
							/>
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
								<ExampleCodeBlock
									code={`<Field name="description">
  <FieldLabel>${labels.label}</FieldLabel>
  <Input defaultValue="${ar ? "بنّاء" : "Northstar"}" />
  <FieldDescription>${labels.helper}</FieldDescription>
</Field>`}
								/>
							</div>
							<div className="input-preview__item">
								<h2>{labels.error}</h2>
								<Field name="error" invalid>
									<FieldLabel>{labels.label}</FieldLabel>
									<Input aria-invalid="true" />
									<FieldError match>{labels.invalid}</FieldError>
								</Field>
								<ExampleCodeBlock
									code={`<Field name="error" invalid>
  <FieldLabel>${labels.label}</FieldLabel>
  <Input aria-invalid="true" />
  <FieldError match>${labels.invalid}</FieldError>
</Field>`}
								/>
							</div>
						</>
					)}
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Switch") {
		const label = locale === "ar" ? "تحديثات المنتج" : "Product updates";
		return (
			<div className="gallery component-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section
					className="component-list switch-preview"
					aria-label={locale === "ar" ? "حالات المفتاح" : "Switch states"}
				>
					<div className="switch-preview__example">
						<div className="ts-switch-field">
							<span>{label}</span>
							<Switch aria-label={label} defaultChecked>
								<SwitchThumb />
							</Switch>
						</div>
						<ExampleCodeBlock
							code={`<div className="ts-switch-field">
  <span>${label}</span>
  <Switch aria-label="${label}" defaultChecked>
    <SwitchThumb />
  </Switch>
</div>`}
						/>
					</div>
					<div className="switch-preview__example">
						<div className="ts-switch-field">
							<span>{locale === "ar" ? "الإشعارات" : "Notifications off"}</span>
							<Switch aria-label={locale === "ar" ? "الإشعارات" : "Notifications off"}>
								<SwitchThumb />
							</Switch>
						</div>
						<ExampleCodeBlock
							code={`<div className="ts-switch-field">
  <span>${locale === "ar" ? "الإشعارات" : "Notifications off"}</span>
  <Switch aria-label="${locale === "ar" ? "الإشعارات" : "Notifications off"}">
    <SwitchThumb />
  </Switch>
</div>`}
						/>
					</div>
					<div className="switch-preview__example">
						<div className="ts-switch-field">
							<span>{locale === "ar" ? "مُعطّل" : "Disabled"}</span>
							<Switch aria-label={locale === "ar" ? "مُعطّل" : "Disabled"} disabled defaultChecked>
								<SwitchThumb />
							</Switch>
						</div>
						<ExampleCodeBlock
							code={`<div className="ts-switch-field">
  <span>${locale === "ar" ? "مُعطّل" : "Disabled"}</span>
  <Switch aria-label="${locale === "ar" ? "مُعطّل" : "Disabled"}" disabled defaultChecked>
    <SwitchThumb />
  </Switch>
</div>`}
						/>
					</div>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "SegmentedControl") {
		const options = locale === "ar" ? ["قائمة", "شبكة", "لوحة"] : ["List", "Grid", "Board"];
		const iconOptions = locale === "ar" ? ["تحرير", "معاينة"] : ["Edit", "Preview"];
		return (
			<div className="gallery component-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
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
					<ExampleCodeBlock
						code={`<SegmentedControl aria-label="${locale === "ar" ? "طريقة العرض" : "View"}" defaultValue="${options[1]}">
  <SegmentedControlIndicator />
${options.map((option) => `  <SegmentedControlItem value="${option}">${option}</SegmentedControlItem>`).join("\n")}
</SegmentedControl>`}
					/>
					<SegmentedControl aria-label={locale === "ar" ? "تخطيط" : "Layout"} defaultValue="preview">
						<SegmentedControlIndicator />
						<SegmentedControlItem value="edit" aria-label={iconOptions[0]}>
							<span aria-hidden="true">✎</span>
						</SegmentedControlItem>
						<SegmentedControlItem value="preview" aria-label={iconOptions[1]}>
							<span aria-hidden="true">◉</span>
						</SegmentedControlItem>
					</SegmentedControl>
					<ExampleCodeBlock
						code={`<SegmentedControl aria-label="${locale === "ar" ? "تخطيط" : "Layout"}" defaultValue="preview">
  <SegmentedControlIndicator />
  <SegmentedControlItem value="edit" aria-label="${iconOptions[0]}">
    <span aria-hidden="true">✎</span>
  </SegmentedControlItem>
  <SegmentedControlItem value="preview" aria-label="${iconOptions[1]}">
    <span aria-hidden="true">◉</span>
  </SegmentedControlItem>
</SegmentedControl>`}
					/>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Button") {
		const variants = ["solid", "soft", "outline", "ghost", "danger"] as const;
		const sizes = ["sm", "md", "lg"] as const;
		return (
			<div className="gallery button-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
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
							<ExampleCodeBlock
								code={[
									...sizes.map(
										(size) =>
											`<Button variant="${variant}" size="${size}">${locale === "ar" ? "متابعة" : "Continue"}</Button>`,
									),
									`<Button variant="${variant}" pill>${locale === "ar" ? "دائري" : "Pill"}</Button>`,
									`<Button variant="${variant}" iconOnly aria-label="${locale === "ar" ? "إضافة" : "Add"}"><span aria-hidden="true">+</span></Button>`,
									`<Button variant="${variant}" disabled>${locale === "ar" ? "معطّل" : "Disabled"}</Button>`,
								].join("\n")}
							/>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Badge") {
		const tones = ["default", "success", "warning", "danger", "info"] as const;
		const labels =
			locale === "ar"
				? { default: "مسودة", success: "مكتمل", warning: "قيد الانتظار", danger: "فشل", info: "معلومات" }
				: { default: "Draft", success: "Complete", warning: "Pending", danger: "Failed", info: "Information" };
		return (
			<div className="gallery badge-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="badge-preview__grid" aria-label={locale === "ar" ? "نغمات الشارة" : "Badge tones"}>
					{tones.map((tone) => (
						<div className="component-example" key={tone}>
							<Badge tone={tone}>{labels[tone]}</Badge>
							<ExampleCodeBlock code={`<Badge tone="${tone}">${labels[tone]}</Badge>`} />
						</div>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Chip") {
		return (
			<div className="gallery chip-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="chip-preview__grid" aria-label={locale === "ar" ? "حالات الرقاقة" : "Chip states"}>
					<h2>{locale === "ar" ? "مع أيقونة" : "With icon"}</h2>
					<Chip name="response_schema" icon={<span aria-hidden="true">◇</span>} onClick={() => undefined} />
					<Chip name="tool_search" icon={<span aria-hidden="true">⌕</span>} onClick={() => undefined} />
					<ExampleCodeBlock
						code={
							'<Chip name="response_schema" icon={<span aria-hidden="true">◇</span>} onClick={() => undefined} />\n<Chip name="tool_search" icon={<span aria-hidden="true">⌕</span>} onClick={() => undefined} />'
						}
					/>
					<h2>{locale === "ar" ? "من دون أيقونة" : "Without icon"}</h2>
					<Chip name="output_format" icon={null} onClick={() => undefined} />
					<ExampleCodeBlock code={'<Chip name="output_format" icon={null} onClick={() => undefined} />'} />
					<h2>{locale === "ar" ? "معطّل" : "Disabled"}</h2>
					<Chip name="disabled_object" icon={<span aria-hidden="true">◇</span>} disabled />
					<ExampleCodeBlock
						code={'<Chip name="disabled_object" icon={<span aria-hidden="true">◇</span>} disabled />'}
					/>
					<h2>{locale === "ar" ? "معرّف طويل" : "Long identifier"}</h2>
					<Chip
						name="this_is_a_long_object_identifier_that_stays_visible"
						icon={<span aria-hidden="true">◇</span>}
					/>
					<ExampleCodeBlock
						code={
							'<Chip name="this_is_a_long_object_identifier_that_stays_visible" icon={<span aria-hidden="true">◇</span>} />'
						}
					/>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Tooltip") {
		const ar = locale === "ar";
		const sides = [
			{ label: "top", side: "top" },
			{ label: "right", side: "end" },
			{ label: "bottom", side: "bottom" },
			{ label: "left", side: "start" },
		] as const;
		const labels = ar
			? { title: "مواضع التلميح", action: "إضافة عنصر", hint: "أنشئ عنصراً جديداً" }
			: { title: "Tooltip placements", action: "Add item", hint: "Create a new item" };
		return (
			<div className="gallery tooltip-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{ar ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{ar ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="tooltip-preview__grid" aria-label={labels.title}>
					{sides.map(({ label, side }) => (
						<div className="tooltip-preview__item" key={side}>
							<h2>{label}</h2>
							<Tooltip shortcut="k">
								<TooltipTrigger render={<Button iconOnly aria-label={labels.action} />}>
									<span aria-hidden="true">+</span>
								</TooltipTrigger>
								<TooltipContent side={side}>
									{labels.hint}
									<TooltipShortcut />
									<TooltipArrow />
								</TooltipContent>
							</Tooltip>
							<ExampleCodeBlock
								code={`<Tooltip shortcut="k">
  <TooltipTrigger render={<Button iconOnly aria-label="${labels.action}" />}>
    <span aria-hidden="true">+</span>
  </TooltipTrigger>
  <TooltipContent side="${side}">
    ${labels.hint}
    <TooltipShortcut />
    <TooltipArrow />
  </TooltipContent>
</Tooltip>`}
							/>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
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
		const menuContentsCode = `<MenuItem value="open">
  <MenuItemIcon><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5h7l2 2h9v11H3z" /></svg></MenuItemIcon>
  ${labels.open}
</MenuItem>
<MenuItem value="duplicate">
  <MenuItemIcon><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="7" width="13" height="13" rx="2" /><path d="M5 17H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" /></svg></MenuItemIcon>
  ${labels.duplicate}
</MenuItem>
<MenuItem value="share" disabled>
  <MenuItemIcon><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></svg></MenuItemIcon>
  ${labels.disabled}
</MenuItem>
<MenuSeparator />
<MenuItem value="delete" destructive>
  <MenuItemIcon><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></svg></MenuItemIcon>
  ${labels.danger}
</MenuItem>`;
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
			<div className="gallery menu-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="menu-preview__examples" aria-label={locale === "ar" ? "حالات القائمة" : "Menu states"}>
					<div>
						<h2>{locale === "ar" ? "مغلق" : "Closed"}</h2>
						<Menu onAction={() => undefined}>
							<MenuTrigger>{labels.trigger}</MenuTrigger>
							<MenuContent side="bottom" align="start">
								{menuContents}
							</MenuContent>
						</Menu>
						<ExampleCodeBlock
							code={`<Menu onAction={() => undefined}>
  <MenuTrigger>${labels.trigger}</MenuTrigger>
  <MenuContent side="bottom" align="start">
${menuContentsCode}
  </MenuContent>
</Menu>`}
						/>
					</div>
					<div>
						<h2>{locale === "ar" ? "مفتوح" : "Open"}</h2>
						<Menu defaultOpen onAction={() => undefined}>
							<MenuTrigger>{labels.trigger}</MenuTrigger>
							<MenuContent side="bottom" align="start">
								{menuContents}
							</MenuContent>
						</Menu>
						<ExampleCodeBlock
							code={`<Menu defaultOpen onAction={() => undefined}>
  <MenuTrigger>${labels.trigger}</MenuTrigger>
  <MenuContent side="bottom" align="start">
${menuContentsCode}
  </MenuContent>
</Menu>`}
						/>
					</div>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	return (
		<div className="gallery">
			<Link to="/components" search={search as never}>
				Back to gallery
			</Link>
			<p className="eyebrow">Component preview</p>
			<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
				{stream ? (
					<TensquadsRenderer stream={stream} locale={locale} />
				) : (
					<p className="empty-state">No {locale} OpenUI fixture is registered for this component.</p>
				)}
			</section>
		</div>
	);
}

function ExampleCodeBlock({ code }: { code: string }) {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale } = getPreviewState(search);
	const copy = siteCopy[locale].componentPage;
	return (
		<div className="copyable-code component-example-code" dir="ltr">
			<div className="copyable-code__header">
				<span>{copy.code}</span>
				<CopyCodeButton code={code} copyLabel={copy.copy} copiedLabel={copy.copied} failedLabel={copy.copyFailed} />
			</div>
			<pre>
				<code>{code}</code>
			</pre>
		</div>
	);
}

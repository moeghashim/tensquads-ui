"use client";

import { addMonths, daysBetween, isISODate, parseDate } from "@ui-sdk/core/date";
import {
	CalendarDay,
	CalendarGrid,
	CalendarHeading,
	CalendarNext,
	CalendarPrevious,
	CalendarWeekday,
	CalendarWeekdays,
	CalendarWeeks,
	createDatePickerController,
	DatePicker,
	DatePickerContent,
	DatePickerInput,
	DatePickerPreset,
	DatePickerTrigger,
	type DatePickerValue,
} from "@ui-sdk/react/date-picker";
import {
	type ComponentProps,
	useEffect,
	useEffectEvent,
	useId,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { Icon } from "../../icons/Icon.js";
import { Button } from "../Button/Button.js";

type PickerProps = ComponentProps<typeof DatePicker>;
type ValueChangeDetails = Parameters<NonNullable<PickerProps["onValueChange"]>>[1];

export type DateRange = { start: string; end: string };
export type DateRangePreset = { label: string; value: DateRange };

export type DateRangePickerProps = Omit<
	PickerProps,
	"mode" | "value" | "defaultValue" | "onValueChange" | "children" | "months" | "closeOnSelect"
> & {
	value?: DateRange | null;
	defaultValue?: DateRange | null;
	onValueChange?: (value: DateRange | null, details: ValueChangeDetails) => void;
	presets?: readonly DateRangePreset[];
	invalid?: boolean;
};

const phoneQuery = "(width < 640px)";
const wideQuery = "(width >= 1024px)";

function subscribeViewport(update: () => void) {
	const queries = [phoneQuery, wideQuery].map((query) => window.matchMedia?.(query)).filter(Boolean);
	for (const query of queries) query.addEventListener("change", update);
	return () => {
		for (const query of queries) query.removeEventListener("change", update);
	};
}

function getViewport() {
	if (window.matchMedia?.(wideQuery).matches) return "wide";
	if (window.matchMedia?.(phoneQuery).matches) return "phone";
	return "medium";
}

const copy = {
	en: {
		start: "Start date",
		end: "End date",
		previous: "Previous month",
		next: "Next month",
		close: "Close",
		custom: "Custom",
		clear: "Clear",
		apply: "Apply",
		invalid: "Enter a valid date range.",
		reversed: "The end date is before the start date.",
		empty: "No date range selected",
		pickingEnd: "Choose an end date",
		days: (count: string, singular: boolean) => `${count} ${singular ? "day" : "days"}`,
	},
	ar: {
		start: "تاريخ البداية",
		end: "تاريخ النهاية",
		previous: "الشهر السابق",
		next: "الشهر التالي",
		close: "إغلاق",
		custom: "مخصص",
		clear: "مسح",
		apply: "تطبيق",
		invalid: "أدخل نطاق تاريخ صالحًا.",
		reversed: "تاريخ النهاية قبل تاريخ البداية.",
		empty: "لم يُحدَّد نطاق تاريخ",
		pickingEnd: "اختر تاريخ النهاية",
		days: (count: string) => `${count} يومًا`,
	},
};

function sameRange(a: DateRange | null, b: DateRange | null) {
	return a?.start === b?.start && a?.end === b?.end;
}

function sdkValue(value: DateRange | null): DatePickerValue {
	return value ? [value.start, value.end] : null;
}

function calendarDate(iso: string) {
	return new Date(`${iso}T00:00:00Z`);
}

function CalendarNavigation({
	monthFormat,
	months,
	words,
}: {
	monthFormat: Intl.DateTimeFormat;
	months: number;
	words: (typeof copy)[keyof typeof copy];
}) {
	return (
		<div className="ts-date-range-picker__nav">
			<CalendarPrevious aria-label={words.previous}>
				<Icon name="back" />
			</CalendarPrevious>
			<CalendarHeading>
				{({ month }) => {
					const first = `${month}-01`;
					return (
						<>
							<span>{monthFormat.format(calendarDate(first))}</span>
							{months === 2 && <span>{monthFormat.format(calendarDate(addMonths(first, 1)))}</span>}
						</>
					);
				}}
			</CalendarHeading>
			<CalendarNext aria-label={words.next}>
				<Icon name="back" />
			</CalendarNext>
		</div>
	);
}

function CalendarMonth({ offset }: { offset: number }) {
	return (
		<CalendarGrid offset={offset}>
			<CalendarWeekdays>{(index) => <CalendarWeekday index={index} />}</CalendarWeekdays>
			<CalendarWeeks>
				{(cell) => <CalendarDay value={cell.date}>{({ label }) => <span>{label}</span>}</CalendarDay>}
			</CalendarWeeks>
		</CalendarGrid>
	);
}

type RangeInputProps = Pick<ComponentProps<typeof DatePickerInput>, "ref" | "end"> & {
	label: string;
	text: string | null;
	preview: boolean;
	invalid: boolean;
	description?: string;
};

function RangeInput({ label, text, preview, invalid, description, ...props }: RangeInputProps) {
	return (
		<span className="ts-date-range-picker__input" data-preview={preview || undefined}>
			<DatePickerInput
				{...props}
				aria-label={label}
				aria-invalid={invalid || undefined}
				aria-describedby={description}
				placeholder={label}
			/>
			{(text || preview) && (
				<span aria-hidden="true" data-placeholder={!text || undefined}>
					{text ?? label}
				</span>
			)}
		</span>
	);
}

type RangePreview = { start: string | null; end: string | null };

function useCalendarPreview() {
	const [calendar, setCalendar] = useState<HTMLDivElement | null>(null);
	const [preview, setPreview] = useState<RangePreview | null>(null);
	useEffect(() => {
		if (!calendar) {
			setPreview(null);
			return;
		}
		// Read the SDK's range preview so the field and footer follow both keyboard and pointer.
		const update = () => {
			const first = calendar.querySelector("[data-preview][data-range-start]");
			const last = calendar.querySelector("[data-preview][data-range-end]");
			const start = first?.getAttribute("data-value") ?? null;
			const end = last?.getAttribute("data-value") ?? null;
			setPreview((current) => {
				if (!first && !last) return null;
				if (current?.start === start && current.end === end) return current;
				return { start, end };
			});
		};
		update();
		const observer = new MutationObserver(update);
		observer.observe(calendar, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ["data-preview", "data-range-start", "data-range-end", "data-value"],
		});
		return () => observer.disconnect();
	}, [calendar]);
	function cancelPreview() {
		// The SDK cancels an unfinished range on a calendar day's Escape key.
		calendar
			?.querySelector("[data-preview]")
			?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true }),
			);
	}
	return { preview, setCalendar, cancelPreview };
}

type Draft = { value: DateRange | null; base: DateRange | null; details: ValueChangeDetails };

export function DateRangePicker({
	value,
	defaultValue = null,
	onValueChange,
	invalid = false,
	presets = [],
	locale,
	disabled,
	readOnly,
	today,
	controller: suppliedController,
	className,
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
	presentation,
	name,
	startName,
	endName,
	form,
	required,
	"aria-label": label,
	"aria-describedby": describedBy,
	...props
}: DateRangePickerProps) {
	const viewport = useSyncExternalStore(subscribeViewport, getViewport, () => "medium");
	const months = viewport === "wide" ? 2 : 1;
	const [localController] = useState(createDatePickerController);
	const controller = suppliedController ?? localController;
	const [localValue, setLocalValue] = useState(defaultValue);
	const [localOpen, setLocalOpen] = useState(defaultOpen);
	const [draft, setDraft] = useState<Draft | null>(null);
	const [field, setField] = useState<HTMLDivElement | null>(null);
	const { preview: calendarPreview, setCalendar, cancelPreview } = useCalendarPreview();
	const trigger = useRef<HTMLButtonElement>(null);
	const startInput = useRef<HTMLInputElement>(null);
	const endInput = useRef<HTMLInputElement>(null);
	const errorId = useId();
	const open = controlledOpen ?? localOpen;
	const preview = open ? calendarPreview : null;
	const committed = value === undefined ? localValue : value;
	const activeDraft = open && draft && sameRange(draft.base, committed) ? draft : null;
	const selected = activeDraft ? activeDraft.value : committed;
	const selectedStart = selected?.start;
	const selectedEnd = selected?.end;
	const pickerValue = useMemo(
		() => (selectedStart && selectedEnd ? sdkValue({ start: selectedStart, end: selectedEnd }) : null),
		[selectedStart, selectedEnd],
	);
	const requestedLocale = locale ?? field?.closest("[lang]")?.getAttribute("lang") ?? "en-US";
	const arabic = requestedLocale.split("-")[0] === "ar";
	const language = requestedLocale === "ar" ? "ar-SA-u-ca-gregory-nu-arab" : requestedLocale;
	const words = arabic ? copy.ar : copy.en;
	const pickerLabel = label ?? `${words.start} – ${words.end}`;
	const dateFormat = new Intl.DateTimeFormat(language, {
		day: "numeric",
		month: "short",
		year: "numeric",
		calendar: "gregory",
		timeZone: "UTC",
	});
	const monthFormat = new Intl.DateTimeFormat(language, {
		month: props.monthFormat ?? "long",
		year: "numeric",
		calendar: "gregory",
		timeZone: "UTC",
	});
	const formatDay = (date: string | null | undefined) =>
		date && isISODate(date) ? dateFormat.format(calendarDate(date)) : null;
	const rangeStart = preview ? preview.start : selected?.start;
	const rangeEnd = preview ? preview.end : selected?.end;
	const startText = formatDay(rangeStart);
	const endText = formatDay(rangeEnd);
	const rangeText = startText && endText ? `${startText} – ${endText}` : null;
	const dayCount = rangeStart && rangeEnd && rangeText ? daysBetween(rangeStart, rangeEnd) + 1 : 0;

	useEffect(() => {
		if (!open) setDraft(null);
	}, [open]);

	function commit(next: DateRange | null, details: ValueChangeDetails) {
		onValueChange?.(next, details);
		if (!details.canceled && value === undefined) setLocalValue(next);
		return !details.canceled;
	}

	const reset = useEffectEvent(() => {
		setDraft(null);
		if (value === undefined && !sameRange(committed, defaultValue)) {
			let canceled = false;
			commit(defaultValue, {
				reason: "reset",
				source: "programmatic",
				get canceled() {
					return canceled;
				},
				cancel() {
					canceled = true;
				},
			});
		}
	});

	useEffect(() => {
		const owner = form ? field?.ownerDocument.getElementById(form) : field?.closest("form");
		if (!owner) return;
		const handleReset = (event: Event) => {
			queueMicrotask(() => {
				if (!event.defaultPrevented) reset();
			});
		};
		owner.addEventListener("reset", handleReset);
		return () => owner.removeEventListener("reset", handleReset);
	}, [field, form]);

	const draftNames = activeDraft && committed && !disabled;
	return (
		<DatePicker
			{...props}
			aria-label={pickerLabel}
			className={(state) =>
				["ts-date-range-picker", typeof className === "function" ? className(state) : className]
					.filter(Boolean)
					.join(" ")
			}
			mode="range"
			locale={language}
			weekdayFormat={props.weekdayFormat ?? "narrow"}
			months={months}
			showOutsideDays={props.showOutsideDays ?? false}
			presentation={presentation ?? (viewport === "phone" ? "sheet" : "popover")}
			controller={controller}
			disabled={disabled}
			readOnly={readOnly}
			today={today}
			form={form}
			name={activeDraft ? undefined : name}
			startName={activeDraft ? undefined : startName}
			endName={activeDraft ? undefined : endName}
			required={required}
			value={pickerValue}
			open={controlledOpen}
			defaultOpen={defaultOpen}
			closeOnSelect={false}
			onOpenChange={(next, details) => {
				onOpenChange?.(next, details);
				if (details.canceled) return;
				if (!next) cancelPreview();
				setLocalOpen(next);
			}}
			onValueChange={(next, details) => {
				const range = Array.isArray(next) ? { start: next[0], end: next[1] } : null;
				if (details.reason === "reset") {
					details.cancel();
					return;
				}
				if (open && details.reason !== "restore" && details.reason !== "imperative") {
					setDraft({ value: range, base: committed, details });
				} else {
					setDraft(null);
					commit(range, details);
				}
			}}
		>
			{(state) => {
				const fieldInvalid = invalid || state.invalid;
				const typedStart = fieldInvalid
					? parseDate(startInput.current?.value ?? "", language, { referenceDate: today })
					: undefined;
				const typedEnd = fieldInvalid
					? parseDate(endInput.current?.value ?? "", language, { referenceDate: today })
					: undefined;
				const reversed =
					(typedStart && typedEnd && typedStart > typedEnd) || (selected && selected.start > selected.end);
				const inputDescription =
					[describedBy, fieldInvalid ? errorId : undefined].filter(Boolean).join(" ") || undefined;
				return (
					<>
						<div className="ts-date-range-picker__field" ref={setField} data-invalid={fieldInvalid || undefined}>
							<DatePickerTrigger ref={trigger} aria-label={pickerLabel} aria-describedby={`${errorId}-value`}>
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="3.5" y="5" width="17" height="15" rx="2.5" />
									<path d="M3.5 10h17M8 3v4M16 3v4" />
								</svg>
							</DatePickerTrigger>
							<RangeInput
								ref={startInput}
								label={words.start}
								text={startText}
								preview={!!preview}
								invalid={invalid}
								description={inputDescription}
							/>
							<span className="ts-date-range-picker__separator" aria-hidden="true">
								–
							</span>
							<RangeInput
								ref={endInput}
								end
								label={words.end}
								text={preview ? null : endText}
								preview={!!preview}
								invalid={invalid}
								description={inputDescription}
							/>
						</div>
						{fieldInvalid && (
							<p className="ts-date-range-picker__error" id={errorId} role="status">
								{reversed ? words.reversed : words.invalid}
							</p>
						)}
						{draftNames && (startName ?? name) && (
							<input type="hidden" form={form} name={startName ?? name} value={committed.start} />
						)}
						{draftNames && (endName ?? name) && (
							<input type="hidden" form={form} name={endName ?? name} value={committed.end} />
						)}
						<span className="ts-date-range-picker__announcement" id={`${errorId}-value`} aria-live="polite">
							{preview ? words.pickingEnd : (rangeText ?? words.empty)}
						</span>
						<DatePickerContent
							anchor={field}
							align="start"
							sideOffset={8}
							aria-label={pickerLabel}
							finalFocus={() => trigger.current}
							className="ts-date-range-picker__popup"
							onKeyDownCapture={(event) => {
								if (event.key === "Escape" && event.isTrusted && preview && props.dismissible !== false) {
									// Let the calendar cancel its unfinished range before closing.
									const nativeEvent = event.nativeEvent;
									queueMicrotask(() => controller.close({ reason: "escape-key", event: nativeEvent }));
								}
							}}
						>
							{({ presentation: layout }) => (
								<>
									{layout === "sheet" && (
										<div className="ts-date-range-picker__sheet-header">
											<span className="ts-date-range-picker__grab" aria-hidden="true" />
											<strong>{pickerLabel}</strong>
											<Button
												aria-label={words.close}
												variant="ghost"
												size="sm"
												iconOnly
												onClick={(event) =>
													controller.close({ reason: "close-press", event: event.nativeEvent })
												}
											>
												<Icon name="close" />
											</Button>
										</div>
									)}
									{presets.length > 0 && (
										<div className="ts-date-range-picker__presets">
											<div className="ts-date-range-picker__preset-options">
												{presets.map((preset) => (
													<DatePickerPreset
														key={preset.label}
														value={sdkValue(preset.value)}
														aria-pressed={!preview && sameRange(preset.value, selected)}
													>
														{preset.label}
													</DatePickerPreset>
												))}
											</div>
											<Button
												variant="ghost"
												aria-pressed={
													!!preview || !presets.some((preset) => sameRange(preset.value, selected))
												}
												onClick={() => controller.focus()}
											>
												{words.custom}
											</Button>
										</div>
									)}
									<div className="ts-date-range-picker__main">
										<CalendarNavigation monthFormat={monthFormat} months={months} words={words} />
										<div className="ts-date-range-picker__months" ref={setCalendar}>
											<CalendarMonth offset={0} />
											{months === 2 && <CalendarMonth offset={1} />}
										</div>
										<div className="ts-date-range-picker__footer">
											<span>
												{rangeText ? (
													<>
														<b>{rangeText}</b>
														<span className="ts-date-range-picker__days">
															{" · "}
															{words.days(
																new Intl.NumberFormat(language).format(dayCount),
																dayCount === 1,
															)}
														</span>
													</>
												) : preview ? (
													words.pickingEnd
												) : (
													words.empty
												)}
											</span>
											<span className="ts-date-range-picker__actions">
												<Button
													variant="ghost"
													size="sm"
													disabled={state.disabled || state.readOnly || !selected}
													onClick={(event) =>
														controller.clear({ reason: "clear-press", event: event.nativeEvent })
													}
												>
													{words.clear}
												</Button>
												<Button
													size="sm"
													disabled={state.disabled || !!preview || (!!required && !selected)}
													onClick={(event) => {
														if (activeDraft) {
															setDraft(null);
															if (!commit(activeDraft.value, activeDraft.details)) return;
														}
														controller.close({ reason: "close-press", event: event.nativeEvent });
													}}
												>
													{words.apply}
												</Button>
											</span>
										</div>
									</div>
								</>
							)}
						</DatePickerContent>
					</>
				);
			}}
		</DatePicker>
	);
}

import { TensquadsRenderer } from "@tensquads/ui/openui";
import { DateRangePicker } from "@tensquads/ui/react";
import type { Locale } from "../state";

const range = { start: "2026-10-10", end: "2026-10-23" };
const dates = [
	{ start: "2026-10-26", end: "2026-10-26" },
	{ start: "2026-10-20", end: "2026-10-26" },
	{ start: "2026-09-27", end: "2026-10-26" },
	{ start: "2026-10-01", end: "2026-10-31" },
	{ start: "2026-09-01", end: "2026-09-30" },
] as const;

const copy = {
	en: {
		presets: ["Today", "Last 7 days", "Last 30 days", "This month", "Last month"],
		interactive: "Start date – End date",
		closed: "Closed",
		empty: "Empty",
		invalid: "Invalid",
		disabled: "Disabled",
		fixture: "OpenUI fixture",
	},
	ar: {
		presets: ["اليوم", "آخر ٧ أيام", "آخر ٣٠ يومًا", "هذا الشهر", "الشهر الماضي"],
		interactive: "تاريخ البداية – تاريخ النهاية",
		closed: "مغلق",
		empty: "فارغ",
		invalid: "غير صالح",
		disabled: "معطّل",
		fixture: "عينة OpenUI",
	},
} as const;

export function DateRangePreview({ locale, stream }: { locale: Locale; stream: string | null }) {
	const words = copy[locale];
	return (
		<div className="gallery component-preview">
			<div className="component-list date-range-preview__examples">
				<div className="component-example">
					<strong>{words.closed}</strong>
					<DateRangePicker
						aria-label={words.interactive}
						locale={locale}
						today="2026-10-26"
						min="2026-09-01"
						max="2026-11-30"
						defaultValue={range}
						presets={words.presets.map((label, index) => ({ label, value: dates[index]! }))}
					/>
				</div>
				<div className="component-example">
					<strong>{words.empty}</strong>
					<DateRangePicker aria-label={words.empty} locale={locale} />
				</div>
				<div className="component-example">
					<strong>{words.invalid}</strong>
					<DateRangePicker
						aria-label={words.invalid}
						locale={locale}
						defaultValue={{ start: range.end, end: range.start }}
						invalid
					/>
				</div>
				<div className="component-example">
					<strong>{words.disabled}</strong>
					<DateRangePicker aria-label={words.disabled} locale={locale} defaultValue={range} disabled />
				</div>
			</div>
			<section className="component-list" aria-label={words.fixture}>
				<TensquadsRenderer stream={stream} locale={locale} />
			</section>
		</div>
	);
}

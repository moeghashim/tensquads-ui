import { type KeyboardEvent, useRef, useState } from "react";
import type { Locale } from "../../schemas/index.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip.js";

export type BarChartSegment = { key: string; value: number };
export type BarChartPoint = { label: string; value?: number; segments?: BarChartSegment[] };
export type BarChartKey = { key: string; label: string; tone: "muted" | "subtle" | "strong" | "success" | "danger" };
export type BarChartProps = {
	points: BarChartPoint[];
	keys?: BarChartKey[];
	highlight?: [number, number] | null;
	label?: string;
	locale?: Locale;
	formatValue?: (value: number) => string;
};

function niceAxisMaximum(value: number) {
	if (value <= 0) return 1;
	// The smallest "round" maximum at or above the data whose half is also whole, so the
	// three grid lines (0, half, max) read as whole numbers and bars fill most of the plot.
	const magnitude = 10 ** Math.floor(Math.log10(value));
	for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
		const candidate = Math.round(m * magnitude * 1e6) / 1e6;
		if (candidate >= value && Number.isInteger(candidate / 2)) return candidate;
	}
	return 10 * magnitude;
}

export function BarChart({ points, keys = [], highlight, label, locale = "en", formatValue }: BarChartProps) {
	const [active, setActive] = useState(0);
	const activeIndex = Math.min(active, Math.max(0, points.length - 1));
	const refs = useRef<Array<HTMLButtonElement | null>>([]);
	const dataMax = Math.max(
		1,
		...points.map((point) => point.value ?? point.segments?.reduce((sum, part) => sum + part.value, 0) ?? 0),
	);
	const integerData = points.every((point) =>
		point.value !== undefined
			? Number.isInteger(point.value)
			: (point.segments?.every((part) => Number.isInteger(part.value)) ?? true),
	);
	const max = integerData ? niceAxisMaximum(dataMax) : dataMax;
	const format =
		formatValue ??
		(locale === "ar" ? new Intl.NumberFormat("ar-EG-u-nu-arab", { maximumFractionDigits: 20 }).format : String);
	const summary = points
		.map(
			({ label: pointLabel, value, segments }) =>
				`${pointLabel}: ${format(value ?? segments?.reduce((sum, part) => sum + part.value, 0) ?? 0)}`,
		)
		.join(", ");
	// Each column needs at least 1.5rem plus 0.5rem of spacing; wider plots grow the columns up to 2.25rem.
	const chartColumns = `max-content minmax(calc(${points.length} * 2rem), 1fr) 2rem`;
	const showTickLabel = (index: number) => points.length <= 14 || index % 5 === 0;
	const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
		if (step) {
			event.preventDefault();
			const direction = getComputedStyle(event.currentTarget).direction;
			const next = Math.max(0, Math.min(points.length - 1, index + (direction === "rtl" ? -step : step)));
			setActive(next);
			refs.current[next]?.focus();
		}
	};
	return (
		<div className="ts-bar-chart" data-slot="bar-chart">
			<p className="ts-visually-hidden">
				{label ?? (locale === "ar" ? "رسم بياني" : "Chart")}: {summary}
			</p>
			<div className="ts-bar-chart__viewport">
				<div className="ts-bar-chart__canvas" style={{ gridTemplateColumns: chartColumns }}>
					<div className="ts-bar-chart__plot">
						{[0, 1, 2].map((line) => (
							<div className="ts-bar-chart__gridline" key={line} style={{ gridRow: line + 1 }}>
								<span>{format((max * (2 - line)) / 2)}</span>
							</div>
						))}
						<div className="ts-bar-chart__columns">
							{points.map((point, index) => {
								const parts = point.segments?.length
									? point.segments
									: [{ key: "value", value: point.value ?? 0 }];
								const total = parts.reduce((sum, part) => sum + part.value, 0);
								const isHighlighted = highlight
									? index >= highlight[0] && index <= highlight[1]
									: index === points.length - 1;
								const accessibleName = `${point.label}: ${format(total)}`;
								return (
									<Tooltip key={`${point.label}-${index}`}>
										<TooltipTrigger
											render={
												<button
													ref={(element) => {
														refs.current[index] = element;
													}}
													type="button"
													className="ts-bar-chart__column"
													aria-label={accessibleName}
													tabIndex={index === activeIndex ? 0 : -1}
													onFocus={() => setActive(index)}
													onKeyDown={(event) => onKeyDown(event, index)}
												/>
											}
										>
											<span
												className="ts-bar-chart__stack"
												aria-hidden="true"
												style={{ blockSize: `${(total / max) * 100}%` }}
											>
												{parts
													.filter((part) => part.value !== 0)
													.map((part) => (
														<span
															key={part.key}
															className={`ts-bar-chart__segment ts-bar-chart__segment--${keys.find((item) => item.key === part.key)?.tone ?? (isHighlighted ? "strong" : "muted")}`}
															style={{ flexGrow: (part.value / total) * 100 }}
														/>
													))}
											</span>
										</TooltipTrigger>
										<TooltipContent>
											{point.label}: {format(total)}
											{parts.length > 1 &&
												parts.map((part) => (
													<span key={part.key}>
														{" "}
														· {keys.find((item) => item.key === part.key)?.label ?? part.key}:{" "}
														{format(part.value)}
													</span>
												))}
										</TooltipContent>
									</Tooltip>
								);
							})}
						</div>
					</div>
					<div className="ts-bar-chart__ticks" aria-hidden="true">
						{points.map((point, index) => (
							<span className="ts-bar-chart__tick" key={point.label}>
								{showTickLabel(index) ? point.label : null}
							</span>
						))}
					</div>
				</div>
			</div>
			{keys.length > 1 && (
				<ul className="ts-bar-chart__legend">
					{keys.map((item) => (
						<li key={item.key}>
							<span className={`ts-bar-chart__swatch ts-bar-chart__segment--${item.tone ?? "muted"}`} />
							{item.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

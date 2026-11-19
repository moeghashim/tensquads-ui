import { type KeyboardEvent, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip.js";

export type BarChartSegment = { key: string; value: number };
export type BarChartPoint = { label: string; value?: number; segments?: BarChartSegment[] };
export type BarChartKey = { key: string; label: string; tone: "muted" | "strong" | "success" | "danger" };
export type BarChartProps = {
	points: BarChartPoint[];
	keys?: BarChartKey[];
	highlight?: [number, number] | null;
	label?: string;
};

export function BarChart({ points, keys = [], highlight, label = "Chart" }: BarChartProps) {
	const [active, setActive] = useState(0);
	const refs = useRef<Array<HTMLButtonElement | null>>([]);
	const max = Math.max(
		1,
		...points.map((point) => point.value ?? point.segments?.reduce((sum, part) => sum + part.value, 0) ?? 0),
	);
	const summary = points
		.map(
			({ label: pointLabel, value, segments }) =>
				`${pointLabel}: ${value ?? segments?.reduce((sum, part) => sum + part.value, 0) ?? 0}`,
		)
		.join(", ");
	const chartMinWidth = `calc(${points.length} * 2.25rem + 2rem)`;
	const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
		if (step) {
			event.preventDefault();
			const next = Math.max(0, Math.min(points.length - 1, index + (document.dir === "rtl" ? -step : step)));
			setActive(next);
			refs.current[next]?.focus();
		}
	};
	return (
		<div className="ts-bar-chart" data-slot="bar-chart">
			<p className="ts-visually-hidden">
				{label}: {summary}
			</p>
			<div className="ts-bar-chart__viewport">
				<div className="ts-bar-chart__plot" style={{ minInlineSize: chartMinWidth }}>
					{[0, 1, 2].map((line) => (
						<div className="ts-bar-chart__gridline" key={line}>
							<span>{Math.round((max * (2 - line)) / 2)}</span>
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
							const accessibleName = `${point.label}: ${total}`;
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
												tabIndex={index === active ? 0 : -1}
												onFocus={() => setActive(index)}
												onKeyDown={(event) => onKeyDown(event, index)}
											/>
										}
									>
										<span
											className="ts-bar-chart__stack"
											aria-hidden="true"
											style={{ blockSize: `${Math.max(2, (total / max) * 100)}%` }}
										>
											{parts.map((part) => (
												<span
													key={part.key}
													className={`ts-bar-chart__segment ts-bar-chart__segment--${keys.find((item) => item.key === part.key)?.tone ?? (isHighlighted ? "strong" : "muted")}`}
													style={{ flexGrow: part.value }}
												/>
											))}
										</span>
									</TooltipTrigger>
									<TooltipContent>
										{point.label}: {total}
										{parts.length > 1 &&
											parts.map((part) => (
												<span key={part.key}>
													{" "}
													· {keys.find((item) => item.key === part.key)?.label ?? part.key}: {part.value}
												</span>
											))}
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</div>
				<div className="ts-bar-chart__ticks" aria-hidden="true" style={{ minInlineSize: chartMinWidth }}>
					{points.map((point) => (
						<span className="ts-bar-chart__tick" key={point.label}>
							{point.label}
						</span>
					))}
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

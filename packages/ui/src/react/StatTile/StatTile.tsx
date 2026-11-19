import type { ComponentProps } from "react";

export type StatTileDelta = { text: string; tone: "positive" | "negative" | "neutral" } | null;
export type StatTileProps = ComponentProps<"article"> & {
	label: string;
	value: string;
	glyph?: string;
	unit?: string;
	foot?: string;
	delta?: StatTileDelta;
	series?: number[] | null;
};

function Sparkline({ series, label }: { series: number[]; label: string }) {
	const width = 112;
	const height = 32;
	const values = series.length > 1 ? series : [];
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const points = values.map((value, index) => {
		const x = (index / (values.length - 1)) * width;
		const y = height - 3 - ((value - min) / range) * (height - 6);
		return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
	});
	const pointString = points.map(([x, y]) => `${x},${y}`).join(" ");
	const last = points.at(-1);
	if (!last) return null;
	return (
		<svg className="ts-stat-tile__sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
			<polygon points={`0,${height} ${pointString} ${width},${height}`} />
			<polyline points={pointString} />
			<circle cx={last[0]} cy={last[1]} r="2.5" />
		</svg>
	);
}

export function StatTile({ label, value, glyph, unit, foot, delta, series, className, ...props }: StatTileProps) {
	return (
		<article {...props} data-slot="stat-tile" className={["ts-stat-tile", className].filter(Boolean).join(" ")}>
			<div className="ts-stat-tile__label-row">
				{glyph && (
					<span className="ts-stat-tile__glyph" aria-hidden="true">
						{glyph}
					</span>
				)}
				<span className="ts-stat-tile__label">{label}</span>
			</div>
			<div className="ts-stat-tile__main">
				<div className="ts-stat-tile__measure">
					<span className="ts-stat-tile__value">{value}</span>
					{unit && <span className="ts-stat-tile__unit">{unit}</span>}
				</div>
				{series && series.length > 1 && <Sparkline series={series} label={label} />}
			</div>
			{(delta || foot) && (
				<div className="ts-stat-tile__footer">
					{delta && <span className={`ts-stat-tile__delta ts-stat-tile__delta--${delta.tone}`}>{delta.text}</span>}
					{foot && <span className="ts-stat-tile__foot">{foot}</span>}
				</div>
			)}
		</article>
	);
}

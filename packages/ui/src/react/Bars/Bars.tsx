export type BarsRow = { label: string; value: number; display: string; tone?: "default" | "info" };
export type BarsProps = { rows: BarsRow[]; style?: "ranked" | "progress"; caption?: string };

export function Bars({ rows, style = "ranked", caption }: BarsProps) {
	const sortedRows = [...rows].sort((a, b) => b.value - a.value);
	const max = Math.max(1, ...sortedRows.map(({ value }) => value));
	return (
		<div className={`ts-bars ts-bars--${style}`} data-slot="bars">
			<ol className="ts-bars__list">
				{sortedRows.slice(0, 8).map((row) => (
					<li className="ts-bars__row" key={row.label}>
						<div className="ts-bars__labels">
							<span>{row.label}</span>
							<span>{row.display}</span>
						</div>
						<div className="ts-bars__track" title={`${row.label}: ${row.display}`}>
							<span
								className={row.tone === "info" ? "ts-bars__fill ts-bars__fill--info" : "ts-bars__fill"}
								style={{ inlineSize: `${(row.value / max) * 100}%` }}
							/>
						</div>
					</li>
				))}
			</ol>
			{caption && <p className="ts-bars__caption">{caption}</p>}
		</div>
	);
}

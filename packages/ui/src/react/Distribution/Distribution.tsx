export type DistributionPart = { label: string; value: number };
export type DistributionProps = { parts: DistributionPart[]; label?: string };

export function Distribution({ parts, label = "Distribution" }: DistributionProps) {
	const sorted = [...parts].sort((a, b) => b.value - a.value);
	const folded =
		sorted.length > 6
			? [
					...sorted.slice(0, 5),
					{ label: "Other", value: sorted.slice(5).reduce((sum, part) => sum + part.value, 0) },
				]
			: sorted;
	const total = folded.reduce((sum, part) => sum + part.value, 0);
	return (
		<div className="ts-distribution" data-slot="distribution">
			<p className="ts-visually-hidden">
				{label}: {folded.map(({ label: name, value }) => `${name}, ${value}`).join("; ")}
			</p>
			<div className="ts-distribution__bar" aria-hidden="true">
				{folded.map((part, index) => (
					<span
						key={part.label}
						className={`ts-distribution__segment ts-distribution__segment--${Math.min(5, 5 - index)}`}
						style={{ flexGrow: part.value }}
					/>
				))}
			</div>
			<ul className="ts-distribution__key">
				{folded.map((part) => (
					<li key={part.label}>
						<span>{part.label}</span>
						<strong>{part.value}</strong>
						<span className="ts-visually-hidden"> of {total}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

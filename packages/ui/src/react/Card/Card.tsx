import type { ComponentProps, ReactNode } from "react";

type DivProps = ComponentProps<"div">;

export type CardLegendItem = { label: string; value?: string };
export type CardProps = DivProps & {
	title?: ReactNode;
	subtitle?: ReactNode;
	count?: ReactNode;
	actions?: ReactNode;
	legend?: CardLegendItem[];
	footer?: ReactNode;
	flush?: boolean;
	variant?: "default" | "inset";
};

export function Card({
	title,
	subtitle,
	count,
	actions,
	legend,
	footer,
	flush = false,
	variant = "default",
	children,
	className,
	...props
}: CardProps) {
	return (
		<section
			{...props}
			data-slot="card"
			data-variant={variant}
			className={["ts-card", flush && "ts-card--flush", className].filter(Boolean).join(" ")}
		>
			{(title || subtitle || count || actions || legend) && (
				<header className="ts-card__header" data-slot="card-header">
					<div className="ts-card__heading">
						<div className="ts-card__title-row">
							{title && <h2 className="ts-card__title">{title}</h2>}
							{count != null && <span className="ts-card__count">{count}</span>}
						</div>
						{subtitle && <p className="ts-card__subtitle">{subtitle}</p>}
					</div>
					{(actions || legend) && (
						<div className="ts-card__head-end">
							{legend && (
								<ul className="ts-card__legend">
									{legend.map(({ label, value }) => (
										<li key={label}>
											<span aria-hidden="true" />
											{label}
											{value != null && <strong>{value}</strong>}
										</li>
									))}
								</ul>
							)}
							{actions && (
								<div className="ts-card__actions" data-slot="card-actions">
									{actions}
								</div>
							)}
						</div>
					)}
				</header>
			)}
			<div className="ts-card__body" data-slot="card-body">
				{children}
			</div>
			{footer && (
				<footer className="ts-card__footer" data-slot="card-footer">
					{footer}
				</footer>
			)}
		</section>
	);
}

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { siteCopy } from "../copy";
import type { Direction, Locale, PreviewSearch } from "../state";

export const foundationNames = [
	"colour",
	"typography",
	"spacing",
	"radius",
	"shadow",
	"motion",
	"logo",
	"mascots",
] as const;
export type FoundationName = (typeof foundationNames)[number];

export const llmsUrl = "https://github.com/moeghashim/tensquads-ui/blob/main/llms.txt";

export function Arrow({ direction }: { direction: Direction }) {
	return <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>;
}

export function FoundationLinks({
	locale,
	direction,
	search,
	descriptions = false,
}: {
	locale: Locale;
	direction: Direction;
	search: PreviewSearch;
	descriptions?: boolean;
}) {
	const copy = siteCopy[locale].designSystem.foundationsIndex;
	return (
		<div className={descriptions ? "foundation-grid" : "design-links design-links--paired"}>
			{foundationNames.map((name) => (
				<Link key={name} to="/foundations/$name" params={{ name }} search={search}>
					<span>
						{copy[name].title}
						{descriptions && <small>{copy[name].lead}</small>}
					</span>
					<Arrow direction={direction} />
				</Link>
			))}
		</div>
	);
}

export function ReferenceIntro({ title, lead }: { title: string; lead: string }) {
	return (
		<header className="reference-intro">
			<div>
				<h1>{title}</h1>
				<p>{lead}</p>
			</div>
			<a className="reference-resource" href={llmsUrl}>
				llms.txt
			</a>
		</header>
	);
}

export function ReferenceLayout({ label, links, children }: { label: string; links: ReactNode; children: ReactNode }) {
	return (
		<div className="reference-layout">
			<nav className="reference-rail" aria-label={label}>
				<strong>{label}</strong>
				<div>{links}</div>
			</nav>
			<div className="reference-body">{children}</div>
		</div>
	);
}

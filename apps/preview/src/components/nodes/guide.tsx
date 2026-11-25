import { Icon } from "@tensquads/ui/icons/Icon";
import { Button } from "@tensquads/ui/react";
import type { Locale } from "../../state";
import { builderCopy } from "./copy";

export function BuilderGuide({ locale, onHide }: { locale: Locale; onHide: () => void }) {
	const copy = builderCopy[locale];
	return (
		<aside className="builder-guide" aria-labelledby="builder-guide-title">
			<div className="builder-guide__head">
				<h2 id="builder-guide-title">{copy.guideTitle}</h2>
				<Button variant="ghost" size="sm" onClick={onHide}>
					{copy.hideGuide}
					<Icon name="close" size={14} />
				</Button>
			</div>
			<ol>
				{copy.steps.map(([step, instructions, shortcut]) => (
					<li key={step}>
						<div>
							<strong>{step}</strong>
							<kbd>{shortcut}</kbd>
						</div>
						<p>{instructions}</p>
					</li>
				))}
			</ol>
		</aside>
	);
}

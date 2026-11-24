import { Button } from "@tensquads/ui/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { siteCopy } from "../copy";
import type { Locale } from "../state";

export function ReferenceViewer({
	src,
	title,
	width,
	height,
	locale,
}: {
	src: string;
	title: string;
	width: number;
	height: number;
	locale: Locale;
}) {
	const stage = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState<number>();
	useEffect(() => {
		const element = stage.current;
		if (!element) return;
		const observer = new ResizeObserver(() => setScale(Math.min(1, element.clientWidth / width)));
		observer.observe(element);
		return () => observer.disconnect();
	}, [width]);

	return (
		<div className="reference-viewer">
			<div className="reference-viewer__controls">
				<Button variant="soft" render={<a href={src} target="_blank" rel="noreferrer" />}>
					{siteCopy[locale].reference.openFullSize}
				</Button>
			</div>
			<div
				ref={stage}
				className="reference-viewer__stage"
				dir="ltr"
				style={{ maxInlineSize: width, aspectRatio: `${width} / ${height}` }}
			>
				<iframe
					src={src}
					title={title}
					width={width}
					height={height}
					style={{ "--reference-scale": scale } as CSSProperties}
				/>
			</div>
		</div>
	);
}

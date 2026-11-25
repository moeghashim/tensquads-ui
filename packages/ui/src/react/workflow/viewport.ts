export type CanvasViewport = { x: number; y: number; zoom: number };

export function toPhysical(viewport: CanvasViewport, width: number, rtl: boolean): CanvasViewport {
	return { ...viewport, x: rtl ? width - viewport.x : viewport.x };
}

export function toLogical(viewport: CanvasViewport, width: number, rtl: boolean): CanvasViewport {
	return { ...viewport, x: rtl ? width - viewport.x : viewport.x };
}

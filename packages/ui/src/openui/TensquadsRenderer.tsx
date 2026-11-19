import { Renderer, type RendererProps } from "@openuidev/react-lang";
import type { Locale } from "../schemas/index.js";
import { ActionHandlerContext, type ActionHandler } from "./action-handler.js";
import { createTensquadsLibrary } from "./library.js";

export type TensquadsRendererProps = Omit<RendererProps, "response" | "library" | "onAction"> & {
	stream: string | null;
	locale?: Locale;
	onAction?: ActionHandler;
};

export function TensquadsRenderer({ stream, locale = "en", onAction, ...props }: TensquadsRendererProps) {
	return (
		<ActionHandlerContext value={onAction}>
			<Renderer {...props} onAction={onAction} response={stream} library={createTensquadsLibrary(locale)} />
		</ActionHandlerContext>
	);
}

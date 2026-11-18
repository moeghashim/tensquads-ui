import { Renderer, type RendererProps } from "@openuidev/react-lang";
import type { Locale } from "../schemas/index.js";
import { createTensquadsLibrary } from "./library.js";

export interface TensquadsRendererProps {
	stream: string | null;
	locale?: Locale;
	onError?: RendererProps["onError"];
}

export function TensquadsRenderer({ stream, locale = "en", onError }: TensquadsRendererProps) {
	return <Renderer response={stream} library={createTensquadsLibrary(locale)} onError={onError} />;
}

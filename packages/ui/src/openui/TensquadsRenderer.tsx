import { Renderer } from "@openuidev/react-lang";
import type { Locale } from "../schemas/index.js";
import { createTensquadsLibrary } from "./library.js";

export interface TensquadsRendererProps {
	stream: string | null;
	locale?: Locale;
}

export function TensquadsRenderer({ stream, locale = "en" }: TensquadsRendererProps) {
	return <Renderer response={stream} library={createTensquadsLibrary(locale)} />;
}

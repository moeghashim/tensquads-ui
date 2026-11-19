import { Renderer, type RendererProps } from "@openuidev/react-lang";
import type { Locale } from "../schemas/index.js";
import { createTensquadsLibrary } from "./library.js";

export type TensquadsRendererProps = Omit<RendererProps, "response" | "library"> & {
	stream: string | null;
	locale?: Locale;
};

export function TensquadsRenderer({ stream, locale = "en", ...props }: TensquadsRendererProps) {
	return <Renderer {...props} response={stream} library={createTensquadsLibrary(locale)} />;
}

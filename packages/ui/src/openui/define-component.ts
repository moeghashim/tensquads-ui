import {
	type ComponentRenderer,
	type DefinedComponent,
	defineComponent as defineOpenUIComponent,
} from "@openuidev/react-lang";
import type { z } from "zod/v4";

export function defineComponent<T extends z.ZodObject>(definition: {
	name: string;
	description: string;
	props: T;
	component: ComponentRenderer<z.infer<T>>;
}): DefinedComponent<T> {
	return defineOpenUIComponent(definition);
}

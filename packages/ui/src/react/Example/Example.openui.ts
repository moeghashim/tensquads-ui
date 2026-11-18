import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Example } from "./Example.js";

export const ExampleOpenUI = defineComponent({
	name: "Example",
	description: "A placeholder component used to verify the OpenUI round-trip path.",
	props: z.object({ message: z.string().describe("Short text to display") }),
	component: ({ props }) => createElement(Example, { message: props.message }),
});

registerComponent(ExampleOpenUI);

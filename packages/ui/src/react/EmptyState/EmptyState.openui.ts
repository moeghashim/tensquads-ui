import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { EmptyState } from "./EmptyState.js";

export const EmptyStateOpenUI = defineComponent({
	name: "EmptyState",
	description: "A quiet empty view that explains what will fill the space.",
	props: z.object({ title: z.string(), description: z.string() }),
	component: ({ props }) => createElement(EmptyState, props),
});
registerComponent(EmptyStateOpenUI);

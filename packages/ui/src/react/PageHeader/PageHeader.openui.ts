import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { PageHeader } from "./PageHeader.js";

export const PageHeaderOpenUI = defineComponent({
	name: "PageHeader",
	description: "A page heading with a title, one subtitle, optional metadata and actions.",
	props: z.object({
		title: z.string().min(1),
		subtitle: z.string().optional(),
		meta: z.string().optional(),
		actions: z.string().optional(),
		headingLevel: z.union([z.literal(1), z.literal(2)]).default(1),
	}),
	component: ({ props }) => createElement(PageHeader, props),
});

registerComponent(PageHeaderOpenUI);

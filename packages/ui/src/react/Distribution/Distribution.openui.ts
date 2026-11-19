import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Distribution } from "./Distribution.js";

export const DistributionOpenUI = defineComponent({
	name: "Distribution",
	description: "A whole split into ranked grey parts.",
	props: z.object({
		parts: z.array(z.object({ label: z.string(), value: z.number().nonnegative() })),
		label: z.string().optional(),
	}),
	component: ({ props }) => createElement(Distribution, props),
});
registerComponent(DistributionOpenUI);

import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { ChatLauncher } from "./ChatLauncher.js";

export const ChatLauncherOpenUI = defineComponent({
	name: "ChatLauncher",
	description: "A floating button that opens the assistant chat.",
	props: z.object({
		label: z.string().optional(),
		waiting: z.number().int().nonnegative().optional(),
		locale: z.enum(["en", "ar"]).default("en"),
	}),
	component: function OpenUIChatLauncher({ props }) {
		return createElement(ChatLauncher, props);
	},
});

registerComponent(ChatLauncherOpenUI);

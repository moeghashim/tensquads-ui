import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "./Menu.js";

const menuItemSchema = z.object({
	label: z.string().min(1).describe("Visible action label"),
	value: z.string().min(1).describe("Selected action value returned to the client"),
	danger: z.boolean().default(false).describe("Whether this is a destructive action"),
	disabled: z.boolean().default(false).describe("Whether this action is unavailable"),
});

const menuPropsSchema = z.object({
	label: z.string().min(1).describe("Accessible trigger label"),
	items: z.array(menuItemSchema).min(1).max(6).describe("Actions shown in the menu"),
});

export const MenuOpenUI = defineComponent({
	name: "Menu",
	description:
		"A button menu with up to six serializable actions. Each action has a label and value, with optional danger and disabled states. A destructive action is placed last after a separator.",
	props: menuPropsSchema,
	component: ({ props }) => {
		const { label, items: actions } = menuPropsSchema.parse(props);
		const dangerItems = actions.filter((item) => item.danger);
		if (dangerItems.length > 1) throw new Error("Menu supports one destructive item");
		const dangerItem = dangerItems[0];
		const items = actions.filter((item) => !item.danger);
		const children = [
			...items.map((item) =>
				createElement(MenuItem, { key: item.value, value: item.value, disabled: item.disabled }, item.label),
			),
			...(dangerItem
				? [
						createElement(MenuSeparator, { key: "danger-separator" }),
						createElement(
							MenuItem,
							{
								key: dangerItem.value,
								value: dangerItem.value,
								disabled: dangerItem.disabled,
								destructive: true,
							},
							dangerItem.label,
						),
					]
				: []),
		];
		return createElement(
			Menu,
			{
				onAction: (value) => {
					document.dispatchEvent(new CustomEvent("tensquads:menu-action", { detail: { value } }));
				},
			},
			createElement(MenuTrigger, { "aria-label": label }, label),
			createElement(MenuContent, { side: "bottom", align: "start" }, ...children),
		);
	},
});

registerComponent(MenuOpenUI);

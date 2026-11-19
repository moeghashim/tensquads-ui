import { useRenderNode } from "@openuidev/react-lang";
import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Card } from "./Card.js";

export const CardOpenUI = defineComponent({
	name: "Card",
	description: "A dashboard panel with a title, one body, optional count and footer.",
	props: z.object({
		title: z.string().min(1),
		subtitle: z.string().optional(),
		count: z.string().optional(),
		children: z.array(z.unknown()).describe("One body, such as a row of StatTile components"),
		footer: z.string().optional(),
		flush: z.boolean().default(false),
		variant: z.enum(["default", "inset"]).default("default"),
		layout: z
			.enum(["default", "stat-grid"])
			.default("default")
			.describe("Use stat-grid for a responsive row of StatTiles"),
	}),
	component: function OpenUICard({ props }) {
		const renderNode = useRenderNode();
		const { children, layout, ...cardProps } = props;
		const body = renderNode(children);
		return createElement(
			Card,
			cardProps,
			layout === "stat-grid" ? createElement("div", { className: "ts-stat-grid" }, body) : body,
		);
	},
});

registerComponent(CardOpenUI);

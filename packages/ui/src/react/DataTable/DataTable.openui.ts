import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { DataTable } from "./DataTable.js";

export const DataTableOpenUI = defineComponent({
	name: "DataTable",
	description: "A selectable table of records with labelled columns.",
	props: z.object({
		caption: z.string(),
		columns: z.array(
			z.object({
				key: z.string(),
				label: z.string(),
				align: z.enum(["start", "end"]).optional(),
				width: z.string().optional(),
				mono: z.boolean().optional(),
			}),
		),
		rows: z.array(z.object({ id: z.string(), cells: z.record(z.string(), z.string()) })),
	}),
	component: ({ props }) => createElement(DataTable, props),
});
registerComponent(DataTableOpenUI);

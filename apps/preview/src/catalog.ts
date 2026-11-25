import { getRegisteredComponents } from "../../../packages/ui/src/openui";

import type { ComponentName } from "./catalog-groups";

export { type ComponentName, catalogGroups } from "./catalog-groups";

export const openUIComponents = new Map(getRegisteredComponents().map(({ name, description }) => [name, description]));

export const reactOnlyComponents = [
	"Canvas",
	"Chat",
	"ChatReply",
	"CommandPalette",
	"Inspector",
	"MiniMap",
	"Node",
	"OwnerMessageView",
	"Palette",
	"Sidebar",
	"ThemeToggle",
	"Toolbar",
] as const satisfies readonly ComponentName[];

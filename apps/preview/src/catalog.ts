import { getRegisteredComponents } from "../../../packages/ui/src/openui";

export const catalogGroups = {
	actions: ["Button", "Menu", "Tooltip", "Chip", "SegmentedControl"],
	forms: ["Input", "Field", "Switch", "Form"],
	feedback: ["Badge", "Dialog", "EmptyState"],
	data: ["StatTile", "BarChart", "Bars", "Distribution", "DataTable", "Card"],
	chat: ["Chat", "ChatReply", "ChatLauncher", "ApprovalCard", "OwnerMessageView", "Squadmate"],
	app: ["PageHeader", "Sidebar", "ThemeToggle", "Toolbar", "CommandPalette"],
	workflow: ["Node", "Canvas", "Palette", "Inspector"],
} as const;

export type ComponentName = (typeof catalogGroups)[keyof typeof catalogGroups][number];

export const openUIComponents = new Map(getRegisteredComponents().map(({ name, description }) => [name, description]));

export const reactOnlyComponents = [
	"Canvas",
	"Chat",
	"ChatReply",
	"CommandPalette",
	"Inspector",
	"Node",
	"OwnerMessageView",
	"Palette",
	"Sidebar",
	"ThemeToggle",
	"Toolbar",
] as const satisfies readonly ComponentName[];

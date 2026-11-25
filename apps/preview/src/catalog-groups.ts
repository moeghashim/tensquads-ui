export const catalogGroups = {
	actions: ["Button", "Menu", "Tooltip", "Chip", "SegmentedControl"],
	forms: ["Input", "Field", "Switch", "Form"],
	feedback: ["Badge", "Dialog", "EmptyState"],
	data: ["StatTile", "BarChart", "Bars", "Distribution", "DataTable", "Card"],
	chat: ["Chat", "ChatReply", "ChatLauncher", "ApprovalCard", "OwnerMessageView", "Squadmate"],
	app: ["PageHeader", "Sidebar", "ThemeToggle", "Toolbar", "CommandPalette"],
	workflow: ["Node", "Canvas", "Palette", "Inspector", "MiniMap", "WorkflowCard"],
} as const;

export type ComponentName = (typeof catalogGroups)[keyof typeof catalogGroups][number];

export function componentDocumentName(name: string) {
	return name === "OwnerMessageView" ? "OwnerMessage" : name;
}

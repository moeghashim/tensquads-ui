import type { ActionEvent } from "@openuidev/react-lang";

export type ChatActionTurn = {
	role: "action";
	action: {
		name: string;
		source: string;
		values: Record<string, unknown>;
		summary: string;
	};
};

export type ChatTurn = { role: "user" | "assistant"; content: string } | ChatActionTurn;
export type ChatAction = ActionEvent & { sourceComponent?: string };

import { z } from "zod/v4";
import { WORKFLOW_KIND_FAMILY, WORKFLOW_KIND_ICON, WorkflowGraphSchema, WorkflowNodeKindSchema } from "./workflow.js";

export type { ChatAction, ChatActionTurn, ChatTurn } from "./chat.js";
export * from "./platform.js";
export type { WorkflowEdge, WorkflowGraph, WorkflowNode, WorkflowNodeFamily, WorkflowNodeKind } from "./workflow.js";
export { WORKFLOW_KIND_FAMILY, WORKFLOW_KIND_ICON, WorkflowGraphSchema, WorkflowNodeKindSchema };

export const LocaleSchema = z.enum(["en", "ar"]);
export type Locale = z.infer<typeof LocaleSchema>;

export const DirectionSchema = z.enum(["ltr", "rtl"]);
export type Direction = z.infer<typeof DirectionSchema>;

export const AgentSlugSchema = z.enum([
	"petra",
	"pisa",
	"kyoto",
	"rio",
	"zurich",
	"giza",
	"machu",
	"angkor",
	"delphi",
	"sydney",
	"greenwich",
	"alexandria",
	"venice",
]);
export type AgentSlug = z.infer<typeof AgentSlugSchema>;

export const AgentRoleSchema = z.enum([
	"master",
	"orders",
	"support",
	"marketing",
	"finance",
	"inventory",
	"market",
	"website",
	"analytics",
	"hr",
	"places",
	"catalog",
	"channels",
]);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

export const AGENT_ROLE_TO_SLUG = {
	master: "petra",
	orders: "pisa",
	support: "kyoto",
	marketing: "rio",
	finance: "zurich",
	inventory: "giza",
	market: "machu",
	website: "angkor",
	analytics: "delphi",
	hr: "sydney",
	places: "greenwich",
	catalog: "alexandria",
	channels: "venice",
} as const satisfies Record<AgentRole, AgentSlug>;

export const AGENT_SLUG_TO_ROLE = Object.fromEntries(
	Object.entries(AGENT_ROLE_TO_SLUG).map(([role, slug]) => [slug, role]),
) as { readonly [Slug in AgentSlug]: Extract<AgentRole, keyof typeof AGENT_ROLE_TO_SLUG> };

export const AgentStateSchema = z.enum([
	"blocked",
	"checking",
	"done",
	"dropped",
	"escalated",
	"idle",
	"planning",
	"running",
	"sentback",
	"waiting",
]);
export type AgentState = z.infer<typeof AgentStateSchema>;

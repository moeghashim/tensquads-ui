import { z } from "zod/v4";

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

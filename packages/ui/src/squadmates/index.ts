import { Squadmate as SquadmateImage } from "../react/Squadmate/Squadmate.js";
import type { Squadmate as SquadmateRecord } from "./roster.js";

export type { SquadmateProps } from "../react/Squadmate/Squadmate.js";
export type Squadmate = SquadmateRecord;
export const Squadmate = SquadmateImage;

export type { SquadmateDrawState } from "./draw.js";
export { SQUADMATE_CSS, squadmateMarkup, UnknownSquadmateError, UnknownSquadmateStateError } from "./draw.js";
export type { AgentLoopState, SquadmateId, SquadmateProp } from "./roster.js";
export { AGENT_LOOP_STATES, characterName, SQUADMATES, shownRoleTag } from "./roster.js";

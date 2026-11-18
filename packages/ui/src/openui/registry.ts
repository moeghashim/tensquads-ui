import "../react/Button/Button.openui.js";
import "../react/Badge/Badge.openui.js";
import "../react/Squadmate/Squadmate.openui.js";
import type { DefinedComponent } from "@openuidev/react-lang";
import { getRegisteredDefinitions } from "./registration-store.js";

export function getRegisteredComponents(): readonly DefinedComponent[] {
	return getRegisteredDefinitions();
}

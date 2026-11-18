import "../react/Example/Example.openui.js";
import type { DefinedComponent } from "@openuidev/react-lang";
import { getRegisteredDefinitions } from "./registration-store.js";

export function getRegisteredComponents(): readonly DefinedComponent[] {
	return getRegisteredDefinitions();
}

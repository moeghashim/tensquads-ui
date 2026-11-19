import "../react/Button/Button.openui.js";
import "../react/Badge/Badge.openui.js";
import "../react/Dialog/Dialog.openui.js";
import "../react/Field/Field.openui.js";
import "../react/Form/Form.openui.js";
import "../react/Input/Input.openui.js";
import "../react/Chip/Chip.openui.js";
import "../react/Squadmate/Squadmate.openui.js";
import "../react/Menu/Menu.openui.js";
import "../react/Switch/Switch.openui.js";
import "../react/SegmentedControl/SegmentedControl.openui.js";
import "../react/Tooltip/Tooltip.openui.js";
import "../react/Card/Card.openui.js";
import "../react/PageHeader/PageHeader.openui.js";
import "../react/StatTile/StatTile.openui.js";
import type { DefinedComponent } from "@openuidev/react-lang";
import { getRegisteredDefinitions } from "./registration-store.js";

export function getRegisteredComponents(): readonly DefinedComponent[] {
	return getRegisteredDefinitions();
}

import type { CommandPaletteGroup } from "@tensquads/ui/react";
import { createContext } from "react";

export const SitePageCommands = createContext<CommandPaletteGroup | undefined>(undefined);

/** The header search button fires this on pages that own ⌘K, such as the Nodes builder. */
export const siteSearchEvent = "tensquads:site-search";

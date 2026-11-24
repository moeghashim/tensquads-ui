import type { CommandPaletteGroup } from "@tensquads/ui/react";
import { createContext } from "react";

export const SitePageCommands = createContext<CommandPaletteGroup | undefined>(undefined);

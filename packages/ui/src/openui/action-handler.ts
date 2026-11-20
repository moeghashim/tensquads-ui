import type { ActionEvent } from "@openuidev/react-lang";
import { createContext } from "react";

// biome-ignore lint/suspicious/noConfusingVoidType: Preserve support for async handlers that return no value or a boolean veto.
export type ActionHandler = (event: ActionEvent) => void | boolean | Promise<void | boolean>;

export const ActionHandlerContext = createContext<ActionHandler | undefined>(undefined);

import type { ActionEvent } from "@openuidev/react-lang";
import { createContext } from "react";

export type ActionHandler = (event: ActionEvent) => void | boolean | Promise<void | boolean>;

export const ActionHandlerContext = createContext<ActionHandler | undefined>(undefined);

import { createContext } from "react";
import type { Locale } from "../schemas/index.js";

export const OpenUILocaleContext = createContext<Locale>("en");

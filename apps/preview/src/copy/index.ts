import ar from "./ar";
import en from "./en";

export const siteCopy = { en, ar };
export type SiteLocale = keyof typeof siteCopy;

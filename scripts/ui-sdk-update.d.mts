export function selectTargetVersion(tags: Record<string, string>): string;
export function compare(left: string, right: string): number;
export function makeBody(version: string, priorEntries: string[], nextEntries: string[], releases: { name: string; url: string; body: string }[]): string;

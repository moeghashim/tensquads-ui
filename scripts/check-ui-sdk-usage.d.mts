export function findUiSdkImports(files: Record<string, string>): { file: string; specifier: string }[];
export function validateUiSdkImports(imports: { file: string; specifier: string }[], publicEntries: Record<string, Set<string>>): string[];

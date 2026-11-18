import { execFileSync } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = new URL("../packages/ui/dist/", import.meta.url);

await rm(dist, { recursive: true, force: true });
execFileSync("npx", ["tsc", "-p", "tsconfig.build.json"], { cwd: root, stdio: "inherit" });
await mkdir(new URL("tokens/", dist), { recursive: true });
await mkdir(new URL("styles/", dist), { recursive: true });
await mkdir(new URL("fonts/", dist), { recursive: true });
await cp(new URL("../packages/ui/src/tokens/tokens.css", import.meta.url), new URL("tokens/tokens.css", dist));
await cp(new URL("../packages/ui/src/styles/", import.meta.url), new URL("styles/", dist), { recursive: true });
await cp(new URL("../packages/ui/src/fonts.css", import.meta.url), new URL("fonts.css", dist));
await cp(new URL("../packages/ui/src/fonts/", import.meta.url), new URL("fonts/", dist), { recursive: true });

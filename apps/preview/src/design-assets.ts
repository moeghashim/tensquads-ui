import logoLight from "../../../design/logo/logo.svg?url";
import logoDark from "../../../design/logo/logo-dark.svg?url";
import wordmarkLight from "../../../design/logo/wordmark.svg?url";
import wordmarkDark from "../../../design/logo/wordmark-dark.svg?url";

const assets = import.meta.glob<string>("../../../design/{logo,mascots/svg,mascots/states}/*.{svg,png}", {
	eager: true,
	query: "?url",
	import: "default",
});

export const signal = { light: logoLight, dark: logoDark };
export const wordmark = { light: wordmarkLight, dark: wordmarkDark };

export function designAsset(path: string) {
	const url = assets[`../../../design/${path}`];
	if (!url) throw new Error(`Missing design asset: ${path}`);
	return url;
}

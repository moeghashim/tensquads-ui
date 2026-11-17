import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const namedColors = new Set(
	`
	 aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood
	 cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray
	 darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
	 darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
	 firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
	 hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
	 lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
	 lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid
	 mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream
	 mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise
	 palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown
	 salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan
	 teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen
`
		.trim()
		.split(/\s+/),
);

export function stripCommentsAndStrings(css) {
	return css.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, " ");
}

export function findRawColors(css) {
	const source = stripCommentsAndStrings(css);
	const violations = [];
	for (const declaration of source.matchAll(/(?:^|[;{}])\s*([\w-]+)\s*:\s*([^;{}]*)/gm)) {
		const [, property, value] = declaration;
		if (/#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(/i.test(value)) {
			violations.push(`${property}: ${value.trim()}`);
			continue;
		}
		const identifiers =
			value
				.replace(/var\(\s*--[\w-]+/gi, "var(")
				.toLowerCase()
				.match(/[a-z][a-z-]*/g) ?? [];
		if (identifiers.some((name) => namedColors.has(name))) {
			violations.push(`${property}: ${value.trim()}`);
		}
	}
	return violations;
}

export async function checkDirectory(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const failures = [];
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) failures.push(...(await checkDirectory(path)));
		else if (entry.isFile() && entry.name.endsWith(".css")) {
			const violations = findRawColors(await readFile(path, "utf8"));
			for (const violation of violations) failures.push(`${path}: ${violation}`);
		}
	}
	return failures;
}

async function run() {
	const stylesDirectory = fileURLToPath(new URL("../packages/ui/src/styles/", import.meta.url));
	const failures = await checkDirectory(stylesDirectory);
	if (failures.length) {
		console.error("Raw color literals found in UI styles. Use Agent-UI color tokens instead:");
		for (const failure of failures) console.error(`- ${failure}`);
		process.exitCode = 1;
	} else {
		console.log("UI styles use no raw color literals.");
	}
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await run();

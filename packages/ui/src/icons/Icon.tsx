import { ICON_PATHS, type IconName } from "./icons.js";

export type IconSize = 14 | 16 | 28;

export type IconProps = {
	name: IconName;
	size?: IconSize;
};

export function Icon({ name, size = 16 }: IconProps) {
	return (
		<svg
			viewBox="0 0 16 16"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d={ICON_PATHS[name]} />
		</svg>
	);
}

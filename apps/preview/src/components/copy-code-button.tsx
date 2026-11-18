import { Button } from "@tensquads/ui/react";
import { useState } from "react";

export type CopyCodeButtonProps = {
	code: string;
	copyLabel: string;
	copiedLabel: string;
	failedLabel: string;
};

export function CopyCodeButton({ code, copyLabel, copiedLabel, failedLabel }: CopyCodeButtonProps) {
	const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

	const copyCode = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setStatus("copied");
			window.setTimeout(() => setStatus("idle"), 1600);
		} catch {
			setStatus("failed");
		}
	};

	return (
		<div className="copy-code-control">
			<Button
				variant="soft"
				size="sm"
				aria-label={status === "copied" ? copiedLabel : copyLabel}
				onClick={() => void copyCode()}
			>
				{status === "copied" ? copiedLabel : copyLabel}
			</Button>
			<span role="status" aria-live="polite" className="copy-code-control__status">
				{status === "failed" ? failedLabel : status === "copied" ? copiedLabel : ""}
			</span>
		</div>
	);
}

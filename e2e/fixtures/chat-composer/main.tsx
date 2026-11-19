import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ChatComposer } from "../../../packages/ui/src/react/index.js";

function Example() {
	const locale = new URLSearchParams(location.search).get("locale") === "ar" ? "ar" : "en";
	const [busy, setBusy] = useState(true);
	const [stops, setStops] = useState(0);
	const [messages, setMessages] = useState<string[]>([]);
	return (
		<main lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
			<ChatComposer
				locale={locale}
				busy={busy}
				onStop={() => {
					setStops((count) => count + 1);
					setBusy(false);
				}}
				onSend={(message) => setMessages((sent) => [...sent, message])}
			/>
			<output aria-label="Stop count">{stops}</output>
			<output aria-label="Sent messages">{JSON.stringify(messages)}</output>
		</main>
	);
}

createRoot(document.getElementById("root")!).render(<Example />);

import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	ChatAssistantMessage,
	ChatComposer,
	ChatEmptyState,
	ChatError,
	ChatLog,
	ChatStep,
	ChatUserMessage,
	ChatWorking,
} from "./Chat.js";

let notifyResize: () => void;
const disconnect = vi.fn();
beforeEach(() => {
	disconnect.mockClear();
	vi.stubGlobal(
		"ResizeObserver",
		class {
			constructor(callback: () => void) {
				notifyResize = callback;
			}
			observe() {}
			disconnect = disconnect;
		},
	);
});
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("Chat surface", () => {
	it("renders user messages as bubbles and replies as plain step content", () => {
		const { getByRole, getByText } = render(
			<ChatLog>
				<ChatUserMessage>Help me plan</ChatUserMessage>
				<ChatStep name="Planner" reply={<p>Here is a plan</p>} />
			</ChatLog>,
		);
		expect(getByRole("log")).toHaveAttribute("aria-live", "polite");
		expect(getByRole("log")).toHaveAttribute("tabindex", "0");
		expect(getByText("Help me plan")).toHaveClass("ts-chat__user-message");
		expect(getByText("Here is a plan").parentElement).toHaveClass("ts-chat__reply");
	});

	it.each(["ltr", "rtl"])("follows nested reply growth only while pinned in %s", (dir) => {
		function Reply() {
			const [expanded, setExpanded] = useState(false);
			return (
				<button type="button" onClick={() => setExpanded(true)}>
					{expanded ? "Expanded reply" : "Expand reply"}
				</button>
			);
		}
		const onScroll = vi.fn();
		const { getByRole, unmount } = render(
			<ChatLog dir={dir} onScroll={onScroll}>
				<ChatStep name="Planner" reply={<Reply />} />
			</ChatLog>,
		);
		const log = getByRole("log");
		let height = 400;
		Object.defineProperties(log, {
			scrollHeight: { get: () => height },
			clientHeight: { value: 100 },
		});
		act(() => notifyResize());
		expect(log.scrollTop).toBe(400);
		log.scrollTop = 300;
		fireEvent.scroll(log);
		fireEvent.click(getByRole("button", { name: "Expand reply" }));
		height = 500;
		act(() => notifyResize());
		expect(log.scrollTop).toBe(500);
		log.scrollTop = 100;
		fireEvent.scroll(log);
		height = 600;
		act(() => notifyResize());
		expect(log.scrollTop).toBe(100);
		log.scrollTop = 500;
		fireEvent.scroll(log);
		height = 700;
		act(() => notifyResize());
		expect(log.scrollTop).toBe(700);
		expect(onScroll).toHaveBeenCalledTimes(3);
		unmount();
		expect(disconnect).toHaveBeenCalled();
	});

	it("shows running, status and response id states", () => {
		const { getByText, container } = render(
			<ChatStep name="Research" status="Blocked" statusVariant="danger" responseId="resp_123" running />,
		);
		expect(getByText("Blocked")).toHaveClass("ts-chat__status--danger");
		expect(getByText("resp_123")).toHaveClass("ts-chat__response-id");
		expect(container.querySelector(".ts-chat__spinner")).toBeInTheDocument();
	});

	it("disables empty send and sends with Enter", () => {
		const onSend = vi.fn();
		const { getByRole } = render(<ChatComposer onSend={onSend} />);
		const input = getByRole("textbox", { name: "Message" });
		const send = getByRole("button", { name: "Send" });
		expect(send).toBeDisabled();
		fireEvent.input(input, { target: { value: "Hello" } });
		expect(send).toBeEnabled();
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSend).toHaveBeenCalledWith("Hello");
	});

	it("does not send during IME composition but sends after composition", () => {
		const onSend = vi.fn();
		const { getByRole } = render(<ChatComposer defaultValue="こんにちは" onSend={onSend} />);
		const input = getByRole("textbox", { name: "Message" });
		fireEvent.keyDown(input, { key: "Enter", isComposing: true });
		expect(onSend).not.toHaveBeenCalled();
		expect(input).toHaveValue("こんにちは");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSend).toHaveBeenCalledExactlyOnceWith("こんにちは");
		expect(input).toHaveValue("");
	});

	it("blocks sending while busy and exposes Stop", () => {
		const onSend = vi.fn();
		const onStop = vi.fn();
		const { getByRole } = render(<ChatComposer defaultValue="Hello" onSend={onSend} onStop={onStop} busy />);
		fireEvent.keyDown(getByRole("textbox"), { key: "Enter" });
		expect(onSend).not.toHaveBeenCalled();
		fireEvent.click(getByRole("button", { name: "Stop" }));
		expect(onStop).toHaveBeenCalledOnce();
	});

	it("renders the empty state and leaves composer focus available", () => {
		const { getByRole, getByText } = render(
			<>
				<ChatEmptyState />
				<ChatComposer onSend={() => undefined} />
			</>,
		);
		expect(getByText("Preview your agent")).toBeInTheDocument();
		const input = getByRole("textbox", { name: "Message" });
		input.focus();
		expect(input).toHaveFocus();
	});

	it("uses neutral Arabic labels by locale", () => {
		const { getByRole, getByText } = render(
			<>
				<ChatEmptyState locale="ar" />
				<ChatComposer locale="ar" onSend={() => undefined} busy onStop={() => undefined} />
			</>,
		);
		expect(getByText("معاينة الوكيل")).toBeInTheDocument();
		expect(getByRole("textbox", { name: "رسالة" })).toHaveAttribute("placeholder", "اكتب رسالة");
		expect(getByRole("button", { name: "إيقاف" })).toBeInTheDocument();
	});

	it("renders assistant replies without a name row", () => {
		const { getByText, container } = render(<ChatAssistantMessage>Plan ready</ChatAssistantMessage>);
		expect(getByText("Plan ready")).toHaveClass("ts-chat__assistant");
		expect(container.querySelector("strong")).toBeNull();
	});

	it("announces the working state with a default label per locale", () => {
		const { getByRole, rerender } = render(<ChatWorking glyph={<svg />} />);
		expect(getByRole("status")).toHaveTextContent("Working");
		rerender(<ChatWorking locale="ar" />);
		expect(getByRole("status")).toHaveTextContent("جارٍ العمل");
	});

	it("shows an error with its message and a working retry", () => {
		const onRetry = vi.fn();
		const { getByRole } = render(<ChatError onRetry={onRetry}>Sign in to use this demo.</ChatError>);
		expect(getByRole("alert")).toHaveTextContent("Something went wrong");
		expect(getByRole("alert")).toHaveTextContent("Sign in to use this demo.");
		fireEvent.click(getByRole("button", { name: "Retry" }));
		expect(onRetry).toHaveBeenCalledOnce();
	});

	it("uses the English placeholder by default", () => {
		const { getByRole } = render(<ChatComposer onSend={() => {}} />);
		expect(getByRole("textbox", { name: "Message" })).toHaveAttribute("placeholder", "Ask anything");
	});
});

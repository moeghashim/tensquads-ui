import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatComposer, ChatEmptyState, ChatLog, ChatStep, ChatUserMessage } from "./Chat.js";

afterEach(cleanup);

describe("Chat surface", () => {
	it("renders user messages as bubbles and replies as plain step content", () => {
		const { getByRole, getByText } = render(
			<ChatLog>
				<ChatUserMessage>Help me plan</ChatUserMessage>
				<ChatStep name="Planner" reply={<p>Here is a plan</p>} />
			</ChatLog>,
		);
		expect(getByRole("log")).toHaveAttribute("aria-live", "polite");
		expect(getByText("Help me plan")).toHaveClass("ts-chat__user-message");
		expect(getByText("Here is a plan").parentElement).toHaveClass("ts-chat__reply");
	});

	it("shows running, status and response id states", () => {
		const { getByText, container } = render(
			<ChatStep name="Research" status="Blocked" statusVariant="danger" responseId="resp_123" running />,
		);
		expect(getByText("Blocked")).toHaveClass("ts-chat__status--danger");
		expect(getByText("resp_123")).toHaveClass("ts-chat__response-id");
		expect(container.querySelector(".ts-chat__spinner")).toBeInTheDocument();
	});

	it("disables empty send, sends with Enter, and keeps Shift+Enter as a line break", () => {
		const onSend = vi.fn();
		const { getByRole } = render(<ChatComposer onSend={onSend} />);
		const input = getByRole("textbox", { name: "Message" });
		const send = getByRole("button", { name: "Send" });
		expect(send).toBeDisabled();
		fireEvent.input(input, { target: { value: "Hello" } });
		expect(send).toBeEnabled();
		fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
		expect(onSend).not.toHaveBeenCalled();
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSend).toHaveBeenCalledWith("Hello");
	});

	it("does not send during IME composition and exposes Stop while busy", () => {
		const onSend = vi.fn();
		const onStop = vi.fn();
		const { getByRole } = render(<ChatComposer defaultValue="こんにちは" onSend={onSend} onStop={onStop} busy />);
		const input = getByRole("textbox", { name: "Message" });
		fireEvent.keyDown(input, { key: "Enter", isComposing: true });
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
});

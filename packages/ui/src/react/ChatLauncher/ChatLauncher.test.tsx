import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatLauncher } from "./ChatLauncher.js";

afterEach(cleanup);

describe("ChatLauncher", () => {
	it("names the waiting count and calls the host action", () => {
		const onClick = vi.fn();
		render(<ChatLauncher waiting={4} onClick={onClick} />);
		fireEvent.click(screen.getByRole("button", { name: "Ask Petra, 4 waiting" }));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("localizes its default accessible name", () => {
		render(<ChatLauncher locale="ar" />);
		expect(screen.getByRole("button", { name: "اسأل بيترا" })).toBeInTheDocument();
	});

	it("shows its count badge only for a positive count", () => {
		const { rerender } = render(<ChatLauncher waiting={0} />);
		expect(document.querySelector(".ts-chat-launcher__count")).toBeNull();
		rerender(<ChatLauncher waiting={2} />);
		expect(document.querySelector(".ts-chat-launcher__count")).toHaveTextContent("2");
	});
});

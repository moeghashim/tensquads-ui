import { runInNewContext } from "node:vm";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle, themeInitScript, themePreference } from "./ThemeToggle.js";

afterEach(() => {
	cleanup();
	themePreference.set("light");
	localStorage.clear();
	document.documentElement.removeAttribute("data-theme");
	vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
	it("names both controlled states and reports the opposite value", () => {
		const onValueChange = vi.fn();
		const onClick = vi.fn();
		const { rerender } = render(<ThemeToggle value="light" onValueChange={onValueChange} onClick={onClick} />);
		fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
		expect(onValueChange).toHaveBeenCalledWith("dark");
		expect(onClick).toHaveBeenCalledOnce();
		rerender(<ThemeToggle value="dark" onValueChange={onValueChange} locale="ar" />);
		fireEvent.click(screen.getByRole("button", { name: "التبديل إلى المظهر الفاتح" }));
		expect(onValueChange).toHaveBeenLastCalledWith("light");
		rerender(<ThemeToggle value="light" locale="ar" />);
		expect(screen.getByRole("button", { name: "التبديل إلى المظهر الداكن" })).toBeInTheDocument();
		rerender(<ThemeToggle value="dark" />);
		expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
	});

	it("allows labels to override localized copy", () => {
		render(<ThemeToggle value="light" labels={{ toDark: "Use dark" }} />);
		expect(screen.getByRole("button", { name: "Use dark" })).toBeInTheDocument();
	});

	it("does not touch browser preference state when controlled", () => {
		const setItem = vi.spyOn(Storage.prototype, "setItem");
		const getItem = vi.spyOn(Storage.prototype, "getItem");
		document.documentElement.removeAttribute("data-theme");
		render(<ThemeToggle value="dark" />);
		expect(document.documentElement).not.toHaveAttribute("data-theme");
		expect(setItem).not.toHaveBeenCalled();
		expect(getItem).not.toHaveBeenCalled();
	});

	it("toggles the uncontrolled preference, document attribute, and storage", () => {
		const { container } = render(<ThemeToggle />);
		fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
		expect(document.documentElement).toHaveAttribute("data-theme", "dark");
		expect(localStorage.getItem("tensquads.theme")).toBe("dark");
		expect(container.querySelector("button")).not.toHaveAttribute("aria-pressed");
	});

	it("uses the OS dark preference when storage has no value", async () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		);
		render(<ThemeToggle />);
		await screen.findByRole("button", { name: "Switch to light theme" });
		expect(document.documentElement).toHaveAttribute("data-theme", "dark");
		vi.unstubAllGlobals();
	});

	it("applies the init script and tolerates blocked localStorage", () => {
		const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
		Object.defineProperty(window, "localStorage", {
			configurable: true,
			get: () => {
				throw new Error("blocked");
			},
		});
		Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: true }) });
		runInNewContext(themeInitScript, window);
		expect(document.documentElement).toHaveAttribute("data-theme", "dark");
		Object.defineProperty(window, "localStorage", descriptor ?? { configurable: true, value: localStorage });
		vi.unstubAllGlobals();
	});
});

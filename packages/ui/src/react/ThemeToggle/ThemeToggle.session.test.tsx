import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ThemeToggle, themePreference } from "./ThemeToggle.js";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	localStorage.clear();
	document.documentElement.removeAttribute("data-theme");
});

it("follows the OS initially and preserves session choices across mounts with blocked storage", async () => {
	vi.stubGlobal(
		"matchMedia",
		vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	);
	vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
		throw new Error("blocked");
	});
	vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
		throw new Error("blocked");
	});
	render(<ThemeToggle />);
	await screen.findByRole("button", { name: "Switch to light theme" });
	expect(document.documentElement).toHaveAttribute("data-theme", "dark");
	fireEvent.click(screen.getByRole("button", { name: "Switch to light theme" }));
	expect(document.documentElement).toHaveAttribute("data-theme", "light");
	render(<ThemeToggle locale="ar" />);
	expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "التبديل إلى المظهر الداكن" })).toBeInTheDocument();
	expect(themePreference.get().value).toBe("light");
	cleanup();
	render(<ThemeToggle />);
	expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
	expect(document.documentElement).toHaveAttribute("data-theme", "light");
	act(() => {
		themePreference.set("dark");
	});
	expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
	act(() => {
		themePreference.set("light");
	});
	render(<ThemeToggle locale="ar" />);
	expect(screen.getByRole("button", { name: "التبديل إلى المظهر الداكن" })).toBeInTheDocument();
	expect(document.documentElement).toHaveAttribute("data-theme", "light");
});

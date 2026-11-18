import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TensquadsRenderer } from "../../openui/TensquadsRenderer.js";
import { Input } from "../Input/Input.js";
import {
	Field,
	FieldControl,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "../index.js";

afterEach(cleanup);

describe("Field", () => {
	it("connects label, description, and input while preserving UI SDK slots", () => {
		const { getByRole, getByText } = render(
			<Field name="email">
				<FieldLabel>Email</FieldLabel>
				<Input placeholder="name@example.com" />
				<FieldDescription>Used for account notices.</FieldDescription>
			</Field>,
		);
		const input = getByRole("textbox", { name: "Email" });
		expect(input).toHaveAttribute("data-slot", "input");
		expect(input).toHaveAttribute("name", "email");
		expect(input).toHaveAttribute("aria-describedby");
		expect(getByText("Used for account notices.")).toHaveAttribute("data-slot", "field-description");
		expect(getByText("Email")).toHaveAttribute("for", input.getAttribute("id"));
	});

	it("preserves the FieldControl part and connects it to the field label", () => {
		const { getByRole } = render(
			<Field name="city">
				<FieldLabel>City</FieldLabel>
				<FieldControl placeholder="City name" />
			</Field>,
		);
		const control = getByRole("textbox", { name: "City" });
		expect(control).toHaveAttribute("data-slot", "field-control");
		expect(control).toHaveClass("ts-field__control");
	});

	it("shows invalid and disabled states with an associated error", () => {
		const { container, getByRole, getByText } = render(
			<Field name="email" invalid disabled>
				<FieldLabel>Email</FieldLabel>
				<Input />
				<FieldError match>Email is required.</FieldError>
			</Field>,
		);
		const field = container.querySelector('[data-slot="field"]');
		expect(field).not.toBeNull();
		const input = getByRole("textbox", { name: "Email" });
		expect(field).toHaveAttribute("data-invalid");
		expect(field).toHaveAttribute("data-disabled");
		expect(input).toBeDisabled();
		expect(getByText("Email is required.")).toBeInTheDocument();
	});
});

describe("OpenUI streamed values", () => {
	it.each(["en", "ar"] as const)("updates streamed text and preserves edits in %s", (locale) => {
		const stream = (value: string) =>
			`root = Field("Search", "query", "Find", "${value}")`.replace("${value}", value);
		const { getByRole, rerender } = render(<TensquadsRenderer stream={stream("N").slice(0, -2)} locale={locale} />);
		const input = getByRole("textbox", { name: "Search" });
		expect(input).toHaveValue("N");
		rerender(<TensquadsRenderer stream={stream("Northstar")} locale={locale} />);
		expect(getByRole("textbox", { name: "Search" })).toBe(input);
		expect(input).toHaveValue("Northstar");
		fireEvent.input(input, { target: { value: "My project" } });
		expect(input).toHaveValue("My project");
		rerender(<TensquadsRenderer stream={stream("Northstar")} locale={locale} />);
		expect(input).toHaveValue("My project");
		rerender(<TensquadsRenderer stream={stream("")} locale={locale} />);
		expect(input).toHaveValue("");
	});
});

describe("Field set parts", () => {
	it.each(["ltr", "rtl"])("names, disables, and enables related fields in %s", async (dir) => {
		const composition = (disabled: boolean) => (
			<FieldSet
				disabled={disabled}
				dir={dir}
				data-testid="set"
				className={(state) => (state.disabled ? "disabled" : "enabled")}
				render={<fieldset form="profile" />}
			>
				<FieldLegend
					render={<div />}
					className={(state) => (state.disabled ? "disabled-legend" : "enabled-legend")}
				>
					Address
				</FieldLegend>
				<FieldDescription>Delivery address</FieldDescription>
				<FieldGroup data-testid="fields" render={<section />} className={() => "fields"}>
					<Field name="city">
						<FieldLabel>City</FieldLabel>
						<Input defaultValue="Chicago" />
					</Field>
					<Field name="postal">
						<FieldLabel>Postal code</FieldLabel>
						<FieldControl defaultValue="60601" />
					</Field>
				</FieldGroup>
			</FieldSet>
		);
		const { getByRole, findByRole, getByText, getByTestId, rerender } = render(composition(true));
		const group = await findByRole("group", { name: "Address" });
		expect(group).toHaveAttribute("data-slot", "field-set");
		expect(group).toHaveAttribute("dir", dir);
		expect(group).toHaveAttribute("form", "profile");
		await waitFor(() => expect(group).toHaveAccessibleDescription("Delivery address"));
		expect(group).toHaveClass("ts-field-set", "disabled");
		expect(getByText("Address").tagName).toBe("DIV");
		expect(getByText("Address")).toHaveAttribute("data-slot", "field-legend");
		expect(getByText("Address")).toHaveClass("ts-field-legend", "disabled-legend");
		expect(getByTestId("fields").tagName).toBe("SECTION");
		expect(getByTestId("fields")).toHaveAttribute("data-slot", "field-group");
		expect(getByTestId("fields")).toHaveClass("ts-field-group", "fields");
		for (const name of ["City", "Postal code"]) expect(getByRole("textbox", { name })).toBeDisabled();
		rerender(composition(false));
		for (const name of ["City", "Postal code"]) expect(getByRole("textbox", { name })).toBeEnabled();
		expect(group).toHaveClass("enabled");
		expect(getByText("Address")).toHaveClass("enabled-legend");
		expect(getByRole("textbox", { name: "City" })).toHaveValue("Chicago");
	});
});

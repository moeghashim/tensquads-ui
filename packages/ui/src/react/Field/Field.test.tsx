import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "../Input/Input.js";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./Field.js";

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

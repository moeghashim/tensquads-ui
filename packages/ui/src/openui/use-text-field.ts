import { useFormValue } from "./use-form-value.js";

export function useTextField(name: string, defaultValue: string, componentType: string) {
	return useFormValue(name, defaultValue, componentType);
}

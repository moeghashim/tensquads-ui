import { useFormName, useIsStreaming, useSetFieldValue } from "@openuidev/react-lang";
import { useEffect, useState } from "react";

export function useTextField(name: string, defaultValue: string, componentType: string) {
	const formName = useFormName();
	const setFieldValue = useSetFieldValue();
	const [value, setValue] = useState(defaultValue);
	useEffect(() => {
		setValue(defaultValue);
		if (formName) setFieldValue(formName, componentType, name, defaultValue, false);
	}, [formName, componentType, name, defaultValue, setFieldValue]);
	return {
		value,
		onValueChange: (next: string) => {
			setValue(next);
			if (formName) setFieldValue(formName, componentType, name, next, true);
		},
		isStreaming: useIsStreaming(),
	};
}

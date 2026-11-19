import { useFormName, useIsStreaming, useSetFieldValue } from "@openuidev/react-lang";
import { useCallback, useEffect, useRef, useState } from "react";

export function useFormValue<T extends string | boolean>(
	name: string,
	defaultValue: T,
	componentType: string,
	preserveUserChanges = false,
) {
	const formName = useFormName();
	const setFieldValue = useSetFieldValue();
	const userChanged = useRef(false);
	const [value, setValue] = useState<T>(defaultValue);
	useEffect(() => {
		if (!preserveUserChanges || !userChanged.current) {
			setValue(defaultValue);
			if (formName) setFieldValue(formName, componentType, name, defaultValue, false);
		}
	}, [formName, componentType, name, defaultValue, preserveUserChanges, setFieldValue]);
	const onValueChange = useCallback(
		(next: T) => {
			userChanged.current = true;
			setValue(next);
			if (formName) setFieldValue(formName, componentType, name, next, true);
		},
		[formName, componentType, name, setFieldValue],
	);
	return { value, onValueChange, isStreaming: useIsStreaming() };
}

import type { DefinedComponent } from "@openuidev/react-lang";

// OpenUI components have different inferred props schemas in this shared registry.
// biome-ignore lint/suspicious/noExplicitAny: The library accepts a heterogeneous component list.
type RegisteredComponent = DefinedComponent<any>;
const registeredComponents = new Map<string, RegisteredComponent>();

export function registerComponent(component: RegisteredComponent): void {
	registeredComponents.set(component.name, component);
}

export function getRegisteredDefinitions(): readonly RegisteredComponent[] {
	return [...registeredComponents.values()];
}

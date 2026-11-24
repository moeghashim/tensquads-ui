import { createFileRoute } from "@tanstack/react-router";
import { BuilderRoute } from "../components/nodes/builder";

export const Route = createFileRoute("/nodes/")({
	component: () => <BuilderRoute id="support" />,
});

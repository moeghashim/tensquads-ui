import { Squadmate, squadmateStateLabel } from "@tensquads/ui/react";
import type { AgentSlug, AgentState } from "@tensquads/ui/schemas";
import { AGENT_LOOP_STATES } from "@tensquads/ui/squadmates";
import type { Locale } from "../state";

const states: AgentState[] = ["idle", ...AGENT_LOOP_STATES.map(({ id }) => id)];

export function SquadmateStates({ agent, locale, size }: { agent: AgentSlug; locale: Locale; size?: number }) {
	return (
		<div className="squadmate-state-grid">
			{states.map((state) => (
				<figure key={state}>
					<span aria-hidden="true">
						<Squadmate agent={agent} state={state} locale={locale} size={size} />
					</span>
					<figcaption>{squadmateStateLabel(state, locale)}</figcaption>
				</figure>
			))}
		</div>
	);
}

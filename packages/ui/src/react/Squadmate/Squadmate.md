# Squadmate

Import `Squadmate` and the `SquadmateProps` type from `@tensquads/ui/squadmates` or `@tensquads/ui/react`. The component renders an accessible agent image. It accepts an `agent` slug, an `AgentState`, a square pixel `size` (default `64`), and a `locale` for the accessible name (default `en`). The image is not interactive and is not in the tab order.

The component takes a character slug such as `petra`. The roster and drawing APIs in `@tensquads/ui/squadmates` use role IDs such as `master`. Use `AGENT_ROLE_TO_SLUG` and `AGENT_SLUG_TO_ROLE` from `@tensquads/ui/schemas` to convert between them. That entry also exports `AgentRoleSchema`, `AgentSlugSchema`, and `AgentStateSchema` with their inferred types.

`SQUADMATES` contains the roster. `AGENT_LOOP_STATES` contains the loop states; `SquadmateDrawState` also includes `idle`. `squadmateMarkup(imageId, state, size)` returns SVG markup. It throws `UnknownSquadmateError` for an unknown role ID and `UnknownSquadmateStateError` for an unknown state. Sizes below 64 px show the upper body; sizes of 64 px or more show the whole mascot. `SQUADMATE_CSS` contains optional blink styles for inline markup and disables the animation for reduced motion. The React image does not include those styles.

The image name contains the localized character name and state. For example, English `Petra, Planning` and Arabic `بترا، تخطيط`.

Arabic names follow the website copy in `tensquads-website/src/components/home/copy.ar.ts`. English names follow its `copy.en.ts` entries and match the roster. Arabic state labels follow PLAN.md D18.

Mascot palettes and artwork colours are drawing source data in `packages/ui/src/squadmates/mascots.ts`. State badge colours are in `packages/ui/src/squadmates/draw.ts`. These colours are embedded in SVG markup. Roster colour fields remain source metadata in `packages/ui/src/squadmates/roster.ts`. They are not component CSS tokens.

OpenUI is useful when an agent needs to include an identified squadmate image in a generated response. The definition exposes the same props and validates them with shared schemas.

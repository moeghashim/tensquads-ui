# Squadmate

Import `Squadmate` and the `SquadmateProps` type from `@tensquads/ui/squadmates` or `@tensquads/ui/react`. The component renders an accessible agent image. It accepts an `agent` slug, an `AgentState`, a square pixel `size` (default `64`), and a `locale` for the accessible name (default `en`). The image is not interactive and is not in the tab order.

The component takes a character slug such as `petra`. The roster and drawing APIs in `@tensquads/ui/squadmates` use role IDs such as `master`. Use `AGENT_ROLE_TO_SLUG` and `AGENT_SLUG_TO_ROLE` from `@tensquads/ui/schemas` to convert between them. That entry also exports `AgentRoleSchema`, `AgentSlugSchema`, and `AgentStateSchema` with their inferred types.

`SQUADMATES` contains the roster. `AGENT_LOOP_STATES` contains the loop states; `SquadmateDrawState` also includes `idle`. `squadmateMarkup(imageId, state, size)` returns SVG markup. It throws `UnknownSquadmateError` for an unknown role ID and `UnknownSquadmateStateError` for an unknown state. Sizes below 64 px show a crop focused on the head; sizes of 64 px or more show the whole mascot. `SQUADMATE_CSS` contains optional blink styles for inline markup and disables the animation for reduced motion. The React image does not include those styles.

`SQUADMATE_PARTS` is exported from `@tensquads/ui/squadmates`. It lists the motion hook class names and their joints in the SVG markup. See its declaration in `packages/ui/src/squadmates/draw.ts` for the hook reference. The joint wrappers support CSS transforms with `transform-origin: 0 0`; shadow and badge transforms use `transform-box: fill-box`. An arm hook can match separate groups for the arm and hand or prop, so apply the same motion to every matching group. `sm-raised` marks the raised left arm on Petra and Machu. Keep its shoulder rotation small so the arm does not cross the face. The hooks preserve the drawings and add no animation by themselves. Use inline SVG to style the parts; page CSS cannot target parts inside the React component's image.

The image name contains the localized character name and state. For example, English `Petra, Planning` and Arabic `بترا، تخطيط`.

Arabic names follow the website copy in `tensquads-website/src/components/home/copy.ar.ts`. English names follow its `copy.en.ts` entries and match the roster. Arabic state labels follow PLAN.md D18.

Mascot palettes and artwork colours are drawing source data in `packages/ui/src/squadmates/mascots.ts`. State badge colours are in `packages/ui/src/squadmates/draw.ts`. These colours are embedded in SVG markup. Roster colour fields remain source metadata in `packages/ui/src/squadmates/roster.ts`. They are not component CSS tokens.

OpenUI is useful when an agent needs to include an identified squadmate image in a generated response. The definition exposes the same props and validates them with shared schemas.

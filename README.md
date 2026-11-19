# tensquads-ui

`@tensquads/ui` is the shared React UI library for tensquads and بنّاء. It provides Agent-UI styled React components, Squadmate artwork, shared schemas, and an OpenUI Lang bridge for generated interfaces. Components support English and Arabic, including right-to-left layout.

Site: [tensquads-ui-preview.mohanadgh.workers.dev](https://tensquads-ui-preview.mohanadgh.workers.dev)

The home page at `/` shows installation, CSS setup, and an OpenUI fixture replay. Use Copy to copy the install command. If clipboard access fails, the page asks you to select and copy the command manually. Use Replay to restart the demo and reset edited controls to their fixture defaults. Use its language control to switch the rendered example between English and Arabic; changing the demo language restarts playback and resets edited controls to the selected language's fixture defaults. The demo reserves space for all messages and controls before revealing them, so playback does not shift the page layout. It runs in the browser without a model request and shows its final state immediately when reduced motion is enabled.

Browse the component gallery at `/components` and select a component name to open `/components/$name`. Header controls select the site language and theme. Navigation preserves the URL settings (`locale=en|ar`, `dir=ltr|rtl`, `theme=light|dark|system`); changing the site language also sets its direction. Use `/get-started` for the English and Arabic agent setup guide with copyable examples.

Open `/chat` to see a scripted Petra conversation routed through squadmates. The inline OpenUI form becomes an action turn, locks after approval, and the follow-up uses the submitted values. Replay restarts the conversation. Typed messages receive a fixed reply because the site has no live model or API key.

Each component page displays its reference from `packages/ui/src/react/<name>/<name>.md` and live examples. OpenUI components also show a fixture in the selected language. ChatReply uses a mixed Markdown and OpenUI fixture. `/components/Chat` shows a React conversation. Chat and ChatReply pages also include a local action-turn example; the Form page includes a local submission example. These examples use mock replies without network requests. See the [Chat contract](packages/ui/src/react/Chat/Chat.md) for its surface API and OpenUI boundary. Section labels follow the site language; the reference text remains in English and reads left to right, including on Arabic pages. The Usage section appears only when the reference document contains code samples. Use Copy beside a code block and wait for the visible confirmation. Expand Show fixture source to read or copy the OpenUI source where available. Previous and Next links follow component registry order, with Chat and then ChatReply appended after the registered components.

## Requirements

Use Node 26 and npm 11. The repository pins Node 26.13.1 and npm 11.20.0 in `mise.toml`. Install [mise](https://mise.jdx.dev/), then run `mise trust` and `mise install` in the repository root. Run npm commands with `mise exec -- npm …`.

## Install

Install from a pinned Git commit so the application gets a reproducible build:

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

The root package builds `packages/ui/dist` during installation. React and React DOM 19 are peer dependencies.

## Styles, locale, and theme

In the consumer's global stylesheet, declare the cascade order and import the library styles in this order:

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
```

Set the document language and direction on `<html>`. Choose `data-theme="light"` or `data-theme="dark"`, or omit it to follow the system theme.

```html
<html lang="ar" dir="rtl" data-theme="dark">
```

The font stylesheet bundles Inter, IBM Plex Sans Arabic, and JetBrains Mono. All three use the SIL Open Font License 1.1. See [font details](packages/ui/src/fonts/README.md).

## React components

Import components from `@tensquads/ui/react`. UI SDK supplies interactive behavior; the library adds Agent-UI styling.

```tsx
import { Button, Field, FieldLabel, Input } from "@tensquads/ui/react";

export function ProfileForm() {
  return (
    <form>
      <Field name="displayName">
        <FieldLabel>Display name</FieldLabel>
        <Input placeholder="Your name" />
      </Field>
      <Button type="submit">Save profile</Button>
    </form>
  );
}
```

Read [llms.txt](llms.txt) for the component contracts. The [tensquads-ui agent skill](.agents/skills/tensquads-ui/SKILL.md) explains component selection, composition, OpenUI, and backend use. It layers on the installed [UI SDK skill](.agents/skills/ui-sdk/SKILL.md).

## Squadmate

Use `Squadmate` to render a localized agent image. Its `agent` prop uses a character slug and its `state` uses an `AgentState` from `@tensquads/ui/schemas`.

```tsx
import { Squadmate } from "@tensquads/ui/squadmates";

export function AgentStatus() {
  return <Squadmate agent="petra" state="planning" locale="ar" size={64} />;
}
```

The same `/squadmates` entry exports the roster and SVG drawing helpers. Shared schemas also map between role IDs such as `master` and character slugs such as `petra`.

## OpenUI client

Render an OpenUI Lang text stream with `TensquadsRenderer` from `@tensquads/ui/openui`:

```tsx
import { TensquadsRenderer } from "@tensquads/ui/openui";

export function GeneratedPanel({ stream }: { stream: string | null }) {
  return <TensquadsRenderer stream={stream} locale="en" onError={(errors) => console.error(errors)} />;
}
```

The entry also exports `defineComponent`, `getRegisteredComponents`, and `createTensquadsLibrary(locale)`. Components register typed, serializable props. The renderer creates its library lazily and reports parse and render errors through `onError`.

For chat replies, use `ChatReply` from `@tensquads/ui/react`. See the [ChatReply contract](packages/ui/src/react/ChatReply/ChatReply.md) for usage and the supported reply format.

## OpenUI server

Use the server entry in a Worker route. It provides request validation and caps, locale-aware prompt construction, provider adapters, and streaming responses:

```ts
import { createTensquadsLibrary } from "@tensquads/ui/openui";
import {
  buildSystemPrompt,
  createAnthropicProvider,
  OpenUIServerError,
  readOpenUIRequest,
  streamOpenUIResponse,
} from "@tensquads/ui/openui/server";

export async function handleOpenUI(request: Request, apiKey: string): Promise<Response> {
  try {
    const { turns } = await readOpenUIRequest(request);
    if (turns.length === 0 || turns.at(-1)?.role !== "user") {
      return new Response("A user turn is required.", { status: 400 });
    }
    const locale = "en" as const;
    const system = buildSystemPrompt({ library: createTensquadsLibrary(locale), locale });
    const provider = createAnthropicProvider(apiKey);
    return await streamOpenUIResponse({ provider, system, turns, signal: request.signal });
  } catch (error) {
    if (error instanceof OpenUIServerError) {
      return Response.json({ error: error.code }, { status: error.status });
    }
    throw error;
  }
}
```

`readOpenUIRequest` limits the body to 16 KiB and the conversation to 12 turns. It accepts user and assistant turns with string content, plus structured `ChatActionTurn` entries. It converts each action into user text in the request locale, including its summary, source, name, and values. Values use JSON with sorted object keys for deterministic output. The server entry exports `ChatTurn` and `ChatActionTurn`; see [Chat](packages/ui/src/react/Chat/Chat.md) for client integration.

`streamOpenUIResponse` returns plain text and supports request cancellation. `createAnthropicProvider` defaults to `claude-haiku-5-5`; pass the API key from the server environment. The server entry also exports the `OpenUIStreamProvider` and request types. For Arabic, pass `locale: "ar"` to the library and prompt builder; the prompt includes Arabic rules and examples. Provide Arabic user content in the turns.

`buildSystemPrompt` defaults to `mode: "ui"` for OpenUI-only output. Pass `mode: "chat"` for replies rendered by ChatReply. Chat mode teaches the [ChatReply format](packages/ui/src/react/ChatReply/ChatReply.md), with rules and examples in the selected locale:

```ts
const system = buildSystemPrompt({ library: createTensquadsLibrary(locale), locale, mode: "chat" });
```

## Browser verification

Switch and SegmentedControl screenshots capture their default preview states before keyboard interaction. See [e2e/switch-segmented-control.spec.ts](e2e/switch-segmented-control.spec.ts) for the state assertions and capture order.

Tooltip artifacts use `tooltip-<locale>-<direction>-<theme>-<side>-<width>.png`. Each side opens and is captured separately. Coverage includes both directions for each locale and theme, with assertions for the [Tooltip placement contract](packages/ui/src/react/Tooltip/Tooltip.md).

## Commands

- `mise exec -- npm ci` installs root dependencies and builds the package.
- `mise exec -- npm run check` runs lint, types, design and generated-file checks, unit tests, and package checks.
- `mise exec -- npm run preview:install` installs the separate preview app dependencies.
- `mise exec -- npm run verify` runs checks, preview checks, and browser tests.
- `mise exec -- npm run docs` regenerates `llms.txt` from component docs.
- `mise exec -- npm run dev` starts the site locally.

See [PLAN.md](PLAN.md) for architecture and decisions.

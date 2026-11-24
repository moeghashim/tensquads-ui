# tensquads-ui

`@tensquads/ui` is the shared React UI library for tensquads and بنّاء. It provides Agent-UI styled React components, Squadmate artwork, shared schemas, and an OpenUI Lang bridge for generated interfaces. Components support English and Arabic, including right-to-left layout.

Site: [tensquads-ui-preview.mohanadgh.workers.dev](https://tensquads-ui-preview.mohanadgh.workers.dev)

## Components

The library ships these components today. Each row links to its reference and its live page. Coding agents: read [llms.txt](llms.txt) for the full index, then install the [tensquads-ui skill](.agents/skills/tensquads-ui/SKILL.md). Import from `@tensquads/ui/react`.

<!-- components:start -->

| Component | What it is | Live |
|---|---|---|
| [ApprovalCard](packages/ui/src/react/ApprovalCard/ApprovalCard.md) | An approval request with approve and decline actions. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/ApprovalCard) |
| [Badge](packages/ui/src/react/Badge/Badge.md) | A non-interactive label that names a state. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Badge) |
| [BarChart](packages/ui/src/react/BarChart/BarChart.md) | A vertical chart of values over time, with optional stacked series. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/BarChart) |
| [Bars](packages/ui/src/react/Bars/Bars.md) | Ranked horizontal bars or compact progress rows. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Bars) |
| [Button](packages/ui/src/react/Button/Button.md) | An accessible button that runs an action. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Button) |
| [Canvas](packages/ui/src/react/Canvas/Canvas.md) | `Canvas` renders a workflow graph in a pannable and zoomable surface. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Canvas) |
| [Card](packages/ui/src/react/Card/Card.md) | A dashboard panel with a title, one body, optional count and footer. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Card) |
| [Chat](packages/ui/src/react/Chat/Chat.md) | Chat parts build a chat surface: a scrolling log, user messages, agent replies, working and error lines, and a composer. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Chat) |
| [ChatLauncher](packages/ui/src/react/ChatLauncher/ChatLauncher.md) | A floating button that opens the assistant chat. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/ChatLauncher) |
| [ChatReply](packages/ui/src/react/ChatReply/ChatReply.md) | ChatReply renders Markdown text and fenced `openui` blocks in reading order. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/ChatReply) |
| [Chip](packages/ui/src/react/Chip/Chip.md) | A pill that opens an attached object such as an output schema or tool. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Chip) |
| [CommandPalette](packages/ui/src/react/CommandPalette/CommandPalette.md) | Provide flat groups, labels and an `onSelect` callback for each item. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/CommandPalette) |
| [DataTable](packages/ui/src/react/DataTable/DataTable.md) | A selectable table of records with labelled columns. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/DataTable) |
| [Dialog](packages/ui/src/react/Dialog/Dialog.md) | A focused modal window that explains a task and offers a clear action. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Dialog) |
| [Distribution](packages/ui/src/react/Distribution/Distribution.md) | A whole split into ranked grey parts. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Distribution) |
| [EmptyState](packages/ui/src/react/EmptyState/EmptyState.md) | A quiet empty view that explains what will fill the space. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/EmptyState) |
| [Field](packages/ui/src/react/Field/Field.md) | A labeled text input with optional description and validation message. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Field) |
| [Form](packages/ui/src/react/Form/Form.md) | A named form of text fields, switches, segmented controls, and optional action buttons. Submit sends their current values as a chat action. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Form) |
| [Input](packages/ui/src/react/Input/Input.md) | A named single-line text input. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Input) |
| [Inspector](packages/ui/src/react/Inspector/Inspector.md) | `Inspector` is a panel for editing the selected workflow node. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Inspector) |
| [Menu](packages/ui/src/react/Menu/Menu.md) | A button menu with up to six serializable actions. Each action has a label and value, with optional danger and disabled states. A destructive action is placed last after a separator. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Menu) |
| [Node](packages/ui/src/react/Node/Node.md) | `Node` displays one workflow step. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Node) |
| [OwnerMessageView](packages/ui/src/react/OwnerMessage/OwnerMessage.md) | Pass owner messages as `messages`. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/OwnerMessageView) |
| [PageHeader](packages/ui/src/react/PageHeader/PageHeader.md) | A page heading with a title, one subtitle, optional metadata and actions. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/PageHeader) |
| [Palette](packages/ui/src/react/Palette/Palette.md) | `Palette` lists workflow node kinds in named sections. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Palette) |
| [SegmentedControl](packages/ui/src/react/SegmentedControl/SegmentedControl.md) | An accessible exclusive selection control for two or more modes. Inside a Form it submits its selected value by name. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/SegmentedControl) |
| [Sidebar](packages/ui/src/react/Sidebar/Sidebar.md) | `Sidebar` is app navigation and has no OpenUI definition because navigation belongs to application chrome, not streamed content. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Sidebar) |
| [Squadmate](packages/ui/src/react/Squadmate/Squadmate.md) | An accessible image of a tensquads agent in a loop state. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Squadmate) |
| [StatTile](packages/ui/src/react/StatTile/StatTile.md) | A headline metric with an optional delta, unit, footnote and trend sparkline. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/StatTile) |
| [Switch](packages/ui/src/react/Switch/Switch.md) | An accessible switch for turning a setting on or off. Inside a Form it submits its named boolean value. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Switch) |
| [ThemeToggle](packages/ui/src/react/ThemeToggle/ThemeToggle.md) | It switches between light and dark themes. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/ThemeToggle) |
| [Toolbar](packages/ui/src/react/Toolbar/Toolbar.md) | It groups up to six icon controls in a floating toolbar. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Toolbar) |
| [Tooltip](packages/ui/src/react/Tooltip/Tooltip.md) | A short hint shown when a control receives focus or hover. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Tooltip) |

<!-- components:end -->

## Site

The home page introduces the design foundations and the shared UI library. Browse `/foundations` for tokens, Signal and the squadmates. The foundation pages read their values and assets from the synced design source.

Browse the grouped catalog at `/components`. Filter by component name, description or OpenUI support, then select a card to open `/components/$name`. Navigation preserves the URL settings (`locale=en|ar`, `dir=ltr|rtl`, `theme=light|dark|system`). Changing the site language also sets its direction. Use `/get-started` for the English and Arabic setup guide with copyable examples.

Copy the install command from the home page. If clipboard access fails, the page asks you to select and copy it manually. The Stream to screen section pairs seven OpenUI statements with the components they render. Replay and the demo language control reset the rendered controls to the selected fixture defaults. The demo runs in the browser and shows its final state immediately when reduced motion is enabled.

Open site search with the header Search button, `⌘K` on Apple platforms, or `Ctrl+K` elsewhere. On mobile, the button shows only the search icon. The palette groups pages, foundations, components and settings. Type to filter, use the arrow keys to highlight a result, and press Enter to select it. Page, foundation and component results navigate with the current URL settings. Settings results change the site language or select Light, Dark or System. Escape or a backdrop click closes the palette. `/components/CommandPalette` has a separate demo with Pages, Actions and Help groups; its items close the demo without changing the site. See the [CommandPalette contract](packages/ui/src/react/CommandPalette/CommandPalette.md) for integration.

Open `/chat` to see a scripted Petra conversation routed through squadmates. Approve plan submits the inline OpenUI form as an action turn and locks it. The follow-up uses the submitted values and trims the store name and update frequency. Missing, empty, or whitespace-only values fall back to “your store” and “Weekly” in English, or “متجرك” and “أسبوعي” in Arabic. Send back also creates an action turn and locks the form, then shows a fixed revision reply. Replay in the chat header restarts the conversation. Suggestion buttons fill and focus the composer. The guide beside the chat links to the components used on the page; hovering or focusing a guide link highlights the corresponding part. Typed messages receive a fixed reply because the site has no live model or API key.

Each component page displays its reference from `packages/ui/src/react/<name>/<name>.md` and live examples. OwnerMessageView uses the reference in the `OwnerMessage` folder. OpenUI components also show a fixture in the selected language. ChatReply uses a mixed Markdown and OpenUI fixture. `/components/Chat` shows a React conversation. Chat and ChatReply pages also include a local action-turn example; the Form page includes a local submission example. `/components/OwnerMessageView` demonstrates the [platform message contract](packages/ui/src/react/OwnerMessage/OwnerMessage.md#platform-contract), including a restored approval decision and an answered question. Those controls are locked. Interactive controls on `/components/ApprovalCard` record their output in a Sent commands panel. These examples run without network requests. See the [Chat contract](packages/ui/src/react/Chat/Chat.md) for its surface API and OpenUI boundary, and [OwnerMessageView](packages/ui/src/react/OwnerMessage/OwnerMessage.md) for platform command integration. Section labels follow the site language; the reference text remains in English and reads left to right, including on Arabic pages. The Usage section appears only when the reference document contains code samples. Use Copy beside a code block and wait for the visible confirmation. Expand Show fixture source to read or copy the OpenUI source where available. Use Previous and Next links to move between component pages.

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

Use `@tensquads/ui/openui/server` in a Worker route for request validation and caps, locale-aware prompt construction, and streaming responses. This entry does not load the Anthropic SDK. Import `createAnthropicProvider` and `DEFAULT_ANTHROPIC_MODEL` from `@tensquads/ui/openui/server/anthropic`; they are no longer exported from the general server entry:

```ts
import { createTensquadsLibrary } from "@tensquads/ui/openui";
import {
  buildSystemPrompt,
  OpenUIServerError,
  readOpenUIRequest,
  streamOpenUIResponse,
} from "@tensquads/ui/openui/server";
import { createAnthropicProvider } from "@tensquads/ui/openui/server/anthropic";

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

Apps using the Anthropic provider install `@anthropic-ai/sdk` themselves at the tested version `1.10.0`.
The SDK is an optional peer dependency. Apps that only render UI or use another provider do not need to install it.

`readOpenUIRequest` limits the body to 16 KiB and the conversation to 12 turns. It accepts user and assistant turns with string content, plus structured `ChatActionTurn` entries. It converts each action into user text in the request locale, including its summary, source, name, and values. Values use JSON with sorted object keys for deterministic output. The server entry exports `ChatTurn` and `ChatActionTurn`; see [Chat](packages/ui/src/react/Chat/Chat.md) for client integration.

`streamOpenUIResponse` returns plain text and supports request cancellation. `createAnthropicProvider` defaults to `claude-haiku-5-5`; pass the API key from the server environment. The server entry also exports the `OpenUIStreamProvider` and request types. For Arabic, pass `locale: "ar"` to the library and prompt builder; the prompt includes Arabic rules and examples. Provide Arabic user content in the turns.

`buildSystemPrompt` defaults to `mode: "ui"` for OpenUI-only output. Pass `mode: "chat"` for replies rendered by ChatReply. Chat mode teaches the [ChatReply format](packages/ui/src/react/ChatReply/ChatReply.md), with rules and examples in the selected locale:

```ts
const system = buildSystemPrompt({ library: createTensquadsLibrary(locale), locale, mode: "chat" });
```

## Dashboard demos

Open the [store owner dashboard](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/home) or [platform admin dashboard](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/admin) in the preview site. The pages use fictional demo data and include English and Arabic, light and dark views.

The admin sidebar switches between Companies and Squad images with `view=companies|images` in the URL. Search and subscription filters narrow the company table. Image filters narrow the registry table; selecting an image updates its details, bugs, and feature requests. Roll out and View changelog are display-only demo controls.

On the store owner dashboard, the first four metric tiles show weekly comparisons. Tasks done by squads and Hours saved use footnotes without comparison lines; Hours saved is an estimate for this week. Approval cards show the task from each demo request, with refund and discount rule labels in the selected language. One request demonstrates the [ApprovalCard](packages/ui/src/react/ApprovalCard/ApprovalCard.md) state without an agent because its bot has no demo squadmate mapping. Approving or declining a request removes it from the list and lowers both the approval count and the Ask Petra waiting count. Expand Sent commands inside the approval panel to inspect the latest command body locally. Changing the site language translates pending requests and preserves those decisions. Ask Petra opens `/chat` with the current URL settings. The page reserves space so the launcher clears the approval controls. These dashboards do not send commands to a backend.

## Browser verification

Switch and SegmentedControl screenshots capture their default preview states before keyboard interaction. See [e2e/switch-segmented-control.spec.ts](e2e/switch-segmented-control.spec.ts) for the state assertions and capture order.

Tooltip artifacts use `tooltip-<locale>-<direction>-<theme>-<side>-<width>.png`. Each side opens and is captured separately. Coverage includes both directions for each locale and theme, with assertions for the [Tooltip placement contract](packages/ui/src/react/Tooltip/Tooltip.md).

## Commands

- `mise exec -- npm ci` installs root dependencies and builds the package.
- `mise exec -- npm run check` runs lint, types, design and generated-file checks, unit tests, and package checks.
- `mise exec -- npm run icons` regenerates the internal icon paths from the synced `design/agent-ui/components/bundle.js`. Do not edit `packages/ui/src/icons/icons.ts` by hand. `npm run icons:check` checks for drift and runs as part of `npm run check`.
- `mise exec -- npm run preview:install` installs the separate preview app dependencies.
- `mise exec -- npm run verify` runs checks, preview checks, and browser tests.
- `mise exec -- npm run docs` regenerates `llms.txt` and the component table above from component docs and OpenUI descriptions. Edit those sources rather than the generated output. `npm run docs:check` checks both outputs for drift.
- `mise exec -- npm run dev` starts the site locally.

See [PLAN.md](PLAN.md) for architecture and decisions.

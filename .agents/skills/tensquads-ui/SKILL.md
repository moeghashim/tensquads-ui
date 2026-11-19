---
name: tensquads-ui
description: Build frontend interfaces and OpenUI streams with @tensquads/ui. Covers install, styles, locale and direction, choosing and composing library components, Squadmate, and the OpenUI client and server APIs. Use with the installed ui-sdk skill for UI behavior and components.
---

# Build with tensquads-ui

Use `@tensquads/ui` for shared tensquads and بنّاء interfaces. It provides React components styled with Agent-UI tokens, Squadmate artwork, shared schemas, and an OpenUI Lang renderer and server bridge.

## Read first

Read the installed [`ui-sdk` skill](../ui-sdk/SKILL.md). It explains UI SDK behaviors, composition, accessibility, testing, and how to build a missing behavior with `@ui-sdk/core`. This skill adds the tensquads library API and conventions; it does not replace the UI SDK guidance.

Read the component contract in the repository's [llms.txt](https://github.com/moeghashim/tensquads-ui/blob/main/llms.txt), then follow its link to the relevant `X.md` page for props and composition. The link points at `main`; for the API of the exact version you installed, read `llms.txt` in that commit.

## Install and style

Install the package from a pinned Git commit:

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

The package builds its distribution during installation. React and React DOM 19 are peer dependencies.

In the global stylesheet, declare the layer order and import fonts, tokens, and component styles in this order:

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
```

Set `lang` and `dir` on `<html>`. Use `data-theme="light"` or `data-theme="dark"`, or leave it unset to follow the system preference. Arabic pages should normally use `lang="ar" dir="rtl"`. Components use logical CSS properties and need no direction provider.

## Choose and compose components

Import React components from `@tensquads/ui/react`, except `Squadmate`, which is also available at `@tensquads/ui/squadmates`.

- Use `Button` for an action or link. Use `Chip` for an action tied to an object identifier.
- Use `Field`, `FieldLabel`, and `Input` for named text inputs. Add `FieldDescription` and `FieldError` where useful.
- Use `Menu` parts for popup actions and `Dialog` parts for modal content.
- Use `Badge` for a short, non-interactive status label.
- Use `Squadmate` for an agent image with a localized accessible name.

Compose each interactive control from the library's component and parts. Preserve UI SDK behavior and props such as `render`, `value`, `onValueChange(value, details)`, and state callbacks. Give every control a visible label or an accessible name. Use React for event handlers, custom compositions, and non-serializable children.

For a behavior UI SDK provides, wrap the corresponding UI SDK component. Do not copy its implementation or import `internal/*`. When UI SDK has no component for the behavior, use `@ui-sdk/core` primitives as described in the UI SDK skill. Use Agent-UI tokens only and logical CSS properties.

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

## Squadmate

`Squadmate` accepts an `agent` slug, an `AgentState`, a pixel `size`, and a `locale`:

```tsx
import { Squadmate } from "@tensquads/ui/squadmates";

<Squadmate agent="petra" state="planning" locale="ar" size={64} />;
```

Role IDs such as `master` differ from character slugs such as `petra`. Convert with `AGENT_ROLE_TO_SLUG` or `AGENT_SLUG_TO_ROLE` from `@tensquads/ui/schemas`.

## OpenUI in the browser

Use `TensquadsRenderer` from `@tensquads/ui/openui` to render OpenUI Lang text:

```tsx
import { TensquadsRenderer } from "@tensquads/ui/openui";

export function GeneratedPanel({ stream }: { stream: string | null }) {
  return <TensquadsRenderer stream={stream} locale="ar" onError={(errors) => console.error(errors)} />;
}
```

The entry also exports `defineComponent`, `getRegisteredComponents`, and `createTensquadsLibrary(locale)`. Definitions use Zod props schemas and React components. The renderer's locale selects the cached library; localize the stream text yourself. OpenUI props must be serializable. Use React when a composition needs callbacks, arbitrary nodes, or client-side actions.

## OpenUI on the server

Import backend helpers from `@tensquads/ui/openui/server`. Validate the request, build a prompt for the same locale as the client, then stream the provider response:

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
    const locale = "ar" as const;
    const library = createTensquadsLibrary(locale);
    const system = buildSystemPrompt({ library, locale });
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

See [OpenUI server](../../../README.md#openui-server) for accepted turn formats, action conversion, and request caps. Handle `OpenUIServerError` to return its typed code and status. `streamOpenUIResponse` returns a plain text `Response` and closes the provider when the client cancels. `createAnthropicProvider` takes a server-side API key and defaults to `claude-haiku-5-5`. Implement `OpenUIStreamProvider` to use another provider. Keep credentials on the server.

For Arabic output, use `locale: "ar"` for both prompt and renderer, and send Arabic user content. See [OpenUI server](../../../README.md#openui-server) for prompt mode selection and [ChatReply](../../../packages/ui/src/react/ChatReply/ChatReply.md) for rendering chat replies.

## Add a component

Follow PLAN.md §12 and the D20 screenshot policy:

1. Add `X.tsx`, `X.openui.ts`, `X.test.tsx`, and `X.md`. Explain in `X.md` if it has no OpenUI definition.
2. Add English and Arabic fixture files and register the definition.
3. Test keyboard and focus behavior, all documented states, and the OpenUI round trip in both locales.
4. Add preview coverage for English/LTR and Arabic/RTL in light and dark themes. Check mobile overflow and accessibility.
5. Use Agent-UI tokens only. Keep screenshots as CI artifacts for review; do not add pixel comparisons or committed baselines.
6. Regenerate `llms.txt` and the README component table with `npm run docs`, then run `npm run verify`.

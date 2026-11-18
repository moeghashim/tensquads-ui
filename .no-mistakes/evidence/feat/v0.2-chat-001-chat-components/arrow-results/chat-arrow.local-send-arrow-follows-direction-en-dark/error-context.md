# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-arrow.local.spec.ts >> send arrow follows direction: en/dark
- Location: e2e/chat-arrow.local.spec.ts:10:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
-   "horizontal": -1,
+   "horizontal": 1,
    "vertical": 1,
  }
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "tensquads" [ref=e5] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=dark
      - generic [ref=e11]: ui
    - navigation "Primary navigation" [ref=e12]:
      - link "Home" [ref=e13] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=dark
      - link "Components" [ref=e14] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=dark
      - link "Get started" [ref=e15] [cursor=pointer]:
        - /url: /get-started?locale=en&dir=ltr&theme=dark
    - generic [ref=e16]:
      - radiogroup "Language" [ref=e17]:
        - radio "English" [checked] [ref=e18] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "العربية" [ref=e19] [cursor=pointer]
        - radio [aria-hidden]
      - radiogroup "Theme" [ref=e20]:
        - radio "Light" [ref=e21] [cursor=pointer]
        - radio [aria-hidden]
        - radio "Dark" [checked] [ref=e22] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "System" [ref=e23] [cursor=pointer]
        - radio [aria-hidden]
  - main [ref=e24]:
    - generic [ref=e25]:
      - link "All components" [ref=e26] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=dark
      - paragraph [ref=e27]: Components
      - heading "Chat" [level=1] [ref=e28]
    - region "API reference" [ref=e29]:
      - generic [ref=e30]:
        - region "Description" [ref=e31]:
          - heading "Description" [level=2] [ref=e32]
          - paragraph [ref=e33]:
            - text: Import
            - code [ref=e34]: Chat
            - text: ","
            - code [ref=e35]: ChatHeader
            - text: ","
            - code [ref=e36]: ChatLog
            - text: ","
            - code [ref=e37]: ChatUserMessage
            - text: ","
            - code [ref=e38]: ChatStep
            - text: ","
            - code [ref=e39]: ChatEmptyState
            - text: ", and"
            - code [ref=e40]: ChatComposer
            - text: from
            - code [ref=e41]: "@tensquads/ui/react"
            - text: . These parts provide the chat surface. The host renders agent replies as React content inside
            - code [ref=e42]: ChatStep
            - text: ; replies are not placed in a bubble.
        - region "Props" [ref=e43]:
          - heading "Props" [level=2] [ref=e44]
          - generic [ref=e45]:
            - paragraph [ref=e46]:
              - code [ref=e47]: Chat
              - text: fills its container.
              - code [ref=e48]: ChatHeader
              - text: accepts heading content as
              - code [ref=e49]: children
              - text: and includes a ghost New chat button that calls
              - code [ref=e50]: onNewChat
              - text: . The host resets the conversation.
              - code [ref=e51]: ChatLog
              - text: scrolls and follows new entries and nested reply growth while the reader remains at the end. Scrolling up pauses following; returning to the end resumes it.
              - code [ref=e52]: ChatUserMessage
              - text: is the only message bubble.
              - code [ref=e53]: ChatStep
              - text: requires
              - code [ref=e54]: name
              - text: and accepts
              - code [ref=e55]: glyph
              - text: ","
              - code [ref=e56]: status
              - text: ","
              - code [ref=e57]: statusVariant="default" | "danger"
              - text: ","
              - code [ref=e58]: responseId
              - text: ","
              - code [ref=e59]: running
              - text: ", and an arbitrary React"
              - code [ref=e60]: reply
              - text: node. While
              - code [ref=e61]: running
              - text: ", a spinner replaces the glyph and honours reduced motion."
              - code [ref=e62]: ChatEmptyState
              - text: accepts
              - code [ref=e63]: glyph
              - text: ","
              - code [ref=e64]: title
              - text: ", and"
              - code [ref=e65]: description
              - text: .
            - paragraph [ref=e66]:
              - code [ref=e67]: ChatComposer
              - text: uses UI SDK Textarea and the library Button. Its textarea grows to 160px. Enter sends, Shift+Enter inserts a line, and IME composition does not send.
              - code [ref=e68]: attach
              - text: accepts a React node. Send is disabled for empty or whitespace-only text. A send calls the required
              - code [ref=e69]: onSend(message)
              - text: with trimmed text, then clears the draft. Use
              - code [ref=e70]: defaultValue
              - text: for an initial draft, or control it with
              - code [ref=e71]: value
              - text: and
              - code [ref=e72]: onValueChange(value)
              - text: . In controlled mode, the host must apply value changes, including the empty string after sending.
              - code [ref=e73]: textareaProps
              - text: accepts additional UI SDK textarea props, such as
              - code [ref=e74]: aria-label
              - text: and focus handlers; the composer owns value, resizing, and submission.
            - paragraph [ref=e75]:
              - text: While
              - code [ref=e76]: busy
              - text: ", sending is blocked and the button becomes Stop. Stop calls"
              - code [ref=e77]: onStop
              - text: and preserves the draft. The host cancels the work and updates
              - code [ref=e78]: busy
              - text: .
            - paragraph [ref=e79]:
              - text: Set
              - code [ref=e80]: locale="ar"
              - text: "on"
              - code [ref=e81]: ChatHeader
              - text: ","
              - code [ref=e82]: ChatEmptyState
              - text: ", and"
              - code [ref=e83]: ChatComposer
              - text: for their Arabic defaults; each defaults to English. Override copy with
              - code [ref=e84]: newChatLabel
              - text: ","
              - code [ref=e85]: title
              - text: ","
              - code [ref=e86]: description
              - text: ","
              - code [ref=e87]: sendLabel
              - text: ","
              - code [ref=e88]: stopLabel
              - text: ","
              - code [ref=e89]: placeholder
              - text: ", and"
              - code [ref=e90]: textareaProps["aria-label"]
              - text: . English control labels are New chat, Send, Stop, and Message. The English textarea has no default placeholder. Arabic defaults use neutral wording. Set document language, direction, and theme as described in the
              - link "README" [ref=e91] [cursor=pointer]:
                - /url: ../../../../../README.md#styles-locale-and-theme
              - text: .
            - paragraph [ref=e92]:
              - text: The chat surface has no OpenUI definition because it hosts replies and inline OpenUI content rather than being streamed as a component. These parts do not parse markdown or OpenUI blocks, call a model, or convert inline actions into turns. The host supplies the rendered
              - code [ref=e93]: reply
              - text: and manages conversation state. D22 and D23 define the reply and action contracts for later integration tasks.
    - region [ref=e94]:
      - heading "Live examples" [level=2] [ref=e95]
      - generic [ref=e97]:
        - generic [ref=e98]:
          - text: Agent chat
          - button "New chat" [ref=e99] [cursor=pointer]
        - log [ref=e100]:
          - generic [ref=e101]:
            - generic [ref=e102]: Help me plan the project
            - article [ref=e103]:
              - generic [aria-hidden] [ref=e105]: ◇
              - generic [ref=e106]:
                - generic [ref=e107]:
                  - strong [ref=e108]: Planner
                  - generic [ref=e109]: Routed
                - generic [ref=e110]: resp_8f31
                - generic [ref=e111]:
                  - paragraph [ref=e112]: I will break the work into clear steps.
                  - list [ref=e113]:
                    - listitem [ref=e114]: Define the goal
                    - listitem [ref=e115]: Order the steps
            - article [ref=e116]:
              - strong [ref=e121]: Research
        - generic [ref=e122]:
          - textbox "Message" [active] [ref=e123]:
            - /placeholder: Write a message
          - generic [ref=e124]:
            - button "Attach file" [ref=e126] [cursor=pointer]
            - button "Send" [disabled] [ref=e129]
    - generic [ref=e132]:
      - heading "OpenUI fixture" [level=2] [ref=e133]
      - group [ref=e134]:
        - generic "Show fixture source" [ref=e135] [cursor=pointer]
    - navigation "Component pages" [ref=e136]:
      - 'link "Previous: Tooltip" [ref=e137] [cursor=pointer]':
        - /url: /components/Tooltip?locale=en&dir=ltr&theme=dark
        - text: "← Previous: Tooltip"
```

# Test source

```ts
  1  | import { writeFile } from 'node:fs/promises';
  2  | import { expect, test } from '@playwright/test';
  3  | import { openPreview } from './helpers/preview';
  4  | 
  5  | const evidence = '~/.no-mistakes/evidence/01M7REPJ215PXXEFRJFN6EF43V';
  6  | // Oracle: the requested arrow points right in LTR and left in RTL. The rendered
  7  | // SVG coordinate basis must reverse horizontally, including after dir changes.
  8  | for (const locale of ['en', 'ar'] as const) {
  9  |   for (const theme of ['light', 'dark'] as const) {
  10 |     test(`send arrow follows direction: ${locale}/${theme}`, async ({ page }) => {
  11 |       const direction = locale === 'ar' ? 'rtl' : 'ltr';
  12 |       await openPreview(page, {locale, direction, theme}, '/components/Chat');
  13 |       const input = page.getByRole('textbox', {name: locale === 'ar' ? 'رسالة' : 'Message'});
  14 |       const send = page.getByRole('button', {name: locale === 'ar' ? 'إرسال' : 'Send', exact: true});
  15 |       const form = input.locator('xpath=ancestor::form');
  16 |       const measurements = [];
  17 |       const orientation = () => send.locator('svg').evaluate(svg => {
  18 |         const matrix = (svg as SVGSVGElement).getScreenCTM()!;
  19 |         return {horizontal: Math.sign(matrix.a), vertical: Math.sign(matrix.d)};
  20 |       });
  21 |       for (const width of [1440, 390]) {
  22 |         await page.setViewportSize({width, height: 900});
  23 |         await input.fill('   ');
  24 |         await expect(send).toBeDisabled();
  25 |         await expect.poll(orientation).toEqual({horizontal: direction === 'rtl' ? -1 : 1, vertical: 1});
  26 |         await form.screenshot({path: `${evidence}/arrow-${locale}-${theme}-${width}-disabled.png`});
  27 |         await input.fill(locale === 'ar' ? 'اختبار اتجاه الإرسال' : 'Check send direction');
  28 |         await expect(send).toBeEnabled();
  29 |         const rendered = await orientation();
  30 |         expect(rendered).toEqual({horizontal: direction === 'rtl' ? -1 : 1, vertical: 1});
  31 |         measurements.push({locale, theme, width, direction, rendered});
  32 |         await form.screenshot({path: `${evidence}/arrow-${locale}-${theme}-${width}-enabled.png`});
  33 |         await send.click();
  34 |         await expect(input).toHaveValue('');
  35 |       }
  36 |       // An explicit nested HTML direction must override the ancestor, independent of locale.
  37 |       const opposite = direction === 'rtl' ? 'ltr' : 'rtl';
  38 |       await form.evaluate((node, dir) => node.setAttribute('dir', dir), opposite);
  39 |       await input.fill('Nested direction');
  40 |       await page.waitForTimeout(200);
  41 |       const rendered = await orientation();
  42 |       await writeFile(`${evidence}/nested-${locale}-${theme}.html`, await form.evaluate(node => node.outerHTML));
  43 |       await form.screenshot({path: `${evidence}/arrow-${locale}-${theme}-nested-${opposite}.png`});
> 44 |       expect.soft(rendered).toEqual({horizontal: opposite === 'rtl' ? -1 : 1, vertical: 1});
     |                             ^ Error: expect(received).toEqual(expected) // deep equality
  45 |       measurements.push({locale, theme, width:390, direction:opposite, rendered});
  46 |       await form.screenshot({path: `${evidence}/arrow-${locale}-${theme}-nested-${opposite}.png`});
  47 |       await input.press('End');
  48 |       await input.press('Shift+Enter');
  49 |       await expect(input).toHaveValue('Nested direction\n');
  50 |       await input.press('Enter');
  51 |       await expect(input).toHaveValue('');
  52 |       await writeFile(`${evidence}/arrow-${locale}-${theme}.json`, JSON.stringify(measurements, null, 2));
  53 |     });
  54 |   }
  55 | }
  56 | 
```
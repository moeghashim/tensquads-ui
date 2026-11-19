# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: approval-sizing.spec.ts >> ApprovalCard medium controls and spacing in en light
- Location: e2e/approval-sizing.spec.ts:12:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 8
Received: 12
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "tensquads" [ref=e5] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=light
      - generic [ref=e11]: ui
    - navigation "Primary navigation" [ref=e12]:
      - link "Home" [ref=e13] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=light
      - link "Components" [ref=e14] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=light
      - link "Chat demo" [ref=e15] [cursor=pointer]:
        - /url: /chat?locale=en&dir=ltr&theme=light
      - link "Get started" [ref=e16] [cursor=pointer]:
        - /url: /get-started?locale=en&dir=ltr&theme=light
    - generic [ref=e17]:
      - radiogroup "Language" [ref=e18]:
        - radio "English" [checked] [ref=e19] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "العربية" [ref=e20] [cursor=pointer]
        - radio [aria-hidden]
      - radiogroup "Theme" [ref=e21]:
        - radio "Light" [checked] [ref=e22] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "Dark" [ref=e23] [cursor=pointer]
        - radio [aria-hidden]
        - radio "System" [ref=e24] [cursor=pointer]
        - radio [aria-hidden]
  - main [ref=e25]:
    - generic [ref=e26]:
      - link "All components" [ref=e27] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=light
      - paragraph [ref=e28]: Components
      - heading "ApprovalCard" [level=1] [ref=e29]
    - region "API reference" [ref=e30]:
      - generic [ref=e31]:
        - region "Description" [ref=e32]:
          - heading "Description" [level=2] [ref=e33]
          - paragraph [ref=e34]:
            - text: Import
            - code [ref=e35]: ApprovalCard
            - text: and
            - code [ref=e36]: ApprovalCardProps
            - text: from
            - code [ref=e37]: "@tensquads/ui/react"
            - text: . Pass a platform
            - code [ref=e38]: approval_request
            - text: as
            - code [ref=e39]: request
            - text: . The card displays its action, content, optional rule and limit, and approve or decline controls.
            - code [ref=e40]: actionLabels
            - text: localizes action ids. Optional
            - code [ref=e41]: bot
            - text: values display a Squadmate only when they match a known slug. Optional
            - code [ref=e42]: taskId
            - text: and
            - code [ref=e43]: decision
            - text: values come from the host because they are not fields on the approval request.
        - region "Props" [ref=e44]:
          - heading "Props" [level=2] [ref=e45]
          - generic [ref=e46]:
            - paragraph [ref=e47]:
              - text: The
              - code [ref=e48]: onDecision
              - text: callback receives an
              - code [ref=e49]: ApprovalDecision
              - text: command body without
              - code [ref=e50]: commandId
              - text: and
              - code [ref=e51]: at
              - text: . The host adds those values and can retain the same id for a retry.
              - code [ref=e52]: decision
              - text: restores the locked state after loading saved host state.
            - heading "Platform contract" [level=3] [ref=e53]
            - paragraph [ref=e54]:
              - text: The card uses
              - code [ref=e55]: approval_request
              - text: and
              - code [ref=e56]: ApprovalDecision
              - text: from
              - code [ref=e57]: moeghashim/tensquads-platform-amp
              - text: commit
              - code [ref=e58]: c5eaad4d69b4529c9a57b00b1066b39e60243fa8
              - text: . See
              - link "OwnerMessageView's platform contract" [ref=e59] [cursor=pointer]:
                - /url: ../OwnerMessage/OwnerMessage.md#platform-contract
              - text: for schemas, command builders, money formatting, and the Q4 gaps. The card shows no amount.
            - paragraph [ref=e60]:
              - text: The OpenUI definition uses the same React card. It accepts
              - code [ref=e61]: approvalId
              - text: ","
              - code [ref=e62]: action
              - text: ","
              - code [ref=e63]: content
              - text: ", and"
              - code [ref=e64]: contentHash
              - text: directly, with optional nullable
              - code [ref=e65]: rule
              - text: and
              - code [ref=e66]: limit
              - text: ", plus"
              - code [ref=e67]: locale
              - text: ","
              - code [ref=e68]: actionLabels
              - text: ", and"
              - code [ref=e69]: labels
              - text: . Its controls emit actions named
              - code [ref=e70]: ApprovalDecision
              - text: with params
              - code [ref=e71]: "{ approvalId, contentHash, decision }"
              - text: . Decline sends
              - code [ref=e72]: "\"reject\""
              - text: . Controls are disabled while streaming.
            - paragraph [ref=e73]:
              - text: Use
              - code [ref=e74]: labels
              - text: to override
              - code [ref=e75]: approve
              - text: ","
              - code [ref=e76]: decline
              - text: ","
              - code [ref=e77]: approved
              - text: ","
              - code [ref=e78]: declined
              - text: ","
              - code [ref=e79]: limit
              - text: ", and"
              - code [ref=e80]: task
              - text: in React or OpenUI. Defaults follow
              - code [ref=e81]: locale
              - text: .
              - code [ref=e82]: disabled
              - text: blocks both controls. The
              - code [ref=e83]: onDecision
              - text: callback may return a promise. Both controls are disabled while it is pending. Returning
              - code [ref=e84]: "false"
              - text: or rejecting leaves the card undecided. Acceptance shows the outcome and locks both controls. The OpenUI adapter receives acceptance from
              - code [ref=e85]: TensquadsRenderer.onAction
              - text: ; return
              - code [ref=e86]: chat.act(event, blockId)
              - text: from a
              - code [ref=e87]: ChatReply.onAction
              - text: handler so a host veto reaches the card.
    - region [ref=e88]:
      - heading "Live examples" [level=2] [ref=e89]
      - generic [ref=e90]:
        - generic [ref=e91]:
          - heading "Refund" [level=2] [ref=e95]
          - generic [ref=e96]:
            - generic [ref=e97]:
              - generic [ref=e98]:
                - img "Petra, Waiting" [ref=e99]
                - text: Petra
              - generic [ref=e100]: "Task: task_42"
            - paragraph [ref=e101]: Refund order 1042
            - paragraph [ref=e102]:
              - generic [ref=e103]: refund_limit
              - generic [ref=e104]: Limit $20.00
            - generic [ref=e105]:
              - button "Approve" [ref=e106] [cursor=pointer]
              - button "Decline" [ref=e107] [cursor=pointer]
        - region "Sent commands" [ref=e108]:
          - heading "Sent commands" [level=2] [ref=e109]
          - generic [ref=e110]: "[]"
        - region "OpenUI fixture" [ref=e111]:
          - generic [ref=e114]:
            - heading "Refund" [level=2] [ref=e118]
            - generic [ref=e119]:
              - paragraph [ref=e120]: Refund order 1042
              - paragraph [ref=e121]:
                - generic [ref=e122]: refund_limit
                - generic [ref=e123]: Limit $20.00
              - generic [ref=e124]:
                - button "Approve" [ref=e125] [cursor=pointer]
                - button "Decline" [ref=e126] [cursor=pointer]
    - generic [ref=e127]:
      - heading "OpenUI fixture" [level=2] [ref=e128]
      - group [ref=e129]:
        - generic "Show fixture source" [ref=e130] [cursor=pointer]
    - navigation "Component pages" [ref=e131]:
      - 'link "Previous: Distribution" [ref=e132] [cursor=pointer]':
        - /url: /components/Distribution?locale=en&dir=ltr&theme=light
        - text: "← Previous: Distribution"
      - 'link "Next: OwnerMessageView" [ref=e133] [cursor=pointer]':
        - /url: /components/OwnerMessageView?locale=en&dir=ltr&theme=light
        - text: "Next: OwnerMessageView →"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { expectNoHorizontalScroll, openPreview } from "./helpers/preview";
  3  | 
  4  | // Agent-UI's Button contract specifies a 32px medium control.
  5  | for (const [locale, direction, theme] of [
  6  | 	["en", "ltr", "light"],
  7  | 	["en", "ltr", "dark"],
  8  | 	["ar", "rtl", "light"],
  9  | 	["ar", "rtl", "dark"],
  10 | ] as const) {
  11 | 	for (const name of ["ApprovalCard", "OwnerMessageView"] as const) {
  12 | 		test(`${name} medium controls and spacing in ${locale} ${theme}`, async ({ page }, testInfo) => {
  13 | 			await openPreview(page, { locale, direction, theme }, `/components/${name}`);
  14 | 			const preview = page.locator(".owner-message-preview");
  15 | 			const cards = preview.locator(".ts-approval-card");
  16 | 			await expect(cards).toHaveCount(name === "ApprovalCard" ? 2 : 1);
  17 | 			for (const width of [1440, 390]) {
  18 | 				await page.setViewportSize({ width, height: 900 });
  19 | 				for (const button of await preview.locator("button").all()) {
  20 | 					expect((await button.boundingBox())?.height).toBe(32);
  21 | 				}
  22 | 				for (const card of await cards.all()) {
  23 | 					const gaps = await card.evaluate((element) => {
  24 | 						const header = element.querySelector("header")!.getBoundingClientRect();
  25 | 						const children = [...element.querySelector(".ts-card__body")!.children];
  26 | 						const rects = children.map((child) => child.getBoundingClientRect());
  27 | 						return {
  28 | 							header: rects[0].top - header.bottom,
  29 | 							body: rects[1].top - rects[0].bottom,
  30 | 							footer: rects.at(-1)!.top - rects.at(-2)!.bottom,
  31 | 						};
  32 | 					});
  33 | 					// The header shares the body rhythm; the decision row has double separation.
> 34 | 					expect(gaps.header).toBe(gaps.body);
     |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  35 | 					expect(gaps.footer).toBe(2 * gaps.body);
  36 | 				}
  37 | 				await testInfo.attach(`${name}-${locale}-${theme}-${width}.png`, {
  38 | 					body: await preview.screenshot(), contentType: "image/png",
  39 | 				});
  40 | 			}
  41 | 			await expectNoHorizontalScroll(page);
  42 | 			const commands = page.getByRole("region", { name: locale === "ar" ? "الأوامر المرسلة" : "Sent commands" });
  43 | 			if (name === "OwnerMessageView") {
  44 | 				const options = preview.locator(".ts-owner-message__options button");
  45 | 				await options.nth(1).focus();
  46 | 				await page.keyboard.press("Enter");
  47 | 				await expect(options.nth(1)).toHaveAttribute("aria-pressed", "true");
  48 | 				for (const option of await options.all()) await expect(option).toBeDisabled();
  49 | 				await expect(commands).toContainText('"type": "OwnerAnswer"');
  50 | 				await expect(commands).toContainText('"questionId": "question_42"');
  51 | 			}
  52 | 			for (const [index, card] of (await cards.all()).entries()) {
  53 | 				const buttons = card.getByRole("button");
  54 | 				const reject = index === 1 || name === "OwnerMessageView";
  55 | 				await buttons.nth(reject ? 1 : 0).focus();
  56 | 				await page.keyboard.press("Space");
  57 | 				await expect(card.locator(".ts-approval-card__outcome")).toHaveText(
  58 | 					locale === "ar" ? (reject ? "تم الرفض" : "تمت الموافقة") : (reject ? "Declined" : "Approved"),
  59 | 				);
  60 | 				for (const button of await buttons.all()) await expect(button).toBeDisabled();
  61 | 				await expect(commands).toContainText('"approvalId": "approval_42"');
  62 | 				await expect(commands).toContainText('"contentHash": "sha256:42"');
  63 | 				await expect(commands).toContainText(`"decision": "${reject ? "reject" : "approve"}"`);
  64 | 			}
  65 | 			await expectNoHorizontalScroll(page);
  66 | 			await testInfo.attach(`${name}-${locale}-${theme}-decided.png`, {
  67 | 				body: await preview.screenshot(), contentType: "image/png",
  68 | 			});
  69 | 		});
  70 | 	}
  71 | }
  72 | 
```
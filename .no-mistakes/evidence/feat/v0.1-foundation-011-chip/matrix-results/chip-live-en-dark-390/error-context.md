# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chip-live.spec.ts >> en dark 390
- Location: e2e/chip-live.spec.ts:3:117

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  436 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: chromium-chip-en-ltr-dark-390.png

Call log:
  - Expect "toHaveScreenshot(chromium-chip-en-ltr-dark-390.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 436 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 436 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- main [ref=e2]:
  - link "Back to gallery" [ref=e3] [cursor=pointer]:
    - /url: /?locale=en&dir=ltr&theme=dark
  - paragraph [ref=e4]: Component preview
  - heading "Chip" [level=1] [ref=e5]
  - region "Chip states" [ref=e6]:
    - heading "With icon" [level=2] [ref=e7]
    - button "response_schema" [ref=e8] [cursor=pointer]:
      - generic [aria-hidden] [ref=e10]: ◇
    - button "tool_search" [active] [ref=e12] [cursor=pointer]:
      - generic [aria-hidden] [ref=e14]: ⌕
    - heading "Without icon" [level=2] [ref=e16]
    - button "output_format" [ref=e17] [cursor=pointer]
    - heading "Disabled" [level=2] [ref=e20]
    - button "disabled_object" [disabled] [ref=e21]:
      - generic [aria-hidden] [ref=e23]: ◇
    - heading "Long identifier" [level=2] [ref=e25]
    - button "this_is_a_long_object_identifier_that_stays_visible" [ref=e26] [cursor=pointer]:
      - generic [aria-hidden] [ref=e28]: ◇
  - region "OpenUI fixture" [ref=e30]:
    - link "response_schema" [ref=e33] [cursor=pointer]:
      - /url: "#response_schema"
      - generic [aria-hidden] [ref=e34]: ◇
```

# Test source

```ts
  1 | import {test,expect} from '@playwright/test';
  2 | import {openPreview} from './helpers/preview';
  3 | for(const locale of ['en','ar'] as const)for(const theme of ['light','dark'] as const)for(const width of [1440,390])test(`${locale} ${theme} ${width}`,async({page})=>{
  4 | const direction=locale==='en'?'ltr':'rtl';await openPreview(page,{locale,direction,theme},'/components/Chip');
  5 | await page.locator('.chip-preview__grid').getByRole('button',{name:'tool_search'}).focus();
  6 | await page.setViewportSize({width,height:900});
> 7 | await expect(page).toHaveScreenshot(`chromium-chip-${locale}-${direction}-${theme}-${width}.png`,{animations:'disabled',caret:'hide',fullPage:true,maxDiffPixelRatio:0.001});
    |                    ^ Error: expect(page).toHaveScreenshot(expected) failed
  8 | });
  9 | 
```
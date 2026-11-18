# Squadmate

Import `Squadmate` from `@tensquads/ui/react`. It renders a decorative agent image with a screen reader name. It accepts an `agent` slug, an `AgentState`, a square pixel `size`, and a `locale` for the accessible name. The image is not interactive and is not in the tab order. Roster and drawing APIs are in `@tensquads/ui/squadmates`.

The image name contains the localized character name and state. For example, English `Petra, Planning` and Arabic `بترا، تخطيط`.

Arabic names follow the website copy in `tensquads-website/src/components/home/copy.ar.ts`. English names follow its `copy.en.ts` entries and match the roster. Arabic state labels in that copy are used for waiting (`بانتظارك`), planning (`تخطيط`), running (`يعمل`), and done (`تم`).

The website copy has no Arabic labels for checking, sent back, blocked, escalated, dropped, or idle. The component currently uses these proposed translations pending review:

| State | Proposed Arabic label |
|---|---|
| Checking | يتحقق |
| Sent back | أُعيد |
| Blocked | محظور |
| Escalated | مُصعّد |
| Dropped | متوقف |
| Idle | خامل |

Mascot artwork colours are source data in `packages/ui/src/squadmates/mascots.ts`. They are embedded in the SVG markup, not component CSS.

OpenUI is useful when an agent needs to include an identified squadmate image in a generated response. The definition exposes the same props and validates them with shared schemas.

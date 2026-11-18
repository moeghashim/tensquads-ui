---
id: 003
title: Turn actions in chat elements into the next turn
milestone: v0.2-chat
category: openui
priority: high
files: ["packages/ui/src/react/Chat/**", "packages/ui/src/react/ChatReply/**", "packages/ui/src/openui/**", "e2e/**", "llms.txt"]
---

Implements D23. Starts after 001 and 002 merge.

## Acceptance criteria
- [ ] `ChatReply` forwards OpenUI action events (`@openuidev/react-lang` `ActionEvent`) through an `onAction` prop with the action name, the source component, and current form values.
- [ ] A `useChat` hook (client) owns the turn list and run state: `send(text)`, `act(action)`, `stop()`, `reset()`. `act` appends a structured action turn (shown as a user pill with a readable summary, e.g. "Approve plan"), locks the element that sent it (controls disabled, state kept), and sends the turn to the agent. Host apps can observe or cancel through `onAction` before it is sent.
- [ ] Transport: `useChat({ endpoint })` posts turns to a server that uses `readOpenUIRequest` and `streamOpenUIResponse` (chat mode), and streams the reply into the active `ChatStep`. `stop()` aborts the request. Errors from `OpenUIServerError` show as a `blocked` step status with a retry action.
- [ ] Server: `readOpenUIRequest` accepts the action turn shape with the same caps (16 KiB, 12 turns); the action is rendered into the model's turn text deterministically and in the active locale.
- [ ] Tests: action → locked element → new user pill → request body shape; stop aborts; error path; caps.
- [ ] Docs and `llms.txt` updated. `npm run verify` passes.

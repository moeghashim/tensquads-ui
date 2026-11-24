# WorkflowCard

`WorkflowCard` summarizes a workflow with a fitted graph thumbnail, status, and three stats. The thumbnail mirrors in RTL and is hidden from assistive technology.

Pass a `name`, `status` (`"draft"` or `"live"`), `meta`, and a `WorkflowGraph` as `graph`. Provide three `stats` with a `label` and a string `value` each. Use this order for the stats.

1. Runs in the last seven days
2. Grader pass rate
3. Last run

Give the card an `href` to make its surface a link. Its separate actions button opens a keyboard-accessible menu. Pass `onAction` to handle `"open"`, `"duplicate"`, `"publish"` or `"unpublish"`, and `"delete"`. Without a handler, Open follows the link and the other actions are disabled. Unpublish and Delete request confirmation when invoked through the agent bridge. Set `locale="ar"` for Arabic status and menu labels. Localize the workflow name, meta and stats in the host.

OpenUI accepts `name`, `status`, `meta`, `stats`, and `graph`. Streamed cards display the summary without a link or menu. Status follows the renderer's locale.

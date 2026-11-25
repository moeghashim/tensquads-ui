# Approved design comps

Static HTML comps that Moe approved before the build. The `stream/`, `catalog/`, `chat/` and `nodes/` folders include light and dark comps and a build script. From the repository root, run `node apps/preview/.impeccable/mocks/<folder>/<folder>.mjs` to rebuild one of these sets from the current generated token CSS and the assets its script reads. From another directory, use the full path to the script. The `design-system/` and `decision/` folders contain static references without build scripts.

The `mascot-motion/` folder contains one motion guide comp. Run `node apps/preview/.impeccable/mocks/mascot-motion/mascot-motion.mjs` from the repository root to rebuild `mascot-motion.html` from the generated token CSS, bundled Inter fonts and library squadmate drawing source.

| Folder | What | Task |
|---|---|---|
| `design-system/` | Design system home, catalog, foundations, agent docs (D32) | v0.3-design-system 001–003 |
| `stream/` | The stream section on the home page | v0.3-design-system 002 |
| `catalog/` | The component catalog | v0.3-design-system 002 |
| `chat/` | The `/chat` page | v0.3-design-system 002 |
| `nodes/` | The Nodes builder page | v0.3-workflow 006 |
| `mascot-motion/` | Mascot motion guide (D33) | v0.3-design-system 004 |
| `decision/` | Stream-to-screen home (D21) | v0.2-home |

The comp wins on layout and copy. Component specs under `design/agent-ui/` win on component visuals.

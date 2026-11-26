# Approved design comps

Static HTML comps that Moe approved before the build. The `stream/`, `catalog/`, `chat/` and `nodes/` folders include light and dark comps and a build script. From the repository root, run `node apps/preview/.impeccable/mocks/<folder>/<folder>.mjs` to rebuild one of these sets from the current generated token CSS and the assets its script reads. From another directory, use the full path to the script. The `design-system/` and `decision/` folders contain static references without build scripts.

The `mascot-hero/` folder contains light and dark comps of the "Meet the squad" hero and its build script, `mascot-hero.mjs`.

The `date-range/` and `list-detail/` folders hold English light, English dark and Arabic light comps. `date-range/kit.mjs` holds the shared page setup, the calendar model and the picker's CSS, which is the spec for task 003. Both scripts inline the library and template CSS, so the comps use real component classes.

The `mascot-motion/` folder contains one motion guide comp. Run `node apps/preview/.impeccable/mocks/mascot-motion/mascot-motion.mjs` from the repository root to rebuild `mascot-motion.html` from the generated token CSS, bundled Inter fonts and library squadmate drawing source.

| Folder | What | Task |
|---|---|---|
| `design-system/` | Design system home, catalog, foundations, agent docs (D32) | v0.3-design-system 001–003 |
| `stream/` | The stream section on the home page | v0.3-design-system 002 |
| `catalog/` | The component catalog | v0.3-design-system 002 |
| `chat/` | The `/chat` page | v0.3-design-system 002 |
| `nodes/` | The Nodes builder page | v0.3-workflow 006 |
| `mascot-motion/` | Mascot motion guide (D33) | v0.3-design-system 004 |
| `mascot-hero/` | "Meet the squad" hero on the mascot states page | v0.4-trial-gaps 006 |
| `date-range/` | DateRangePicker states, presets and the phone sheet | v0.4-trial-gaps 001, 003 |
| `list-detail/` | List-and-detail template (Orders) | v0.4-trial-gaps 001, 004 |
| `decision/` | Stream-to-screen home (D21) | v0.2-home |

The comp wins on layout and copy. Component specs under `design/agent-ui/` win on component visuals.

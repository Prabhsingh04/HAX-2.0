import { COMPS, FAMILIES } from "../library/catalog";
import { FourWaysInField, type Way } from "./FourWaysInField";

// "One library. Four ways in": HAX Studio v2's four audiences in place of the old two (founders
// and developers). Each column's words sit in the dot field, and hovering gathers the dots into a
// picture drawn round them: designers the pen tool, PMs AI sparks, engineers the { } of code, agents
// a bot whose face is the words. Each line is that
// audience's Studio title, word for word. Where each one goes (the user's call): designers to the
// components, PMs and engineers to the docs, agents to MCP.
const WAYS: Way[] = [
  {
    id: "designers", shape: "pen", title: "For designers",
    line: "Design the interaction, not just the screen",
    cta: { label: "Browse components", href: "/library" },
    caption: `${COMPS.length} components · ${FAMILIES.length} families`,
  },
  {
    id: "pms", shape: "spark", title: "For PMs",
    line: "Decide where agents can act alone",
    cta: { label: "Read the PM guide", href: "/hax-docs#product-managers" },
    caption: "Autonomy · approvals · roles",
  },
  {
    id: "engineers", shape: "code", title: "For engineers",
    line: "Build exchanges with known replies",
    cta: { label: "Read the docs", href: "/hax-docs#install" },
    caption: "npm i @hax/react",
  },
  {
    id: "agents", shape: "bot", title: "For agents",
    line: "Look up a pattern when the task calls for one",
    cta: { label: "Set up MCP", href: "/mcp" },
    caption: "Claude · Cursor · Codex · VS Code",
  },
];

export function FourWaysIn() {
  return <FourWaysInField ways={WAYS} />;
}

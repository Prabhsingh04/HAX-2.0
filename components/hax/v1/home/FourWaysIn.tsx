import { COMPS, FAMILIES } from "../library/catalog";
import { FourWaysInField, type Way } from "./FourWaysInField";

// "One library. Four ways in": HAX Studio v2's four audiences in place of the old two (founders
// and developers). Each column's words sit in the dot field, and hovering gathers the dots into a
// picture drawn round them: designers the pen tool, PMs AI sparks, engineers the { } of code, agents
// a bot whose face is the words. Each line is that audience's copy from Srishti's Studio v3 home
// ("Who can use HAX and how", components/v3/V3Audience.tsx), word for word (17 Nov). Where each one goes (the user's call): designers to the
// components, PMs and engineers to the docs, agents to MCP.
const WAYS: Way[] = [
  {
    id: "designers", shape: "pen", title: "For designers",
    line: "Find the moments when an agent should explain, ask, or hand off, then shape the exchange.",
    cta: { label: "Browse components", href: "/library" },
    caption: `${COMPS.length} components · ${FAMILIES.length} families`,
  },
  {
    id: "pms", shape: "spark", title: "For product managers",
    line: "Decide where an agent can act and where a person needs a say.",
    cta: { label: "Read the PM guide", href: "/hax-docs#product-managers" },
    caption: "Autonomy · approvals · roles",
  },
  {
    id: "engineers", shape: "code", title: "For engineers",
    line: "Use each pattern’s states and responses to build the interaction in the product.",
    cta: { label: "Read the docs", href: "/hax-docs#install" },
    caption: "npm i @hax/react",
  },
  {
    id: "agents", shape: "bot", title: "For agents",
    line: "Look up a fitting pattern during a task and follow its expected exchange.",
    cta: { label: "Set up MCP", href: "/mcp" },
    caption: "Claude · Cursor · Codex · VS Code",
  },
];

export function FourWaysIn() {
  return <FourWaysInField ways={WAYS} />;
}

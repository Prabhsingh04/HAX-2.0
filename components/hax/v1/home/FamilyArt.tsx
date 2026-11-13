import "./family-art.css";
import type { ReactNode } from "react";

// One illustration per component family for Home: what the family DOES, drawn as one idea,
// in one system. Blue = the person, orange = the agent (HAX), ink = the interface. Panels
// are the page surface with a hairline; the only gradients are the HAX lines.
// viewBox 300 × 180, drawn to fill the top of a family card.

const P = "var(--fa-panel)", E = "var(--fa-edge)", INK = "var(--fa-ink)", SOFT = "var(--fa-soft)";
const BLUE = "#0a6bd6", AG = "#ff6d2d";

const Panel = ({ x, y, w, h, r = 10, children }: { x: number; y: number; w: number; h: number; r?: number; children?: ReactNode }) => (
  <g>
    <rect x={x} y={y + 3} width={w} height={h} rx={r} fill="var(--fa-shadow)" />
    <rect x={x} y={y} width={w} height={h} rx={r} fill={P} stroke={E} />
    {children}
  </g>
);
const Line = ({ x, y, w, c = SOFT, h = 5 }: { x: number; y: number; w: number; c?: string; h?: number }) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={c} />;
// the agent mark: ink disc in a HAX gradient ring, with a four-point spark
const Agent = ({ x, y, r = 11 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#293247" stroke="url(#fa-hax)" strokeWidth="2.2" />
    <path d={`M${x} ${y - r * 0.5} Q${x + r * 0.1} ${y - r * 0.1} ${x + r * 0.5} ${y} Q${x + r * 0.1} ${y + r * 0.1} ${x} ${y + r * 0.5} Q${x - r * 0.1} ${y + r * 0.1} ${x - r * 0.5} ${y} Q${x - r * 0.1} ${y - r * 0.1} ${x} ${y - r * 0.5}Z`} fill="#fff" />
  </g>
);
const Person = ({ x, y, r = 11 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={BLUE} /><circle cx={x} cy={y - r * 0.18} r={r * 0.32} fill="#fff" /><path d={`M${x - r * 0.55} ${y + r * 0.62} a${r * 0.55} ${r * 0.45} 0 0 1 ${r * 1.1} 0`} fill="#fff" /></g>
);
const Check = ({ x, y, c = BLUE, r = 8 }: { x: number; y: number; c?: string; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill={c} /><path d={`M${x - r * 0.42} ${y} l${r * 0.3} ${r * 0.32} l${r * 0.55} ${r * 0.62 * -1}`} stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
);

// 01 Composers — a file, a voice and an image flow into one input
const Composers = () => (
  <>
    <path d="M70 52 C 70 96, 120 100, 128 122" stroke={BLUE} strokeWidth="1.6" strokeDasharray="3 4" fill="none" opacity=".55" />
    <path d="M150 50 L 150 120" stroke={BLUE} strokeWidth="1.6" strokeDasharray="3 4" fill="none" opacity=".55" />
    <path d="M230 52 C 230 96, 180 100, 172 122" stroke={BLUE} strokeWidth="1.6" strokeDasharray="3 4" fill="none" opacity=".55" />
    <Panel x={46} y={22} w={48} h={34} r={8}><rect x={54} y={30} width={14} height={18} rx={3} fill="#d0342c" /><Line x={72} y={32} w={16} /><Line x={72} y={41} w={11} /></Panel>
    <Panel x={124} y={20} w={52} h={34} r={17}>{[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={135 + i * 4.6} y={37 - [4, 8, 12, 7, 10, 5, 3][i]} width={2.4} height={[4, 8, 12, 7, 10, 5, 3][i] * 2} rx={1.2} fill={BLUE} />)}</Panel>
    <Panel x={206} y={22} w={48} h={34} r={8}><rect x={213} y={29} width={34} height={20} rx={4} fill="url(#fa-sky)" /><circle cx={240} cy={34} r={3} fill="#fff" opacity=".9" /></Panel>
    <Panel x={56} y={118} w={188} h={42} r={21}>
      <Line x={76} y={136} w={86} c={INK} h={6} /><rect x={165} y={132} width={1.6} height={14} fill={BLUE} />
      <circle cx={222} cy={139} r={12} fill="url(#fa-blue)" /><path d="M222 145 V133 M217 138 L222 133 L227 138" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Panel>
  </>
);

// 02 Artifacts — the agent turns a request into things you can use: a doc, a table, a chart
const Artifacts = () => (
  <>
    <g transform="rotate(-8 92 96)"><Panel x={46} y={46} w={92} h={104}><Line x={58} y={60} w={50} c={INK} h={6} />{[74, 84, 94, 104, 114].map((y, i) => <Line key={y} x={58} y={y} w={[66, 60, 68, 44, 58][i]} />)}</Panel></g>
    <Panel x={110} y={36} w={100} h={110}>
      <Line x={122} y={50} w={40} c={INK} h={6} />
      {[0, 1, 2, 3].map((r) => <g key={r}><line x1={122} x2={198} y1={66 + r * 18} y2={66 + r * 18} stroke={E} />{[0, 1, 2].map((c) => <Line key={c} x={124 + c * 26} y={72 + r * 18} w={r === 0 ? 16 : 20} c={r === 0 ? INK : c === 1 && r === 2 ? "#12805c" : SOFT} h={4} />)}</g>)}
    </Panel>
    <g transform="rotate(7 214 100)"><Panel x={176} y={54} w={84} h={92}>{[0, 1, 2, 3].map((i) => <rect key={i} x={188 + i * 16} y={130 - [22, 34, 30, 52][i]} width={11} height={[22, 34, 30, 52][i]} rx={2.5} fill={i === 3 ? BLUE : "color-mix(in srgb, #0a6bd6 25%, transparent)"} />)}<line x1={186} x2={252} y1={131} y2={131} stroke={E} /></Panel></g>
    <Agent x={150} y={26} r={12} />
  </>
);

// 03 Collectors — the agent stops and asks; the person picks one answer
const Collectors = () => (
  <>
    <Agent x={58} y={40} />
    <Panel x={78} y={22} w={170} h={36} r={14}><Line x={92} y={34} w={112} c={INK} h={6} /><Line x={92} y={45} w={72} /></Panel>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={96} y={72 + i * 30} width={152} height={24} rx={12} fill={P} stroke={i === 1 ? BLUE : E} strokeWidth={i === 1 ? 1.8 : 1} />
        <circle cx={110} cy={84 + i * 30} r={5} fill="none" stroke={i === 1 ? BLUE : "var(--fa-edge2)"} strokeWidth={i === 1 ? 3.6 : 1.4} />
        <Line x={122} y={82 + i * 30} w={[70, 54, 82][i]} c={i === 1 ? BLUE : SOFT} h={5} />
      </g>
    ))}
    <Person x={262} y={114} r={10} />
  </>
);

// 04 Controllers — a console the person uses to steer the agent: limits, access, stop
const Controllers = () => (
  <>
    <Panel x={40} y={28} w={220} h={124} r={14}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Line x={60} y={50 + i * 28} w={44} c={INK} h={5} />
          <rect x={126} y={49 + i * 28} width={70} height={6} rx={3} fill={SOFT} />
          <rect x={126} y={49 + i * 28} width={[52, 24, 40][i]} height={6} rx={3} fill={BLUE} />
          <circle cx={126 + [52, 24, 40][i]} cy={52 + i * 28} r={7} fill={P} stroke={BLUE} strokeWidth="2" />
          <rect x={214} y={44 + i * 28} width={28} height={16} rx={8} fill={i === 1 ? SOFT : BLUE} /><circle cx={i === 1 ? 222 : 234} cy={52 + i * 28} r={6} fill="#fff" />
        </g>
      ))}
      <line x1={56} x2={244} y1={124} y2={124} stroke={E} />
      <rect x={56} y={132} width={10} height={10} rx={2} fill={INK} /><Line x={74} y={135} w={34} />
      <Agent x={232} y={137} r={8} />
    </Panel>
  </>
);

// 05 Approvals — the agent's action waits at a gate until the person says yes
const Approvals = () => (
  <>
    <path d="M40 112 H 120" stroke="url(#fa-agent)" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M182 112 H 262" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 6" />
    <Agent x={40} y={112} r={10} />
    <Panel x={110} y={36} w={82} h={110} r={14}>
      <path d="M151 56 l18 7 v14 c0 12 -8 20 -18 24 c-10 -4 -18 -12 -18 -24 v-14 z" fill="color-mix(in srgb, #0a6bd6 12%, transparent)" stroke={BLUE} strokeWidth="1.8" />
      <path d="M143 78 l6 6 l11 -12" stroke={BLUE} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={122} y={116} width={26} height={18} rx={9} fill={SOFT} /><rect x={152} y={116} width={30} height={18} rx={9} fill="url(#fa-blue)" />
    </Panel>
    <Check x={262} y={112} />
  </>
);

// 06 Workflows — many steps, connected, with the person's check marked
const Workflows = () => (
  <>
    <path d="M86 52 H 124 M176 52 H 214 M240 70 V 112 M214 128 H 176 M124 128 H 86" stroke="var(--fa-edge2)" strokeWidth="1.8" fill="none" />
    {[[34, 36, 0], [124, 36, 1], [214, 36, 2]].map(([x, y, i]) => (
      <Panel key={i} x={x} y={y} w={52} h={32} r={9}>{i === 1 ? <Agent x={x + 16} y={y + 16} r={7} /> : <circle cx={x + 16} cy={y + 16} r={6} fill={i === 0 ? INK : "#12805c"} />}<Line x={x + 27} y={y + 14} w={16} c={INK} h={4} /></Panel>
    ))}
    <g><rect x={214} y={112} width={52} height={32} rx={9} fill={P} stroke={BLUE} strokeDasharray="4 3" strokeWidth="1.6" /><Person x={230} y={128} r={7} /><Line x={241} y={126} w={16} c={BLUE} h={4} /></g>
    <Panel x={124} y={112} w={52} h={32} r={9}><Agent x={140} y={128} r={7} /><Line x={151} y={126} w={16} c={INK} h={4} /></Panel>
    <Panel x={34} y={112} w={52} h={32} r={9}><Check x={50} y={128} c="#12805c" r={7} /><Line x={61} y={126} w={16} c={INK} h={4} /></Panel>
  </>
);

// 07 Explorers — look into what the agent did: a trail of steps under a lens
const Explorers = () => (
  <>
    <Panel x={40} y={26} w={170} h={128} r={14}>
      <line x1={64} x2={64} y1={46} y2={136} stroke={E} strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={64} cy={50 + i * 28} r={6} fill={i < 3 ? "#12805c" : P} stroke={i < 3 ? "none" : "var(--fa-edge2)"} strokeWidth="1.5" />
          <Line x={80} y={46 + i * 28} w={[78, 60, 88, 50][i]} c={i === 1 ? AG : INK} h={5} /><Line x={80} y={55 + i * 28} w={[46, 70, 40, 56][i]} />
        </g>
      ))}
    </Panel>
    <circle cx={198} cy={86} r={40} fill="color-mix(in srgb, #0a6bd6 8%, var(--fa-panel))" stroke={BLUE} strokeWidth="3" />
    <Line x={174} y={78} w={34} c={AG} h={5} /><Line x={174} y={88} w={46} /><Line x={174} y={98} w={26} />
    <path d="M226 116 L 254 144" stroke={BLUE} strokeWidth="7" strokeLinecap="round" />
  </>
);

// 08 Notifiers — the agent speaks up on its own: a message arrives, others stack behind
const Notifiers = () => (
  <>
    <Panel x={72} y={30} w={168} h={40} r={12}><circle cx={90} cy={50} r={7} fill={SOFT} /><Line x={104} y={45} w={80} c={SOFT} /><Line x={104} y={55} w={52} c={SOFT} /></Panel>
    <Panel x={58} y={60} w={196} h={46} r={13}><circle cx={78} cy={83} r={8} fill={SOFT} /><Line x={94} y={77} w={96} c={SOFT} /><Line x={94} y={88} w={64} c={SOFT} /></Panel>
    <Panel x={42} y={94} w={228} h={58} r={14}>
      <Agent x={66} y={123} r={11} /><Line x={86} y={114} w={108} c={INK} h={6} /><Line x={86} y={126} w={82} />
      <rect x={200} y={128} width={56} height={16} rx={8} fill="url(#fa-blue)" />
    </Panel>
    <g transform="translate(232 20)"><path d="M10 4 a7 7 0 0 1 7 7 v6 l3 4 h-20 l3 -4 v-6 a7 7 0 0 1 7 -7z" fill={P} stroke={INK} strokeWidth="1.6" /><circle cx={10} cy={24} r={2.4} fill={INK} /><circle cx={17} cy={6} r={4} fill={AG} /></g>
  </>
);

const ART: Record<string, () => ReactNode> = { composers: Composers, artifacts: Artifacts, collectors: Collectors, controllers: Controllers, approvals: Approvals, workflows: Workflows, explorers: Explorers, notifiers: Notifiers };

export function FamilyArt({ id }: { id: string }) {
  const A = ART[id];
  return (
    <div aria-hidden="true" className="fa-stage">
      <svg viewBox="0 0 300 180" width="100%" height="100%" fill="none">
        <defs>
          <linearGradient id="fa-hax" x1="0" x2="1"><stop offset="0" stopColor="#0051af" /><stop offset=".55" stopColor="#00bceb" /><stop offset="1" stopColor="#ff6d2d" /></linearGradient>
          <linearGradient id="fa-agent" gradientUnits="userSpaceOnUse" x1="40" x2="120" y1="0" y2="0"><stop offset="0" stopColor="#ff6d2d" /><stop offset="1" stopColor="#ff6d2d" stopOpacity=".15" /></linearGradient>
          <linearGradient id="fa-blue" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#0051af" /><stop offset="1" stopColor="#00a9e2" /></linearGradient>
          <linearGradient id="fa-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9fc3e6" /><stop offset="1" stopColor="#5f86b0" /></linearGradient>
        </defs>
        {A && <A />}
      </svg>
    </div>
  );
}

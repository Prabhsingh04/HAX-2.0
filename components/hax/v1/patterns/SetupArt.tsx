"use client";
import "./setup-art.css";
import { useId } from "react";
import type { Level } from "@/lib/v2/types";

// The four participant setups (lib/v2/levels.ts, L1–L4) as small diagrams, in the Home
// illustration marks (FamilyArt): an ink agent in a HAX ring, a blue person. Agents talk over
// solid links; a person in the loop is a dashed blue link. viewBox 240 × 132.
const BLUE = "#0a6bd6", AG = "#ff6d2d";
type Pt = [number, number];
const SHAPES: Record<Level, { agents: Pt[]; people: Pt[]; peers: [number, number][]; loop: [number, number][] }> = {
  L1: { agents: [[120, 66]], people: [], peers: [], loop: [] },
  L2: { agents: [[80, 40], [160, 34], [122, 100]], people: [], peers: [[0, 1], [1, 2], [2, 0]], loop: [] },
  L3: { agents: [[58, 42], [132, 34], [96, 100]], people: [[196, 78]], peers: [[0, 1], [1, 2], [2, 0]], loop: [[0, 1]] },
  L4: { agents: [[92, 44], [150, 36], [120, 98]], people: [[36, 88], [210, 26], [206, 104]], peers: [[0, 1], [1, 2], [2, 0]], loop: [[0, 0], [1, 1], [2, 2]] },
};

const spark = (x: number, y: number, r: number) =>
  `M${x} ${y - r * 0.5} Q${x + r * 0.1} ${y - r * 0.1} ${x + r * 0.5} ${y} Q${x + r * 0.1} ${y + r * 0.1} ${x} ${y + r * 0.5} Q${x - r * 0.1} ${y + r * 0.1} ${x - r * 0.5} ${y} Q${x - r * 0.1} ${y - r * 0.1} ${x} ${y - r * 0.5}Z`;

export const AgentMark = ({ p: [x, y], r = 11, g, w = 2.2 }: { p: Pt; r?: number; g: string; w?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#293247" stroke={`url(#${g})`} strokeWidth={w} />
    <path d={spark(x, y, r)} fill="#fff" />
  </g>
);
export const PersonMark = ({ p: [x, y], r = 11 }: { p: Pt; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={BLUE} />
    <circle cx={x} cy={y - r * 0.18} r={r * 0.32} fill="#fff" />
    <path d={`M${x - r * 0.55} ${y + r * 0.62} a${r * 0.55} ${r * 0.45} 0 0 1 ${r * 1.1} 0`} fill="#fff" />
  </g>
);
export const HaxRing = ({ id }: { id: string }) => (
  <linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor="#0051af" /><stop offset=".55" stopColor="#00bceb" /><stop offset="1" stopColor={AG} /></linearGradient>
);

// a message going along a link and back
const Msg = ({ a, b, c, dur }: { a: Pt; b: Pt; c: string; dur: number }) => (
  <circle r="2.6" fill={c}>
    <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" />
  </circle>
);

const useSvgId = (p: string) => p + useId().replace(/[^a-zA-Z0-9_-]/g, "");

export function SetupArt({ level, muted = false, className = "" }: { level: Level; muted?: boolean; className?: string }) {
  const g = useSvgId("su");
  const s = SHAPES[level];
  return (
    <svg className={`su-art ${muted ? "su-art--muted" : ""} ${className}`} viewBox="0 0 240 132" fill="none" aria-hidden="true">
      <defs><HaxRing id={g} /></defs>
      {s.peers.map(([i, j]) => <line key={`p${i}${j}`} x1={s.agents[i][0]} y1={s.agents[i][1]} x2={s.agents[j][0]} y2={s.agents[j][1]} stroke="var(--su-edge)" strokeWidth="1.6" strokeLinecap="round" />)}
      {s.loop.map(([i, j]) => <line key={`l${i}${j}`} x1={s.people[i][0]} y1={s.people[i][1]} x2={s.agents[j][0]} y2={s.agents[j][1]} stroke={BLUE} strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" />)}
      {!muted && (
        <g className="su-msgs">
          {s.peers.map(([i, j], k) => <Msg key={`mp${k}`} a={s.agents[i]} b={s.agents[j]} c={AG} dur={2.4 + k * 0.5} />)}
          {s.loop.map(([i, j], k) => <Msg key={`ml${k}`} a={s.agents[j]} b={s.people[i]} c={BLUE} dur={2.8 + k * 0.4} />)}
        </g>
      )}
      {level === "L1" && (
        <g className="su-orbit">
          <circle cx="120" cy="66" r="34" stroke="var(--su-orbit)" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" />
          <circle cx="144" cy="42" r="3.2" fill={AG} />
        </g>
      )}
      {s.agents.map((p, k) => <AgentMark key={`a${k}`} p={p} r={level === "L1" ? 13 : 11} g={g} />)}
      {s.people.map((p, k) => <PersonMark key={`h${k}`} p={p} />)}
    </svg>
  );
}

// The key under a set of diagrams: what the two marks and the dashed link mean.
export function SetupKey({ className = "" }: { className?: string }) {
  const g = useSvgId("sk");
  return (
    <ul className={`flex gap-[20px] items-center leading-[18px] text-[12px] text-[color:var(--text-secondary)] ${className}`}>
      <li className="flex gap-[8px] items-center">
        <svg viewBox="0 0 16 16" className="size-[16px]" aria-hidden="true"><defs><HaxRing id={g} /></defs><AgentMark p={[8, 8]} r={6.6} g={g} w={1.6} /></svg>
        Agent
      </li>
      <li className="flex gap-[8px] items-center">
        <svg viewBox="0 0 16 16" className="size-[16px]" aria-hidden="true"><PersonMark p={[8, 8]} r={7.4} /></svg>
        Person
      </li>
      <li className="flex gap-[8px] items-center">
        <svg viewBox="0 0 24 16" className="h-[16px] w-[24px]" aria-hidden="true"><line x1="2" y1="8" x2="22" y2="8" stroke={BLUE} strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" /></svg>
        A person in the loop
      </li>
    </ul>
  );
}

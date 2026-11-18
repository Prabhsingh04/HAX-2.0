// Lucide icons, the set the HAX Figma file uses (inline so they take currentColor)
type P = { className?: string; strokeWidth?: number };
const base = (sw = 1.8) => ({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });
export const ArrowRight = ({ className = "size-[16px]", strokeWidth }: P) => <svg {...base(strokeWidth)} className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
export const ArrowUpRight = ({ className = "size-[16px]", strokeWidth }: P) => <svg {...base(strokeWidth)} className={className}><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>;
export const Copy = ({ className = "size-[16px]", strokeWidth }: P) => <svg {...base(strokeWidth)} className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>;
export const Check = ({ className = "size-[16px]", strokeWidth }: P) => <svg {...base(strokeWidth ?? 2.4)} className={className}><path d="M20 6 9 17l-5-5" /></svg>;

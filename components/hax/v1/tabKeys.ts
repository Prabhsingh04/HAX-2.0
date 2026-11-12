import type { KeyboardEvent } from "react";

// Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern). Put on the tablist;
// each tab carries tabIndex={selected ? 0 : -1}.
export function onTabKeys<K>(keys: readonly K[], cur: K, pick: (k: K) => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    const i = keys.indexOf(cur), n = keys.length;
    const j = ({ ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 } as Record<string, number>)[e.key];
    if (j === undefined) return;
    e.preventDefault();
    pick(keys[j]);
    e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')[j]?.focus();
  };
}

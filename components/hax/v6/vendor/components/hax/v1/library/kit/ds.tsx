"use client";
import { createContext, useContext, useEffect } from "react";
import { FONTS, type DS } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ds-shared";

export type { DS } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ds-shared";
export { dsFrom, withDS } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ds-shared";

// Which system the kit draws in below this point (the library and component pages set it;
// anywhere else, such as Home, gets shadcn/ui).
export const DSContext = createContext<DS>("shadcn");
export const useDS = () => useContext(DSContext);
// Inside a library card or a Home tile the component is a picture inside a link: nothing in
// it is focusable or clickable, and links in it are plain text (no <a> inside the card's <a>).
export const InertContext = createContext(false);
export const useInert = () => useContext(InertContext);

// Material 3's web components are custom elements: register them in the browser the first
// time a Material stage mounts (they cannot load on the server).
let mdLoad: Promise<unknown> | null = null;
export const loadMaterial = () => (mdLoad ??= import("@/components/hax/v1/library/kit/md-register"));

// The system's typefaces (and, for Material, its icon font and components). React hoists
// these links into <head> once, however many components render them.
export function DSFonts({ ds }: { ds: DS }) {
  useEffect(() => { if (ds === "m3") loadMaterial(); }, [ds]);
  return (
    <>
      {FONTS[ds].map((href) => (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
    </>
  );
}

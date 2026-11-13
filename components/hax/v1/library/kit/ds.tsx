"use client";
import { createContext, useContext } from "react";
import { FONTS, type DS } from "./ds-shared";

export type { DS } from "./ds-shared";
export { dsFrom, withDS } from "./ds-shared";

// Which system the kit draws in below this point (the library and component pages set it;
// anywhere else, such as Home, gets shadcn/ui).
export const DSContext = createContext<DS>("shadcn");
export const useDS = () => useContext(DSContext);

// The system's typefaces (and, for Material, its icon font). React hoists these links into
// <head> once, however many components render them.
export function DSFonts({ ds }: { ds: DS }) {
  return (
    <>
      {FONTS[ds].map((href) => (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
    </>
  );
}

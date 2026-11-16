// JSX types for the Material 3 web components the kit uses (see md-register.ts).
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type MdProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  [attr: string]: unknown;
};

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "md-filled-button": MdProps; "md-filled-tonal-button": MdProps; "md-outlined-button": MdProps; "md-text-button": MdProps;
      "md-icon-button": MdProps; "md-filled-icon-button": MdProps; "md-filled-tonal-icon-button": MdProps; "md-outlined-icon-button": MdProps;
      "md-assist-chip": MdProps; "md-filter-chip": MdProps; "md-input-chip": MdProps; "md-suggestion-chip": MdProps; "md-chip-set": MdProps;
      "md-checkbox": MdProps; "md-radio": MdProps; "md-switch": MdProps; "md-linear-progress": MdProps; "md-circular-progress": MdProps;
      "md-outlined-text-field": MdProps; "md-divider": MdProps; "md-icon": MdProps; "md-list": MdProps; "md-list-item": MdProps;
      "md-menu-item": MdProps; "md-ripple": MdProps; "md-focus-ring": MdProps; "md-elevation": MdProps;
    }
  }
}

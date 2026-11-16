import type { Config } from "tailwindcss";

// Tailwind for the shadcn/ui components in components/ui (the HAX component library draws its
// shadcn version with them). It is a second, separate build (npm run kit:css writes
// components/ui/shadcn.css from components/ui/shadcn.src.css), so shadcn's colour names
// (primary, muted, accent…) never touch the site's own tailwind.config.ts, which uses some of
// the same names for other colours. (Tailwind 3's @config would leak this config into the
// site's own CSS in next dev, so the build runs on its own.)
//   · Every utility is scoped to the shadcn stage ([data-ds="shadcn"]), so it only applies
//     there and outranks a same-named site utility.
//   · Colours read shadcn's CSS variables (set on the stage in ds-shadcn.css) and still take
//     an opacity modifier (bg-primary/90, ring-ring/50).
//   · dark: is the site's dark theme (html[data-hax-theme="dark"]).
//   · The components are shadcn's new-york v4 source; the few v4-only class names are written
//     the Tailwind 3 way (aria-[invalid=true]:, [field-sizing:content]).
const c = (v: string) => `color-mix(in oklab, var(--${v}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  content: ["./components/ui/**/*.{ts,tsx}", "./components/hax/v1/library/kit/**/*.{ts,tsx}"],
  important: '[data-ds="shadcn"]',
  darkMode: ["variant", '&:is(html[data-hax-theme="dark"] *)'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        border: c("border"),
        input: c("input"),
        ring: c("ring"),
        background: c("background"),
        foreground: c("foreground"),
        primary: { DEFAULT: c("primary"), foreground: c("primary-foreground") },
        secondary: { DEFAULT: c("secondary"), foreground: c("secondary-foreground") },
        destructive: { DEFAULT: c("destructive"), foreground: c("primary-foreground") },
        muted: { DEFAULT: c("muted"), foreground: c("muted-foreground") },
        accent: { DEFAULT: c("accent"), foreground: c("accent-foreground") },
        popover: { DEFAULT: c("popover"), foreground: c("popover-foreground") },
        card: { DEFAULT: c("card"), foreground: c("card-foreground") },
        success: { DEFAULT: c("success"), soft: c("success-soft") },
        warning: { DEFAULT: c("warning"), soft: c("warning-soft") },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Tailwind 4's shadow scale, which shadcn v4 is drawn with
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

import "./embed.css";

/**
 * Bare layout for /embed/* — no site header/nav. Inherits the root layout
 * (fonts + globals.css, which pulls in pattern-components.css), so embedded
 * pattern components are styled exactly as on their detail pages.
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="embed-root">{children}</div>;
}

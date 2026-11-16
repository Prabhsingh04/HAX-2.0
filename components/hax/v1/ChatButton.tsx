// Figma: Chat button 98:19979 (fixed bottom-right)
export function ChatButton() {
  return (
    <a href="/contact" aria-label="Talk to the HAX team" data-node-id="98:19979"
      className="hx-chat fixed bottom-[24px] right-[24px] z-40 bg-[var(--surface-assistant)] flex items-center justify-center rounded-[24px] size-[48px]"
      style={{ filter: "drop-shadow(0px 6px 8px rgba(16,24,40,0.22))" }}>
      <img alt="" src="/hax/v1/icon-message-square.svg" className="size-[20px]" />
    </a>
  );
}

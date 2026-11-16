// The design system the kit is drawn in. The switch at the top of the library sidebar offers
// both: shadcn/ui and Material 3. Same components, same options and copy; only the system underneath changes.
// No React here, so server pages can read ?ds= too.
export type DS = "shadcn" | "m3";

// ?ds=material picks Material 3; anything else is shadcn/ui
export const dsFrom = (v?: string | string[] | null): DS => (v === "material" || v === "m3" ? "m3" : "shadcn");

// keep the chosen system on every library link
export const withDS = (href: string, ds: DS) => {
  if (ds !== "m3") return href;
  const [path, hash] = href.split("#");
  return `${path}${path.includes("?") ? "&" : "?"}ds=material${hash ? `#${hash}` : ""}`;
};

// Lucide icon → Material Symbol. Material never uses Lucide, so the Material version swaps
// every icon for Google's own (Material Symbols Outlined).
export const SYM = {
  ArrowRight: "arrow_forward", ArrowUp: "arrow_upward", ArrowUpRight: "arrow_outward", AudioLines: "graphic_eq",
  BellRing: "notifications_active", BookOpen: "menu_book", Bot: "smart_toy", Braces: "data_object", Brain: "psychology",
  Calendar: "calendar_today", Check: "check", ChevronDown: "expand_more", ChevronLeft: "chevron_left", ChevronRight: "chevron_right",
  CircleAlert: "error", Cloud: "cloud", Code2: "code", Copy: "content_copy", Download: "download", Expand: "open_in_full",
  FileText: "description", Folder: "folder", GitBranch: "fork_right", GitFork: "call_split", GitPullRequest: "merge",
  Globe: "language", GripVertical: "drag_indicator", Hand: "back_hand", HardDrive: "hard_drive", History: "history",
  Image: "image", Info: "info", Languages: "translate", Laptop: "laptop", ListChecks: "checklist", ListTree: "format_list_bulleted",
  Lock: "lock", Mail: "mail", Maximize2: "fullscreen", MessageCircle: "chat_bubble", MessageSquare: "chat", Mic: "mic",
  Minimize2: "close_fullscreen", Palette: "palette", Paperclip: "attach_file", Pause: "pause", Pencil: "edit", Play: "play_arrow",
  Plus: "add", Ratio: "aspect_ratio", RefreshCw: "refresh", RotateCcw: "restore", Search: "search", Share2: "share",
  ShieldCheck: "verified_user", SlidersHorizontal: "tune", Sparkle: "auto_awesome", Square: "stop", Telescope: "travel_explore",
  Terminal: "terminal", ThumbsDown: "thumb_down", ThumbsUp: "thumb_up", Ticket: "confirmation_number", Trash2: "delete",
  Wand2: "auto_fix_high", WifiOff: "wifi_off", Wrench: "build", X: "close", Zap: "bolt",
} as const;
export type SymName = keyof typeof SYM;

const SYMBOLS = [...new Set(Object.values(SYM))].sort().join(",");
export const FONTS: Record<DS, string[]> = {
  shadcn: ["https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"],
  m3: [
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap",
    // only the symbols the kit uses; block so a name never shows as text while the font loads
    `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400..600,0..1,0&icon_names=${SYMBOLS}&display=block`,
  ],
};

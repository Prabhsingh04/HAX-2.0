"use client";
import type { CSSProperties, JSX } from "react";
import {
  AlignLeft as LAlignLeft,
  SquarePen as LSquarePen,
  ArrowRight as LArrowRight,
  ArrowUp as LArrowUp,
  ArrowUpRight as LArrowUpRight,
  AudioLines as LAudioLines,
  BellRing as LBellRing,
  BookOpen as LBookOpen,
  Bot as LBot,
  Braces as LBraces,
  Brain as LBrain,
  Calendar as LCalendar,
  Check as LCheck,
  ChevronDown as LChevronDown,
  ChevronLeft as LChevronLeft,
  ChevronRight as LChevronRight,
  CircleAlert as LCircleAlert,
  Cloud as LCloud,
  Code2 as LCode2,
  Copy as LCopy,
  Download as LDownload,
  Expand as LExpand,
  FileText as LFileText,
  Folder as LFolder,
  GitBranch as LGitBranch,
  GitFork as LGitFork,
  GitPullRequest as LGitPullRequest,
  Globe as LGlobe,
  GripVertical as LGripVertical,
  Hand as LHand,
  HardDrive as LHardDrive,
  History as LHistory,
  Image as LImage,
  Info as LInfo,
  Languages as LLanguages,
  Laptop as LLaptop,
  ListChecks as LListChecks,
  ListTree as LListTree,
  LoaderCircle as LLoaderCircle,
  Lock as LLock,
  Mail as LMail,
  Maximize2 as LMaximize2,
  MessageCircle as LMessageCircle,
  MessageSquare as LMessageSquare,
  Mic as LMic,
  Minimize2 as LMinimize2,
  Palette as LPalette,
  Paperclip as LPaperclip,
  Pause as LPause,
  Pencil as LPencil,
  Play as LPlay,
  Plus as LPlus,
  Ratio as LRatio,
  RefreshCw as LRefreshCw,
  RotateCcw as LRotateCcw,
  Search as LSearch,
  Share2 as LShare2,
  ShieldCheck as LShieldCheck,
  SlidersHorizontal as LSlidersHorizontal,
  Sparkle as LSparkle,
  Square as LSquare,
  Telescope as LTelescope,
  Terminal as LTerminal,
  ThumbsDown as LThumbsDown,
  ThumbsUp as LThumbsUp,
  Ticket as LTicket,
  Trash2 as LTrash2,
  Wand2 as LWand2,
  WifiOff as LWifiOff,
  Wrench as LWrench,
  X as LX,
  Zap as LZap,
  type LucideIcon as LIcon, type LucideProps,
} from "lucide-react";
import { SYM, type SymName } from "./ds-shared";
import { useDS } from "./ds";

// The kit imports its icons from here instead of lucide-react. In shadcn/ui they are the Lucide
// icons themselves; in Material 3 each one is its Material Symbol (md-icon), at Material's
// icon sizes. `slot` puts an icon into a Material component's slot (parts.tsx does that), and
// there the component sizes it.
export type IconProps = LucideProps & { slot?: string; "data-md"?: string };
export type LucideIcon = ((p: IconProps) => JSX.Element) & { icon?: { lucide: string; symbol: string } };

const mSize = (px: number) => (px <= 12 ? 16 : px <= 16 ? 18 : px <= 18 ? 20 : 24);

function icon(name: SymName, Lu: LIcon): LucideIcon {
  const I: LucideIcon = ({ slot, "data-md": inButton, ...p }: IconProps) => {
    const ds = useDS();
    if (ds !== "m3") return <Lu {...p} />;
    const px = Number(p.size ?? 24), filled = !!p.fill && p.fill !== "none", bold = Number(p.strokeWidth ?? 2) >= 2.5;
    // size and weight go in as variables, so a part (a chip, an avatar) can set its own size;
    // inside a Material component's slot the component sets the size instead
    const st = { "--hk-s": `${mSize(px)}px`, "--hk-fill": filled ? 1 : 0, "--hk-wght": bold ? 600 : 400, ...p.style } as CSSProperties;
    return <md-icon aria-hidden="true" slot={slot} data-md={inButton} className={`hk-sym ${p.className ?? ""}`} style={st}>{SYM[name]}</md-icon>;
  };
  I.icon = { lucide: name, symbol: SYM[name] };
  return I;
}

// a spinner in Material is its circular progress indicator, not a turning glyph
export const LoaderCircle: LucideIcon = ({ slot, "data-md": _md, ...p }: IconProps) => {
  const ds = useDS();
  if (ds !== "m3") return <LLoaderCircle {...p} />;
  const px = Number(p.size ?? 24);
  return <md-circular-progress indeterminate aria-label="Working" slot={slot} className={`hk-mdcp ${p.className ?? ""}`}
    style={{ "--md-circular-progress-size": `${px + 4}px`, ...p.style } as CSSProperties} />;
};
LoaderCircle.icon = { lucide: "LoaderCircle", symbol: "progress_activity" };

export const AlignLeft = icon("AlignLeft", LAlignLeft);
export const SquarePen = icon("SquarePen", LSquarePen);
export const ArrowRight = icon("ArrowRight", LArrowRight);
export const ArrowUp = icon("ArrowUp", LArrowUp);
export const ArrowUpRight = icon("ArrowUpRight", LArrowUpRight);
export const AudioLines = icon("AudioLines", LAudioLines);
export const BellRing = icon("BellRing", LBellRing);
export const BookOpen = icon("BookOpen", LBookOpen);
export const Bot = icon("Bot", LBot);
export const Braces = icon("Braces", LBraces);
export const Brain = icon("Brain", LBrain);
export const Calendar = icon("Calendar", LCalendar);
export const Check = icon("Check", LCheck);
export const ChevronDown = icon("ChevronDown", LChevronDown);
export const ChevronLeft = icon("ChevronLeft", LChevronLeft);
export const ChevronRight = icon("ChevronRight", LChevronRight);
export const CircleAlert = icon("CircleAlert", LCircleAlert);
export const Cloud = icon("Cloud", LCloud);
export const Code2 = icon("Code2", LCode2);
export const Copy = icon("Copy", LCopy);
export const Download = icon("Download", LDownload);
export const Expand = icon("Expand", LExpand);
export const FileText = icon("FileText", LFileText);
export const Folder = icon("Folder", LFolder);
export const GitBranch = icon("GitBranch", LGitBranch);
export const GitFork = icon("GitFork", LGitFork);
export const GitPullRequest = icon("GitPullRequest", LGitPullRequest);
export const Globe = icon("Globe", LGlobe);
export const GripVertical = icon("GripVertical", LGripVertical);
export const Hand = icon("Hand", LHand);
export const HardDrive = icon("HardDrive", LHardDrive);
export const History = icon("History", LHistory);
export const Image = icon("Image", LImage);
export const Info = icon("Info", LInfo);
export const Languages = icon("Languages", LLanguages);
export const Laptop = icon("Laptop", LLaptop);
export const ListChecks = icon("ListChecks", LListChecks);
export const ListTree = icon("ListTree", LListTree);
export const Lock = icon("Lock", LLock);
export const Mail = icon("Mail", LMail);
export const Maximize2 = icon("Maximize2", LMaximize2);
export const MessageCircle = icon("MessageCircle", LMessageCircle);
export const MessageSquare = icon("MessageSquare", LMessageSquare);
export const Mic = icon("Mic", LMic);
export const Minimize2 = icon("Minimize2", LMinimize2);
export const Palette = icon("Palette", LPalette);
export const Paperclip = icon("Paperclip", LPaperclip);
export const Pause = icon("Pause", LPause);
export const Pencil = icon("Pencil", LPencil);
export const Play = icon("Play", LPlay);
export const Plus = icon("Plus", LPlus);
export const Ratio = icon("Ratio", LRatio);
export const RefreshCw = icon("RefreshCw", LRefreshCw);
export const RotateCcw = icon("RotateCcw", LRotateCcw);
export const Search = icon("Search", LSearch);
export const Share2 = icon("Share2", LShare2);
export const ShieldCheck = icon("ShieldCheck", LShieldCheck);
export const SlidersHorizontal = icon("SlidersHorizontal", LSlidersHorizontal);
export const Sparkle = icon("Sparkle", LSparkle);
export const Square = icon("Square", LSquare);
export const Telescope = icon("Telescope", LTelescope);
export const Terminal = icon("Terminal", LTerminal);
export const ThumbsDown = icon("ThumbsDown", LThumbsDown);
export const ThumbsUp = icon("ThumbsUp", LThumbsUp);
export const Ticket = icon("Ticket", LTicket);
export const Trash2 = icon("Trash2", LTrash2);
export const Wand2 = icon("Wand2", LWand2);
export const WifiOff = icon("WifiOff", LWifiOff);
export const Wrench = icon("Wrench", LWrench);
export const X = icon("X", LX);
export const Zap = icon("Zap", LZap);

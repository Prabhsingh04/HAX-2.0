// Material 3 for the web (@material/web, Google's own Material 3 components). Loaded in the
// browser only (they are custom elements); ds.tsx imports this once a Material stage mounts.
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/button/text-button.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/iconbutton/filled-icon-button.js";
import "@material/web/iconbutton/filled-tonal-icon-button.js";
import "@material/web/iconbutton/outlined-icon-button.js";
import "@material/web/chips/assist-chip.js";
import "@material/web/chips/filter-chip.js";
import "@material/web/chips/input-chip.js";
import "@material/web/chips/suggestion-chip.js";
import "@material/web/chips/chip-set.js";
import "@material/web/checkbox/checkbox.js";
import "@material/web/radio/radio.js";
import "@material/web/switch/switch.js";
import "@material/web/progress/linear-progress.js";
import "@material/web/progress/circular-progress.js";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/divider/divider.js";
import "@material/web/icon/icon.js";
import "@material/web/list/list.js";
import "@material/web/list/list-item.js";
import "@material/web/menu/menu-item.js";
import "@material/web/ripple/ripple.js";
import "@material/web/focus/md-focus-ring.js";
import "@material/web/elevation/elevation.js";

export const MD_TAGS = [
  "md-filled-button", "md-filled-tonal-button", "md-outlined-button", "md-text-button",
  "md-icon-button", "md-filled-icon-button", "md-filled-tonal-icon-button", "md-outlined-icon-button",
  "md-assist-chip", "md-filter-chip", "md-input-chip", "md-suggestion-chip", "md-chip-set",
  "md-checkbox", "md-radio", "md-switch", "md-linear-progress", "md-circular-progress", "md-outlined-text-field",
  "md-divider", "md-icon", "md-list", "md-list-item", "md-menu-item", "md-ripple", "md-focus-ring", "md-elevation",
] as const;

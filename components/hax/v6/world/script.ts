// Kept out of Intro.tsx (a client module) so the server-rendered home page can inline the script.
export const INTRO_SEEN = "hax-v6-intro";

// Runs in the page before it paints: decide whether the intro plays (not seen this session, motion
// allowed, or ?intro to force it) and mark <html>, so motion.css hides the page until the intro has
// played (the intro itself stays visible).
export const INTRO_SCRIPT = `try{var f=/[?&]intro\\b/.test(location.search);if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&(f||sessionStorage.getItem("${INTRO_SEEN}")!=="1"))document.documentElement.dataset.hax6Intro="on"}catch(e){}`;

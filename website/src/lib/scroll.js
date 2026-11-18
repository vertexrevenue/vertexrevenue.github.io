import Lenis from "lenis";

/* One shared scroll + pointer state. DOM and 3D both read from it, so the
   camera and the text never drift apart. */
export const S = {
  y: 0,
  vh: typeof window !== "undefined" ? window.innerHeight : 800,
  vw: typeof window !== "undefined" ? window.innerWidth : 1200,
  step: 0,
  storyP: 0,
  mouse: { x: 0, y: 0 },
  sec: {},
  reduced: typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  static: false,
};

export let lenis = null;
const subs = new Set();
export const onScroll = (fn) => { subs.add(fn); fn(S); return () => subs.delete(fn); };

export const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

export function measure() {
  S.vh = window.innerHeight;
  S.vw = window.innerWidth;
  ["hero", "how", "strip", "content", "book"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) S.sec[id] = { top: el.getBoundingClientRect().top + window.scrollY, h: el.offsetHeight };
  });
}

function tick() {
  S.y = window.scrollY;
  subs.forEach((f) => f(S));
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView();
}

let started = false;
export function initScroll() {
  if (started) return;
  started = true;
  if (!S.reduced) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", tick);
  }
  addEventListener("scroll", tick, { passive: true });
  addEventListener("resize", () => { measure(); tick(); });
  addEventListener("pointermove", (e) => {
    S.mouse.x = e.clientX / innerWidth - 0.5;
    S.mouse.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });
  new ResizeObserver(() => { measure(); tick(); }).observe(document.body);
  measure();
  tick();
}

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

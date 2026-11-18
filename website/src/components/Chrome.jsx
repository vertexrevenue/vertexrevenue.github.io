import { useEffect, useRef, useState } from "react";
import Mark from "./Mark";
import { BOOKING_URL } from "../config";
import { scrollToId, S, onScroll } from "../lib/scroll";

/* Wordmark: the name assembles from fine silver dots, settles into solid
   letters, then a slow light passes across it now and then. Calm, not loud. */
function Wordmark({ text = "Vertex Revenue" }) {
  const wrap = useRef(), label = useRef(), cv = useRef();
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let raf, alive = true;
    const run = (spread, duration) => {
      const el = label.current, c = cv.current;
      if (!el || !c) return;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const pad = 24, dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.ceil(r.width) + pad * 2, h = Math.ceil(r.height) + pad * 2;
      c.width = w * dpr; c.height = h * dpr; c.style.width = `${w}px`; c.style.height = `${h}px`;
      c.style.left = `${-pad}px`; c.style.top = `${-pad}px`;
      const g = c.getContext("2d");
      const off = document.createElement("canvas"); off.width = w; off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true });
      o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      try { o.fontStretch = "expanded"; o.letterSpacing = cs.letterSpacing; } catch {}
      o.textBaseline = "middle"; o.fillStyle = "#fff";
      o.fillText(el.textContent.toUpperCase(), pad, h / 2 + 1);
      const data = o.getImageData(0, 0, w, h).data;
      const pts = [];
      for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 120) pts.push({ tx: x, ty: y, x: x + (Math.random() - 0.5) * spread * 2, y: y + (Math.random() - 0.5) * spread, d: Math.random() * 0.35 });
      const t0 = performance.now();
      setSettled(false);
      const frame = (now) => {
        if (!alive) return;
        const t = (now - t0) / duration;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);
        for (const p of pts) {
          const k = Math.min(Math.max((t - p.d) / (1 - p.d), 0), 1);
          const e = 1 - Math.pow(1 - k, 3);
          const x = p.x + (p.tx - p.x) * e, y = p.y + (p.ty - p.y) * e;
          g.fillStyle = k < 1 ? `rgba(196,200,208,${0.35 + 0.65 * e})` : "#e9ebef";
          g.beginPath(); g.arc(x, y, 0.85, 0, 6.2832); g.fill();
        }
        if (t < 1.05) raf = requestAnimationFrame(frame);
        else setSettled(true);
      };
      raf = requestAnimationFrame(frame);
    };
    const start = () => run(S.reduced ? 0 : 46, S.reduced ? 1 : 1500);
    document.fonts.ready.then(() => setTimeout(start, 650));
    const again = () => run(8, 700);
    const el = wrap.current;
    el && el.addEventListener("mouseenter", again);
    return () => { alive = false; cancelAnimationFrame(raf); el && el.removeEventListener("mouseenter", again); };
  }, []);
  return (
    <span className={`wordmark ${settled ? "settled" : ""}`} ref={wrap}>
      <span className="wm-text" ref={label}>{text}</span>
      <canvas className="wm-dots" ref={cv} aria-hidden="true" />
    </span>
  );
}

export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => onScroll((s) => setSolid(s.y > 40)), []);
  const go = (id) => (e) => { e.preventDefault(); scrollToId(id); };
  return (
    <nav className={`nav ${solid ? "solid" : ""}`} aria-label="Main">
      <a className="brand" href="#hero" onClick={go("hero")} aria-label="Vertex Revenue home">
        <Mark size={30} />
        <Wordmark />
      </a>
      <ul className="links">
        <li><a href="#process" onClick={go("process")}>How it works</a></li>
        <li><a href="#brief" onClick={go("brief")}>Sample brief</a></li>
        <li><a href="#pricing" onClick={go("pricing")}>Pricing</a></li>
        <li><a href="#faq" onClick={go("faq")}>FAQ</a></li>
      </ul>
      <a className="pill" href={BOOKING_URL} target="_blank" rel="noopener">Book a call</a>
    </nav>
  );
}

export function Loader({ done }) {
  return (
    <div className={`loader ${done ? "out" : ""}`} aria-hidden="true">
      <div className="loader-in">
        <Mark size={64} />
      </div>
    </div>
  );
}

/* Reveal: headings rise word by word when they enter the screen. */
export function Split({ as: Tag = "h2", children, className = "", now = false }) {
  const ref = useRef();
  const [seen, setSeen] = useState(now);
  useEffect(() => {
    if (now || S.static) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [now]);
  const words = String(children).split(" ");
  return (
    <Tag ref={ref} className={`${className} split ${seen ? "seen" : ""}`} aria-label={String(children)}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w" aria-hidden="true">
            <span style={{ transitionDelay: `${i * 60}ms` }}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

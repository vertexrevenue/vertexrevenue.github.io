import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BOOKING_URL, LINKEDIN_URL, EMAIL } from "../config";
import { S, onScroll, clamp, measure } from "../lib/scroll";
import { Split } from "./Chrome";
import Mark from "./Mark";
import { stepFor } from "../three/layout";

const LogoStage = lazy(() => import("../three/LogoStage"));

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 64 12" aria-hidden="true"><path d="M0 6h62M56 1l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
);

function BookLink({ children = "Book a 20-minute call" }) {
  return (
    <a className="linecta" href={BOOKING_URL} target="_blank" rel="noopener">
      <span>{children}</span><Arrow />
    </a>
  );
}

export function Hero({ ready, gl }) {
  return (
    <header className={`hero ${ready ? "in" : ""}`} id="hero">
      <div className="hero-copy">
        <Split as="h1" className="serif h1" now={ready}>Sales calls worth taking.</Split>
        <div className="fade">
          <p className="lede">Vertex Revenue books pre-qualified sales calls for US agencies and consultancies. Every prospect is checked for a real problem, budget and authority, and says yes to the call before it reaches your calendar.</p>
          <BookLink />
          <ul className="ticks">
            <li>Month-to-month</li>
            <li>No lock-in</li>
            <li>Booked means on your calendar</li>
          </ul>
        </div>
      </div>
      <div className="hero-object fade">
        {gl ? (
          <Suspense fallback={null}><LogoStage /></Suspense>
        ) : (
          <Mark size={260} className="hero-mark" />
        )}
        <p className="hint">Drag to turn it</p>
      </div>
      <p className="define fade"><b>Vertex</b>, noun. The point where everything narrows to one.</p>
    </header>
  );
}

const STEPS = [
  { k: "How we qualify", h: "Every prospect arrives as a reply.", p: "Someone answers our outreach. Before they get anywhere near your calendar, they pass four checks. Most don't." },
  { k: "Check 1 of 4", h: "A real problem.", p: "Something specific is holding growth back, and they can say what it is. Curiosity and \"just exploring\" stop here." },
  { k: "Check 2 of 4", h: "Budget.", p: "They have paid outside firms before, or have money set aside now. If your price would end the call, the call never happens." },
  { k: "Check 3 of 4", h: "Authority.", p: "They make the buying decision. No one who has to \"run it by the VP\" and pitch your work secondhand." },
  { k: "Check 4 of 4", h: "An explicit yes.", p: "They asked for the call. Nobody is surprised when your invite arrives, and nobody wants it handled \"over email instead\"." },
  { k: "Booked", h: "One call. On your calendar.", p: "Scheduled, confirmed and accepted, with the reasons it qualified written into the invite. You walk in knowing who you are talking to." },
  { k: "Your side", h: "Where revenue starts.", p: "Every booked call is a real buying conversation. Closing it is your job. Filling your calendar with ones worth closing is ours." },
];

export function Story() {
  const [step, setStep] = useState(0);
  useEffect(() => onScroll((s) => {
    if (S.static) { setStep(6); return; }
    const sec = s.sec.how; if (!sec) return;
    const p = clamp((s.y - sec.top) / (sec.h - s.vh));
    s.storyP = p;
    const n = stepFor(p);
    s.step = n;
    setStep(n);
  }), []);
  return (
    <section className="story" id="how" aria-label="How a prospect is qualified">
      <div className="stage">
        <div className="steps-col">
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={i} className={i === step || S.static ? "on" : ""}>
                <span className="k">{s.k}</span>
                <h2 className="serif h2">{s.h}</h2>
                <p>{s.p}</p>
              </li>
            ))}
          </ol>
          <div className="meter" aria-hidden="true">{[1, 2, 3, 4].map((i) => <i key={i} className={step > i || (step === 5 || step === 6) ? "on" : ""} />)}</div>
        </div>
        <p className={`illus ${step >= 5 ? "on" : ""}`}>Illustration of our process. Not client data, not a forecast.</p>
      </div>
    </section>
  );
}

const QUESTIONS = [
  { q: "Is growing the business a priority this quarter, or are you holding steady?", a: [["Continues if", "growth is the goal, or growth has stalled and they want it moving again."]] },
  { q: "What's the main thing in the way right now: leads, systems, or the right partner?", a: [["Tells us", "whether the problem is one your firm actually solves."]] },
  { q: "Have you worked with an outside firm or consultant on this before?", a: [["Continues if", "they invested and would again."], ["Stops if", "they never have and won't."]] },
  { q: "Are you the person who signs off on a decision like this?", a: [["Stops if", "someone else decides. We find that person instead."]] },
  { q: "Want me to set up a call with a firm I work with?", a: [["If yes,", "it goes on your calendar. That is the only way a call gets booked."]] },
];

/* Pinned horizontal strip: the five screening questions slide in from the
   right, and each card's text sweeps from cobalt to white as it arrives. */
export function Strip() {
  const sec = useRef(), track = useRef(), cards = useRef([]);
  useEffect(() => {
    const size = () => {
      if (!track.current || !sec.current) return;
      if (S.static || innerWidth < 760) { sec.current.style.height = ""; return; }
      const tw = track.current.scrollWidth;
      sec.current.style.height = `${Math.max(tw - innerWidth, 0) + innerHeight * 1.15}px`;
      measure();
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(track.current);
    addEventListener("resize", size);
    const off = onScroll((s) => {
      if (!track.current || S.static || innerWidth < 760) return;
      const box = s.sec.strip; if (!box) return;
      const r = clamp((s.y - box.top) / (box.h - s.vh));
      const tw = track.current.scrollWidth;
      const x = -r * Math.max(tw - innerWidth, 0);
      track.current.style.transform = `translate3d(${x}px,0,0)`;
      cards.current.forEach((c) => {
        if (!c) return;
        const left = c.getBoundingClientRect().left;
        const v = clamp((1.05 - left / innerWidth) / 0.14, -0.4, 1.6) * 100;
        c.style.setProperty("--s", v.toFixed(1));
      });
    });
    return () => { ro.disconnect(); off(); removeEventListener("resize", size); };
  }, []);
  return (
    <section className="strip" id="strip" ref={sec}>
      <div className="strip-stage">
        <div className="strip-track" ref={track}>
          <div className="strip-lead">
            <Split className="serif h2">What we ask before anyone reaches you.</Split>
            <div className="lead-copy">
              <p>The base script is below. Before we start, we tailor it to your offer, your price and the buyer you actually want.</p>
              <p>A prospect who fails a question does not move forward. No exceptions to fill a quota.</p>
            </div>
          </div>
          {QUESTIONS.map((x, i) => (
            <article className="qcard" key={i} ref={(el) => (cards.current[i] = el)} style={{ "--s": 100 }}>
              <span className="qn">Question {i + 1}</span>
              <h3 className="serif sweep">"{x.q}"</h3>
              <p className="sweep">{x.a.map(([b, t], j) => <span key={j}><b>{b}</b> {t} </span>)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Counts() {
  return (
    <section className="block" id="counts">
      <Split className="serif h2 narrow">A call counts only when all three are true.</Split>
      <div className="glass three">
        <div>
          <svg viewBox="0 0 28 28" aria-hidden="true"><rect x="3" y="5" width="22" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3 11h22M9 2v6M19 2v6" stroke="currentColor" strokeWidth="1.6" /></svg>
          <h3>Scheduled</h3>
          <p>A specific date and time, agreed with the prospect. Not "sometime next week".</p>
        </div>
        <div>
          <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M8.5 14.5l3.8 3.8 7.4-8" fill="none" stroke="#7C85FF" strokeWidth="2" /></svg>
          <h3>Confirmed</h3>
          <p>The prospect has said yes to the call and knows exactly what it is for.</p>
        </div>
        <div>
          <svg viewBox="0 0 28 28" aria-hidden="true"><rect x="3" y="5" width="22" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" /><rect x="8" y="14" width="12" height="6" rx="1.5" fill="#4C57FF" /></svg>
          <h3>On your calendar</h3>
          <p>The invite is in your calendar, accepted, with the qualification notes attached.</p>
        </div>
      </div>
      <p className="note serif">If any one of the three is missing, it is not a booked call and it does not count toward your month.</p>
    </section>
  );
}

export function Fit() {
  return (
    <section className="block" id="fit">
      <Split className="serif h2 narrow">Built for firms that already close on calls.</Split>
      <div className="fit">
        <div className="glass">
          <h3>A good fit</h3>
          <ul>
            <li>US agencies, consultancies, fractional executives, B2B recruiters and IT services firms</li>
            <li>High-ticket engagements, where one closed deal pays for months of this</li>
            <li>You already sell on calls and know what a good one looks like</li>
            <li>Bad-fit calls are costing you hours every week</li>
          </ul>
        </div>
        <div className="glass no">
          <h3>Not a fit</h3>
          <ul>
            <li>Low-ticket offers where volume matters more than quality</li>
            <li>No sales process yet, or nobody to take the calls</li>
            <li>You want a guaranteed revenue number</li>
            <li>You need hundreds of meetings a month, not a handful of right ones</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Terms() {
  return (
    <section className="block" id="terms">
      <div className="terms-head">
        <Split className="serif giant">No logos here. Yet.</Split>
        <p>Vertex Revenue is new. We have no case studies to show you, and we will not invent any. So instead of asking for trust up front, we set the terms up so you never have to give much of it.</p>
      </div>
      <div className="glass three">
        <div><h3>Month-to-month</h3><p>If the calls are not qualified, you stop. No lock-in, no notice period, no long contract to sign.</p></div>
        <div><h3>You can check every call</h3><p>Each invite carries the answers that qualified it. If a call doesn't match them, you will know in the first five minutes.</p></div>
        <div><h3>A few firms at a time</h3><p>We take on very few clients so screening quality holds. You deal with the founder directly, not an account manager.</p></div>
      </div>
      <p className="note serif">We don't promise revenue. <span>We promise conversations with people who can buy.</span></p>
    </section>
  );
}

export function CTA() {
  return (
    <section className="cta" id="book">
      <div className="cta-in">
        <Split className="serif giant">20 minutes. Then you decide.</Split>
        <p>We'll look at who you sell to, what a good call looks like for you, and whether we're the right fit. If we're not, we'll say so on the call.</p>
        <p className="hours">Calls run Monday to Friday, 8:30 to 10:30 AM Eastern.</p>
        <div className="actions">
          <a className="pill big" href={BOOKING_URL} target="_blank" rel="noopener">Book a 20-minute call</a>
          <a className="ghost" href={LINKEDIN_URL} target="_blank" rel="noopener">Message Deepansh on LinkedIn</a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <span className="f-brand"><Mark size={22} /> Vertex Revenue. Founded by <a href={LINKEDIN_URL} target="_blank" rel="noopener">Deepansh Deep</a>.</span>
      <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
    </footer>
  );
}

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
          <p className="lede">We book pre-qualified sales calls for US agencies and consultancies. Every prospect has a real problem, the budget to solve it and the authority to decide, and has said yes to the call before it reaches your calendar.</p>
          <BookLink />
          <ul className="ticks">
            <li>$500 a month</li>
            <li>Month-to-month</li>
            <li>Unqualified calls replaced</li>
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


/* ---------- How it works: the first 30 days ---------- */
const DAYS = [
  { t: "Days 1 to 3", h: "Onboarding call", p: "45 minutes. We agree who your ideal buyer is, what you sell, your price, and what a good call looks like for you. You approve the screening script." },
  { t: "Week 1", h: "Target list", p: "US firms that match your buyer, researched one by one from public sources. No bought lists, no scraped databases." },
  { t: "Week 2", h: "Outreach starts", p: "Short, personal emails sent as Vertex Revenue. Your firm is introduced only when a prospect is interested, so your domain and name stay untouched." },
  { t: "Week 2 onward", h: "Calls land on your calendar", p: "Each one confirmed and accepted, with a call brief: who they are, the problem in their words, budget, authority and why now." },
  { t: "Every Friday", h: "A plain report", p: "Who we contacted, who replied, who qualified, who didn't and why. Nothing hidden behind a dashboard." },
  { t: "Day 30", h: "You decide", p: "Continue, change the target, or stop. No notice period, no exit fee." },
];

export function Timeline() {
  return (
    <section className="block" id="process">
      <div className="block-head">
        <Split className="serif h2 narrow">Your first 30 days.</Split>
        <p className="sub">What happens after you book, week by week. No setup fee, nothing to install.</p>
      </div>
      <ol className="timeline">
        {DAYS.map((d, i) => (
          <li key={i}>
            <span className="t">{d.t}</span>
            <h3>{d.h}</h3>
            <p>{d.p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Proof: a sample call brief ---------- */
export function Brief() {
  return (
    <section className="block" id="brief">
      <div className="brief-grid">
        <div>
          <Split className="serif h2 narrow">What arrives with every call.</Split>
          <p className="sub">We can't show client results yet. We can show exactly what you get. This is the brief attached to every call we book.</p>
          <ul className="brief-notes">
            <li>Written by a person after the qualification conversation</li>
            <li>Uses the prospect's own words, not our summary of them</li>
            <li>Lands in the calendar invite, so it's there when you open the call</li>
          </ul>
        </div>
        <article className="brief glass" aria-label="Sample call brief">
          <header className="brief-top">
            <span className="tag">Sample</span>
            <span className="muted">Illustrative prospect. Not a real company or client.</span>
          </header>
          <h3>Call brief: COO, 40-person HVAC distributor, Ohio</h3>
          <p className="when">Thursday, 10:30 to 11:00 AM ET. Accepted.</p>
          <dl>
            <div><dt>Problem</dt><dd>"Our pipeline stalled after our sales lead left in August. Referrals alone aren't covering it."</dd></div>
            <div><dt>Budget</dt><dd>Paid a marketing agency last year. Has budget set aside for outside help this quarter.</dd></div>
            <div><dt>Authority</dt><dd>Signs off on vendors without board approval. The CEO trusts their call on sales.</dd></div>
            <div><dt>Said yes</dt><dd>Asked for the call by email on Tuesday and picked the time themselves.</dd></div>
            <div><dt>Why now</dt><dd>Wants a plan in place before their busy season starts in March.</dd></div>
            <div><dt>Watch for</dt><dd>Burned by an agency that promised leads and sent unqualified ones. Be specific about what you'd do in the first 60 days.</dd></div>
          </dl>
        </article>
      </div>
    </section>
  );
}

/* ---------- The screening questions (pinned horizontal strip) ---------- */
const QUESTIONS = [
  { k: "Priority", q: "Is growing the business a priority this quarter, or are you holding steady?", yes: "Growth is the goal, or growth has stalled and they want it moving again.", no: "\"Just curious\", or happy where they are." },
  { k: "Problem", q: "What's the main thing in the way right now: leads, systems, or the right partner?", yes: "A problem your firm actually solves.", no: "A problem outside your offer." },
  { k: "Budget", q: "Have you worked with an outside firm or consultant on this before?", yes: "Paid for outside help before and would again.", no: "Never has and won't, or calls every past spend a waste." },
  { k: "Authority", q: "Are you the person who signs off on a decision like this?", yes: "They make the call.", no: "Someone else decides. We go to that person instead." },
  { k: "Explicit yes", q: "Want me to set up a call with a firm I work with?", yes: "Says yes and picks a time.", no: "\"Just send me some information.\"" },
];

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
              <p>Software helps us research companies and draft emails. A person reads every reply and runs every qualification conversation. No bot books your calls.</p>
              <p>We tailor these five questions to your offer in week 1. Fail one and the prospect does not move forward.</p>
            </div>
          </div>
          {QUESTIONS.map((x, i) => (
            <article className="qcard" key={i} ref={(el) => (cards.current[i] = el)} style={{ "--s": 100 }}>
              <span className="qn"><b>{String(i + 1).padStart(2, "0")}</b> {x.k}</span>
              <h3 className="serif sweep">"{x.q}"</h3>
              <dl className="qa">
                <div><dt>Qualifies</dt><dd className="sweep">{x.yes}</dd></div>
                <div className="no"><dt>Stops</dt><dd>{x.no}</dd></div>
              </dl>
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
          <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M8.5 14.5l3.8 3.8 7.4-8" fill="none" stroke="#7f95ff" strokeWidth="2" /></svg>
          <h3>Confirmed</h3>
          <p>The prospect has said yes to the call and knows exactly what it is for.</p>
        </div>
        <div>
          <svg viewBox="0 0 28 28" aria-hidden="true"><rect x="3" y="5" width="22" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" /><rect x="8" y="14" width="12" height="6" rx="1.5" fill="#2f4bff" /></svg>
          <h3>On your calendar</h3>
          <p>The invite is in your calendar, accepted, with the call brief attached.</p>
        </div>
      </div>
      <div className="policy">
        <span className="policy-mark" aria-hidden="true" />
        <p><b>Our replacement policy.</b> If a booked call turns out to miss any of the four checks, tell us after the call. It does not count, and we replace it at no cost.</p>
      </div>
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
            <li>A US agency, consultancy, fractional executive, B2B recruiter or IT services firm, roughly 3 to 50 people</li>
            <li>Engagements worth $5,000 or more, where one new client pays for months of this</li>
            <li>An offer you've already sold, and someone who takes and closes sales calls</li>
            <li>Room on your calendar for new conversations every week</li>
          </ul>
        </div>
        <div className="glass no">
          <h3>Not a fit</h3>
          <ul>
            <li>Offers under $2,000, where volume matters more than fit</li>
            <li>No proven offer yet, or nobody to take the calls</li>
            <li>You want a guaranteed revenue number</li>
            <li>You need hundreds of meetings a month, not a handful of right ones</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
export function Pricing() {
  return (
    <section className="block" id="pricing">
      <div className="block-head">
        <Split className="serif h2 narrow">One plan. One price.</Split>
        <p className="sub">No setup fee, no per-call charges, no contract.</p>
      </div>
      <div className="price glass">
        <div className="price-main">
          <p className="amount"><span className="cur">$</span>500<span className="per">/ month</span></p>
          <p className="price-terms">Month-to-month. Cancel any time, no notice period.</p>
          <a className="pill big" href={BOOKING_URL} target="_blank" rel="noopener">Book a 20-minute call</a>
          <p className="price-small">We take on a small number of firms at a time, so screening quality holds.</p>
        </div>
        <ul className="price-list">
          <li>Ideal-buyer definition and screening script, agreed in week 1</li>
          <li>Researched, personal outreach to US prospects that fit</li>
          <li>Every reply read and qualified by a person, against four checks</li>
          <li>Calls booked on your calendar, each with a call brief</li>
          <li>A plain report every Friday</li>
          <li>Unqualified calls replaced at no cost</li>
        </ul>
      </div>
    </section>
  );
}

/* ---------- Founder + honesty ---------- */
export function Founder() {
  return (
    <section className="block" id="founder">
      <div className="terms-head">
        <Split className="serif giant">No logos here. Yet.</Split>
        <p>Vertex Revenue is new. We have no case studies to show you, and we will not invent any. So instead of asking for trust up front, the terms are set up so you never have to give much of it: month-to-month, every call checkable against its brief, and bad calls replaced.</p>
      </div>
      <div className="founder glass">
        <div className="founder-photo">
          <img src={`${import.meta.env.BASE_URL}founder.webp`} alt="Deepansh Deep, founder of Vertex Revenue" width="624" height="688" loading="lazy" />
        </div>
        <div className="founder-copy">
          <p className="k">The person you'll work with</p>
          <h3 className="serif">Deepansh Deep, founder</h3>
          <p>I started Vertex Revenue to do one job properly: put people on your calendar who can actually buy, and nobody else.</p>
          <p>I'm based in India and I work your mornings. Every call with me happens between 8:30 and 10:30 AM Eastern, Monday to Friday. I run each client's outreach myself, read every reply and decide who qualifies. You'll talk to me, not an account manager.</p>
          <div className="founder-links">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener">LinkedIn</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQS = [
  { q: "Who actually qualifies the prospects?", a: "A person. Software helps us research companies and draft first emails, but every reply is read by the founder, and every qualification conversation is run by a human against the four checks you approved." },
  { q: "How many calls will I get each month?", a: "It depends on your market, your offer and your price, so we won't promise a number we can't stand behind. In week 1 we agree on a realistic target together, and the Friday report shows exactly how we're tracking against it." },
  { q: "What happens if a call isn't qualified?", a: "Tell us after the call. If it missed any of the four checks, it doesn't count and we replace it at no cost. If it keeps happening, you stop. That's what month-to-month is for." },
  { q: "How do you find prospects?", a: "We research US firms that match your ideal buyer from public sources, and write to them one by one. We never buy lists or guess email addresses. Every email follows CAN-SPAM: a real postal address and a working opt-out, and opt-outs are honoured permanently." },
  { q: "Whose name is on the outreach?", a: "Ours. We reach out as Vertex Revenue and introduce your firm only when a prospect is interested. Your domain, inbox and reputation are never used for cold email." },
  { q: "What do you need from me?", a: "A 45-minute onboarding call, your booking link, sign-off on the screening script, and someone to show up to the calls. That's it." },
  { q: "Is there a contract or setup fee?", a: "No. $500 a month, month-to-month, cancel any time with no notice period." },
  { q: "What do you do with data?", a: "We only use business contact details that companies publish themselves. We don't sell or share them, and we delete a contact's details on request. Full details are in our privacy policy." },
];

export function FAQ() {
  return (
    <section className="block" id="faq">
      <div className="faq-grid">
        <Split className="serif h2 narrow">Questions founders ask first.</Split>
        <div className="faq">
          {FAQS.map((f, i) => (
            <details key={i}>
              <summary><span>{f.q}</span><i aria-hidden="true" /></summary>
              <p>{f.a}{i === FAQS.length - 1 && <> <a href="privacy.html">Read the privacy policy</a>.</>}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="cta" id="book">
      <div className="cta-in">
        <Split className="serif giant">20 minutes. Then you decide.</Split>
        <p>We'll look at who you sell to, what a good call looks like for you, and whether we're the right fit. If we're not, we'll say so on the call.</p>
        <p className="hours">Calls run Monday to Friday, 8:30 to 10:30 AM Eastern. The booking page shows times in your own time zone.</p>
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
      <nav className="f-links" aria-label="Legal">
        <a href="privacy.html">Privacy</a>
        <a href="terms.html">Terms</a>
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </nav>
    </footer>
  );
}

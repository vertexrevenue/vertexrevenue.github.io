import { lazy, Suspense, useEffect, useState } from "react";
import { initScroll, hasWebGL, S, measure, onScroll } from "./lib/scroll";
import { Nav, Loader } from "./components/Chrome";
import { Hero, Story, Strip, Counts, Fit, Terms, CTA, Footer } from "./components/Sections";

const World = lazy(() => import("./three/World"));

export default function App() {
  const [gl] = useState(() => hasWebGL());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!gl || S.reduced) {
      S.static = true;
      document.documentElement.classList.add("static");
      if (!gl) document.documentElement.classList.add("nogl");
    }
    initScroll();
    /* soften the 3D world while the long text sections are on screen */
    const offRead = onScroll((s) => {
      const c = s.sec.content;
      const on = !!c && s.y + s.vh * 0.35 > c.top && s.y + s.vh * 0.65 < c.top + c.h;
      document.documentElement.classList.toggle("reading", on);
    });
    const fallback = setTimeout(() => setReady(true), 4500);
    if (!gl) setReady(true);
    return () => { clearTimeout(fallback); offRead(); };
  }, [gl]);

  useEffect(() => { if (ready) { measure(); document.documentElement.classList.add("ready"); } }, [ready]);

  return (
    <>
      <Loader done={ready} />
      {gl && (
        <Suspense fallback={null}>
          <World onReady={() => setReady(true)} />
        </Suspense>
      )}
      <Nav />
      <main>
        <Hero ready={ready} gl={gl} />
        <Story />
        <div className="content" id="content">
          <Strip />
          <Counts />
          <Fit />
          <Terms />
        </div>
        <CTA />
      </main>
      <Footer />
    </>
  );
}

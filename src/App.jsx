import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Menu, X, Radar, Sparkles, Send, Calendar,
  Filter, CheckCircle2, XCircle, ChevronDown,
  FlaskConical, Gauge, ShieldCheck, MessageCircle,
} from "lucide-react";

/* ---------------------------------------------------------------- */
/*  Font loader                                                       */
/* ---------------------------------------------------------------- */
function useFonts() {
  useEffect(() => {
    if (document.getElementById("dardy-fonts")) return;
    const link = document.createElement("link");
    link.id = "dardy-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

const serif = "'Fraunces', Georgia, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, sans-serif";

/* Throttles a handler to at most once per animation frame — used for
   scroll/mousemove-driven state so we never schedule more paints than
   the browser can actually deliver. */
function rafThrottle(fn) {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  };
}

/* Palette
   ink       #2A1E13  primary text / display
   bg        #FAF2E3  page background (warm cream)
   surface   #F3E7D2  cards / panels
   line      rgba(42,30,19,0.12)
   muted     #8C7A63
   accent    #C1622E  terracotta (primary actions)
   accentDk  #A24F23
   sage      #6E7B5E  secondary tag color
*/

/* ---------------------------------------------------------------- */
/*  Reveal / Magnetic button                                          */
/* ---------------------------------------------------------------- */
function Reveal({ children, delay = 0, className = "", blur = false }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        filter: blur ? (visible ? "blur(0px)" : "blur(7px)") : undefined,
        transform: visible ? "translateY(0px) scale(1)" : `translateY(${blur ? 16 : 22}px) scale(${blur ? 0.975 : 1})`,
        transition: blur
          ? `opacity 1s cubic-bezier(0.19,1,0.22,1) ${delay}ms, transform 1s cubic-bezier(0.19,1,0.22,1) ${delay}ms, filter 1s cubic-bezier(0.19,1,0.22,1) ${delay}ms`
          : `opacity 0.85s cubic-bezier(0.19,1,0.22,1) ${delay}ms, transform 0.85s cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function MagneticButton({ children, variant = "primary", className = "", ...rest }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const handleMove = useRef(
    rafThrottle((e, rect) => {
      setPos({ x: (e.clientX - rect.left - rect.width / 2) * 0.14, y: (e.clientY - rect.top - rect.height / 2) * 0.14 });
    })
  ).current;
  const base = "relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide overflow-hidden transition-shadow duration-300";
  const styles =
    variant === "primary"
      ? { background: "linear-gradient(135deg, #C1622E 0%, #BC5B29 55%, #A24F23 100%)", color: "#FDF6EA", boxShadow: pressed ? "0 4px 14px -8px rgba(161,79,35,0.5)" : hovered ? "0 14px 30px -12px rgba(161,79,35,0.55)" : "0 10px 26px -10px rgba(161,79,35,0.5)" }
      : { background: "transparent", color: "#2A1E13", border: "1px solid rgba(42,30,19,0.2)" };
  return (
    <button
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={(e) => handleMove(e, ref.current.getBoundingClientRect())}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setPressed(false); setHovered(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={`${base} ${className}`}
      style={{
        ...styles,
        fontFamily: sans,
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${pressed ? 0.975 : hovered ? 1.008 : 1})`,
        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}
      {...rest}
    >
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.22) 35%, transparent 50%)",
            transform: hovered ? "translateX(60%)" : "translateX(-120%)",
            transition: `transform ${pressed ? "0.6s" : "1.1s"} cubic-bezier(0.16,1,0.3,1)`,
          }}
        />
      )}
      {children}
    </button>
  );
}

function SectionLabel({ color, children }) {
  return <p className="text-[13px] tracking-widest uppercase" style={{ fontFamily: sans, color }}>{children}</p>;
}

/* Scroll-linked depth for background glows. Speed can be negative for a
   layer that drifts the opposite direction. Writes a CSS variable via
   ref instead of React state, so scrolling never triggers a re-render. */
function Parallax({ speed = 0.1, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const update = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      node.style.setProperty("--parallax-y", `${offset}px`);
    };
    const onScroll = rafThrottle(update);
    window.addEventListener("scroll", onScroll, { passive: true });
requestAnimationFrame(update);

    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return <div ref={ref} className={className} />;
}
function SectionTitle({ children, max = "" }) {
  return (
    <h2 className={`mt-3 font-semibold text-[34px] sm:text-[42px] ${max}`} style={{ fontFamily: serif, color: "#241A10", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
      {children}
    </h2>
  );
}

/* ---------------------------------------------------------------- */
/*  Nav                                                                */
/* ---------------------------------------------------------------- */
const NAV_LINKS = [
  { label: "Method", href: "#method" },
  { label: "Who We Help", href: "#who-we-help" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const barRef = useRef(null);
  useEffect(() => {
    const update = () => {
      const node = barRef.current;
      if (!node) return;
      const scrolled = window.scrollY > 24;
      node.style.setProperty("--nav-alpha", scrolled ? "0.88" : "0.72");
      node.style.setProperty("--nav-shadow", scrolled ? "0 14px 32px -16px rgba(42,30,19,0.26)" : "0 10px 30px -16px rgba(42,30,19,0.18)");
    };
    const onScroll = rafThrottle(update);
    window.addEventListener("scroll", onScroll, { passive: true });
requestAnimationFrame(update);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav aria-label="Primary" className="fixed top-5 left-0 right-0 z-50 px-4">
      <div
        ref={barRef}
        className="nav-bar max-w-5xl mx-auto flex items-center justify-between rounded-full px-3 py-3"
        style={{ backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(42,30,19,0.08)" }}
      >
        <span className="pl-4 text-[19px] font-semibold" style={{ fontFamily: serif, color: "#2A1E13" }}>
          Dardy
        </span>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="nav-link relative text-[13.5px]"
              style={{ fontFamily: sans, color: "#5B4C3A" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <MagneticButton variant="primary" className="!px-5 !py-2.5 !text-[13px]">
            Request a Review
          </MagneticButton>
        </div>

        <button
          className="nav-toggle md:hidden w-10 h-10 rounded-full flex items-center justify-center"
          style={{ border: "1px solid rgba(42,30,19,0.15)", color: "#2A1E13" }}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden max-w-5xl mx-auto mt-2 rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "#F3E7D2", border: "1px solid rgba(42,30,19,0.1)" }}
        >
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="nav-link text-sm" style={{ fontFamily: sans, color: "#5B4C3A" }}>{l.label}</a>
          ))}
          <MagneticButton variant="primary" className="!text-[13px] w-full">Request a Review</MagneticButton>
        </div>
      )}
    </nav>
  );
}

/* ---------------------------------------------------------------- */
/*  Hero — confidential research brief, not decorative UI              */
/* ---------------------------------------------------------------- */
const DOSSIER_ROWS = [
  { label: "Signal", value: "Raised Series A, hiring first AE", icon: Radar },
  { label: "ICP fit", value: "42 employees, compliance software", icon: Filter },
  { label: "Research", value: "Audit cycle and tech stack mapped", icon: FlaskConical },
  { label: "Approach", value: "Personalized angle drafted", icon: Sparkles },
  { label: "Status", value: "Ready for outreach", icon: CheckCircle2, done: true },
];

function Hero() {
  const heroRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [cardHovered, setCardHovered] = useState(false);
  const onMove = useRef(
    rafThrottle((e, rect) => {
      setTilt({ x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 });
    })
  ).current;
  const handleHeroMove = (e) => onMove(e, heroRef.current.getBoundingClientRect());

  return (
    <section ref={heroRef} onMouseMove={handleHeroMove} className="relative overflow-hidden pt-48 pb-32 px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Parallax speed={0.06} className="warm-glow glow-1" />
        <Parallax speed={-0.08} className="warm-glow glow-2" />
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-20 items-center">
        <div>
          <Reveal blur>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] mb-7"
              style={{ fontFamily: sans, background: "rgba(193,98,46,0.1)", border: "1px solid rgba(193,98,46,0.3)", color: "#A24F23" }}
            >
              <ShieldCheck size={13} /> Boutique outbound for compliance SaaS
            </div>
          </Reveal>

          <Reveal delay={80} blur>
            <h1
              className="font-semibold leading-[1.05] text-[42px] sm:text-[56px] lg:text-[64px]"
              style={{ fontFamily: serif, color: "#241A10", letterSpacing: "-0.02em" }}
            >
              Compliance software has a buying window.{" "}
              <span style={{ color: "#A24F23", fontStyle: "italic" }}>We find it.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-7 text-[17px] leading-[1.7] max-w-lg" style={{ fontFamily: sans, color: "#6B5B47" }}>
              A funding round. An audit. A first compliance hire. Enterprise
              deals move slowly until one of these happens. Dardy watches for
              it, and turns the moment into a qualified conversation.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton
  variant="primary"
  onClick={() => {
    window.location.href =
      "mailto:hello@dardy.co?subject=Request%20an%20Outbound%20Review";
  }}
>
  Request an Outbound Review <ArrowRight size={16} />
</MagneticButton>
                <a href="mailto:hello@dardy.co">
  <MagneticButton variant="primary">
    Request an Outbound Review <ArrowRight size={16} />
  </MagneticButton>

            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-11 text-[12.5px] tracking-wide uppercase" style={{ fontFamily: sans, color: "#A6957D" }}>
              Seed &nbsp;·&nbsp; Series A &nbsp;·&nbsp; Series B
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} blur>
          <div className="hero-card-breathe">
          <div
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => setCardHovered(false)}
            className="relative rounded-2xl p-7 overflow-hidden"
            style={{
              background: "#F3E7D2",
              border: "1px solid rgba(42,30,19,0.1)",
              boxShadow: cardHovered
                ? "inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px -2px rgba(42,30,19,0.14), 0 26px 48px -22px rgba(161,79,35,0.2), 0 54px 96px -30px rgba(42,30,19,0.44)"
                : "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px -2px rgba(42,30,19,0.12), 0 20px 40px -22px rgba(161,79,35,0.16), 0 44px 84px -32px rgba(42,30,19,0.4)",
              transform: `rotateY(${tilt.x * 5}deg) rotateX(${-tilt.y * 5}deg) translateY(${cardHovered ? -2 : 0}px)`,
              transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s cubic-bezier(0.16,1,0.3,1)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1"
              style={{
                background: `radial-gradient(420px circle at ${50 + tilt.x * 60}% ${50 + tilt.y * 60}%, rgba(193,98,46,0.08), transparent 60%)`,
                transition: "background 0.3s ease-out",
              }}
            />
            <div className="relative flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: sans, color: "#A6957D" }}>Account brief · Confidential</span>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
                style={{ fontFamily: sans, background: "rgba(110,123,94,0.12)", color: "#556248", border: "1px solid rgba(110,123,94,0.3)" }}
              >
                <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: "#556248" }} />
                Active research
              </span>
            </div>
            <div className="relative px-1 mb-1.5">
              <span className="text-[17px] font-medium" style={{ fontFamily: serif, color: "#241A10" }}>
                [Company name redacted] — Compliance SaaS
              </span>
            </div>
            <div className="relative px-1 mb-5">
              <span className="text-[12px] italic" style={{ fontFamily: sans, color: "#A6957D" }}>Prepared for internal use only</span>
            </div>
            <div className="relative mb-1 h-px" style={{ background: "linear-gradient(90deg, rgba(42,30,19,0.12), rgba(42,30,19,0.02))" }} />

            <div className="relative flex flex-col">
              {DOSSIER_ROWS.map((row, i) => {
                const Icon = row.icon;
                const float = Math.sin(i) * 3;
                return (
                  <Reveal key={row.label} delay={420 + i * 130}>
                    <div
                      className="flex items-start gap-3 py-4"
                      style={{
                        borderTop: i === 0 ? "none" : "1px solid rgba(42,30,19,0.08)",
                        transform: `translateX(${tilt.x * float}px)`,
                        transition: "transform 0.3s ease-out",
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: row.done ? "rgba(110,123,94,0.14)" : "rgba(193,98,46,0.1)" }}>
                        <Icon size={14} style={{ color: row.done ? "#556248" : "#A24F23" }} />
                      </div>
                      <div>
                        <div className="text-[11px] tracking-wide uppercase" style={{ fontFamily: sans, color: "#A6957D" }}>{row.label}</div>
                        <div className="text-[13.5px] mt-0.5" style={{ fontFamily: sans, color: "#3A2E20" }}>{row.value}</div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Founder story                                                     */
/* ---------------------------------------------------------------- */
const TRUST_TAGS = ["Founder-led", "Specialized", "Research-intensive", "Selective"];

function FounderStory() {
  return (
    <section id="about" className="relative py-32 px-6 scroll-mt-[120px]">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
        <Reveal>
          <SectionLabel color="#A24F23">About Dardy</SectionLabel>
          <SectionTitle>Why Dardy exists.</SectionTitle>
          <p className="mt-6 text-[15px] leading-[1.75] max-w-md" style={{ fontFamily: sans, color: "#6B5B47" }}>
            Compliance software sells to buyers who don't trust marketing
            claims. They trust process, evidence, and timing. Most outbound
            treats every industry the same: send more, personalize less, hope
            volume compensates.
          </p>
          <p className="mt-4 text-[15px] leading-[1.75] max-w-md" style={{ fontFamily: sans, color: "#6B5B47" }}>
            That doesn't work here. Buying committees are small, cycles are
            long, and the moment that actually matters, a new audit
            requirement, a funding round, a first compliance hire, is usually
            missed. Dardy exists to catch it. We work with one industry so
            the research runs deeper than a generalist agency's.
          </p>
          <p className="mt-4 text-[15px] leading-[1.75] max-w-md" style={{ fontFamily: sans, color: "#6B5B47" }}>
            We stayed boutique on purpose. A small number of accounts means
            senior attention on every one, not a rotation of junior reps
            learning your market on your dime.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-2xl p-8" style={{ background: "#F3E7D2", border: "1px solid rgba(42,30,19,0.1)" }}>
            <p className="text-[12px] tracking-widest uppercase mb-5" style={{ fontFamily: sans, color: "#A6957D" }}>What that means in practice</p>
            <div className="flex flex-wrap gap-2">
              {TRUST_TAGS.map((t, i) => (
                <span
                  key={t}
                  className="text-[12.5px] px-3.5 py-1.5 rounded-full"
                  style={{
                    fontFamily: sans,
                    background: i % 2 === 0 ? "rgba(193,98,46,0.1)" : "rgba(110,123,94,0.1)",
                    color: i % 2 === 0 ? "#A24F23" : "#556248",
                    border: i % 2 === 0 ? "1px solid rgba(193,98,46,0.28)" : "1px solid rgba(110,123,94,0.25)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-6 text-[13.5px] leading-relaxed" style={{ fontFamily: sans, color: "#8C7A63" }}>
              Ask about the research process, review a sample account brief,
              or talk directly to the founder before committing to anything.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Problem — an annotated example instead of a grid of claims         */
/* ---------------------------------------------------------------- */
const REVIEW_NOTES = [
  { n: 1, text: "Mail-merge tags standing in for research." },
  { n: 2, text: "A line that could describe almost any company in the industry." },
  { n: 3, text: "Selling software, not insight." },
  { n: 4, text: "Asking for time before earning any trust." },
];

function HL({ n, children }) {
  return (
    <span style={{ background: "rgba(193,98,46,0.12)", borderBottom: "1px solid rgba(193,98,46,0.4)" }}>
      {children}
      <sup className="ml-0.5" style={{ color: "#A24F23", fontSize: "10px" }}>{n}</sup>
    </span>
  );
}

function Problem() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <SectionLabel color="#A24F23">The cost of generic outbound</SectionLabel>
          <SectionTitle>Outbound is broken.</SectionTitle>
        </Reveal>

        <Reveal delay={100}>
          <div className="premium-card mt-16 rounded-2xl overflow-hidden" style={{ background: "#FAF2E3", border: "1px solid rgba(42,30,19,0.1)" }}>
            <div className="p-7 sm:p-9">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: sans, color: "#A6957D" }}>Illustrative example · Not a real message</span>
              </div>

              <div className="pl-4" style={{ borderLeft: "2px solid rgba(42,30,19,0.12)" }}>
                <p className="text-[12px] mb-2" style={{ fontFamily: sans, color: "#8C7A63" }}>Subject: Quick question</p>
                <p className="text-[15px] sm:text-[16px] leading-[1.9]" style={{ fontFamily: sans, color: "#6B5B47" }}>
                  "Hi <HL n={1}>{"{{first_name}}"}</HL>, I noticed <HL n={1}>{"{{company}}"}</HL> is{" "}
                  <HL n={2}>doing great things in the compliance space</HL>. We help teams like yours
                  save time and drive more revenue with our <HL n={3}>AI-powered outreach platform</HL>.
                  Any chance you have <HL n={4}>15 minutes this week</HL>?"
                </p>
              </div>

              <div className="mt-8 pt-7" style={{ borderTop: "1px solid rgba(42,30,19,0.1)" }}>
                <p className="text-[11px] tracking-widest uppercase mb-4" style={{ fontFamily: sans, color: "#A6957D" }}>Review notes</p>
                <div className="flex flex-col gap-3">
                  {REVIEW_NOTES.map((note) => (
                    <div key={note.n} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium" style={{ fontFamily: sans, background: "rgba(193,98,46,0.12)", color: "#A24F23" }}>
                        {note.n}
                      </span>
                      <span className="text-[14px] leading-relaxed" style={{ fontFamily: sans, color: "#4A3C2C" }}>{note.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
/* ---------------------------------------------------------------- */
/*  Principles                                                         */
/* ---------------------------------------------------------------- */
const PRINCIPLES = [
  { title: "Research before automation.", desc: "We study the account before any system touches it." },
  { title: "Quality before quantity.", desc: "Fewer, sharper conversations beat a flooded inbox." },
  { title: "Systems before shortcuts.", desc: "Repeatable process, not one-off hustle." },
  { title: "Revenue before vanity metrics.", desc: "Pipeline is the only number that matters." },
];

function Principles() {
  return (
    <section className="relative py-32 px-6" style={{ background: "#F3E7D2" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel color="#6E7B5E">Our principles</SectionLabel>
          <SectionTitle>What we won't compromise on.</SectionTitle>
        </Reveal>
        <div className="mt-16 grid sm:grid-cols-2 gap-px rounded-2xl overflow-hidden" style={{ background: "rgba(42,30,19,0.1)" }}>
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="premium-card p-10 h-full" style={{ background: "#FAF2E3" }}>
                <h3 className="font-medium text-[21px] leading-snug" style={{ fontFamily: serif, color: "#241A10" }}>{p.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed max-w-xs" style={{ fontFamily: sans, color: "#8C7A63" }}>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Methodology — compounding, scroll-linked                          */
/* ---------------------------------------------------------------- */
const METHODOLOGY = [
  { title: "Research", desc: "We map your total addressable market: company profile, funding stage, tech stack, and compliance triggers. Everything that follows starts here.", icon: FlaskConical },
  { title: "Qualification", desc: "Every account from that research is scored against your ideal customer profile before a single message is written.", icon: Filter },
  { title: "Buying signals", desc: "Scored accounts are watched for hiring, funding, audits, and regulatory shifts, the moments that indicate readiness to buy.", icon: Radar },
  { title: "Personalization", desc: "When a signal fires, the message references it directly: the buyer's stack, their market, their moment.", icon: Sparkles },
  { title: "Outreach", desc: "That message goes out across channels, on a cadence built for enterprise buying cycles, not spray-and-pray timing.", icon: Send },
  { title: "Meetings", desc: "Replies convert into qualified conversations, booked directly on your team's calendar.", icon: Calendar },
  { title: "Feedback", desc: "Every reply, objection, and outcome feeds back into the research, sharpening the next account.", icon: MessageCircle },
  { title: "Optimization", desc: "Every workflow becomes smarter with every campaign, so each new account benefits from what the last one taught us.", icon: Gauge },
];

function Methodology() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const passed = -rect.top;
      setProgress(total > 0 ? Math.min(1, Math.max(0, passed / total)) : 0);
    };
    const onScroll = rafThrottle(update);
    window.addEventListener("scroll", onScroll, { passive: true });
requestAnimationFrame(update);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={sectionRef} id="method" className="relative py-32 px-6 scroll-mt-[120px]">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel color="#6E7B5E">Our methodology</SectionLabel>
          <SectionTitle>One system, start to revenue.</SectionTitle>
        </Reveal>

        <div className="relative mt-24 pl-10 sm:pl-14">
          <div className="absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-px" style={{ background: "rgba(42,30,19,0.14)" }} />
          <div
            className="absolute left-[15px] sm:left-[19px] top-2 w-px"
            style={{ height: `${progress * 100}%`, background: "linear-gradient(180deg,#C1622E,#6E7B5E)", boxShadow: "0 0 10px rgba(193,98,46,0.5)", transition: "height 0.1s linear" }}
          />
          <div
            className="absolute left-[15px] sm:left-[19px] w-2.5 h-2.5 rounded-full -translate-x-1/2"
            style={{ top: `calc(${progress * 100}% + 8px)`, background: "#C1622E", boxShadow: "0 0 12px rgba(193,98,46,0.55)", transition: "top 0.1s linear", opacity: progress > 0.01 ? 1 : 0 }}
          />
          <div className="flex flex-col gap-16">
            {METHODOLOGY.map((step, i) => {
              const Icon = step.icon;
              const active = progress > i / METHODOLOGY.length;
              return (
                <Reveal key={step.title} delay={i * 40}>
                  <div
                    className="relative flex gap-6 items-start -mx-4 px-4 py-2 rounded-xl"
                    style={{ background: active ? "rgba(193,98,46,0.05)" : "transparent", transition: "background 0.5s ease" }}
                  >
                    <div
                      className="absolute -left-6 sm:-left-10 top-2 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: active ? "linear-gradient(135deg,#C1622E,#A24F23)" : "#F3E7D2", border: active ? "none" : "1px solid rgba(42,30,19,0.2)", boxShadow: active ? "0 0 0 4px rgba(193,98,46,0.12)" : "none", transition: "background 0.4s ease, box-shadow 0.4s ease" }}
                    >
                      <Icon size={14} color={active ? "#FDF6EA" : "#8C7A63"} />
                    </div>
                    <div>
                      <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: sans, color: "#A6957D" }}>
                        Step {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1.5 font-medium text-[18px] transition-colors duration-500" style={{ fontFamily: serif, color: active ? "#A24F23" : "#241A10" }}>{step.title}</h3>
                      <p className="mt-1.5 text-[14px] leading-[1.7] max-w-md" style={{ fontFamily: sans, color: "#6B5B47" }}>{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Deliverables — show the work instead of listing capabilities       */
/* ---------------------------------------------------------------- */
const FIT_CHECK = [
  { label: "Company size", result: "Match" },
  { label: "Buyer seniority", result: "Match" },
  { label: "Compliance trigger", result: "Match" },
  { label: "Timing", result: "Partial" },
];

const TRACKER_ROWS = [
  { account: "Account 011", signal: "Audit cycle", status: "Sent" },
  { account: "Account 014", signal: "Series A + hiring", status: "Drafted" },
  { account: "Account 019", signal: "New compliance hire", status: "Researching" },
];

const STATUS_COLOR = { Sent: "#556248", Drafted: "#A24F23", Researching: "#A6957D" };

function MockHeader({ label, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: sans, color: "#A6957D" }}>{label}</span>
      <Icon size={14} style={{ color: "#A24F23" }} />
    </div>
  );
}

function Deliverables() {
  return (
    <section className="relative py-32 px-6" style={{ background: "#F3E7D2" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <SectionLabel color="#6E7B5E">Sample output</SectionLabel>
          <SectionTitle max="max-w-2xl">This is what the research looks like.</SectionTitle>
        </Reveal>

        <div className="mt-16 grid sm:grid-cols-2 gap-5">
          <Reveal delay={0}>
            <div className="premium-card rounded-2xl p-6 h-full" style={{ background: "#FAF2E3", border: "1px solid rgba(42,30,19,0.1)" }}>
              <MockHeader label="Signal alert · This week" icon={Radar} />
              <p className="text-[14px] leading-relaxed" style={{ fontFamily: sans, color: "#3A2E20" }}>
                [Account, redacted] raised a Series A. A first AE role opened two days later.
              </p>
              <span className="inline-block mt-4 text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: sans, background: "rgba(193,98,46,0.1)", color: "#A24F23", border: "1px solid rgba(193,98,46,0.25)" }}>
                Flagged for outreach
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="premium-card rounded-2xl p-6 h-full" style={{ background: "#FAF2E3", border: "1px solid rgba(42,30,19,0.1)" }}>
              <MockHeader label="Message draft" icon={Send} />
              <p className="text-[12px] mb-2" style={{ fontFamily: sans, color: "#8C7A63" }}>Subject: Hiring your first AE — audit timing?</p>
              <p className="text-[13.5px] leading-relaxed italic" style={{ fontFamily: sans, color: "#3A2E20" }}>
                "Saw the raise and the AE req, congrats. Most teams at this stage are three to six months from their first real audit push…"
              </p>
              <p className="mt-4 text-[11px] italic" style={{ fontFamily: sans, color: "#A6957D" }}>Drafted from account research, not a template</p>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="premium-card rounded-2xl p-6 h-full" style={{ background: "#FAF2E3", border: "1px solid rgba(42,30,19,0.1)" }}>
              <MockHeader label="Fit assessment" icon={Filter} />
              <div className="flex flex-col gap-2.5">
                {FIT_CHECK.map((c) => (
                  <div key={c.label} className="flex items-center justify-between">
                    <span className="text-[13px]" style={{ fontFamily: sans, color: "#4A3C2C" }}>{c.label}</span>
                    <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ fontFamily: sans, color: c.result === "Match" ? "#556248" : "#A6957D" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.result === "Match" ? "#556248" : "#A6957D" }} />
                      {c.result}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] italic" style={{ fontFamily: sans, color: "#A6957D" }}>Assessed before a message is written</p>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="premium-card rounded-2xl p-6 h-full" style={{ background: "#FAF2E3", border: "1px solid rgba(42,30,19,0.1)" }}>
              <MockHeader label="Weekly tracker" icon={Gauge} />
              <div className="flex flex-col gap-3">
                {TRACKER_ROWS.map((r) => (
                  <div key={r.account} className="flex items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(42,30,19,0.08)", paddingTop: 10 }}>
                    <div>
                      <div className="text-[13px] font-medium" style={{ fontFamily: sans, color: "#241A10" }}>{r.account}</div>
                      <div className="text-[11.5px]" style={{ fontFamily: sans, color: "#8C7A63" }}>{r.signal}</div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full shrink-0" style={{ fontFamily: sans, color: STATUS_COLOR[r.status], background: "rgba(42,30,19,0.05)" }}>{r.status}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] italic" style={{ fontFamily: sans, color: "#A6957D" }}>Shared with clients every week</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Who we help — specific, without feeling restrictive                */
/* ---------------------------------------------------------------- */
const FIT_SPECS = [
  { label: "Company size", value: "20–200 employees" },
  { label: "Funding stage", value: "Seed through Series B" },
  { label: "Industry", value: "Compliance & cybersecurity SaaS" },
  { label: "Buyer", value: "Security, compliance, or IT leadership" },
  { label: "Sales cycle", value: "3–9 month enterprise cycles" },
  { label: "Deal size", value: "Typically $20K–$100K ACV" },
];

function WhoWeHelp() {
  return (
    <section id="who-we-help" className="relative py-32 px-6 scroll-mt-[120px]">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <Reveal>
          <SectionLabel color="#A24F23">Who we help</SectionLabel>
          <h2 className="mt-3 font-semibold tracking-tight text-[30px] sm:text-[36px]" style={{ fontFamily: serif, color: "#241A10", lineHeight: 1.15 }}>
            Venture-backed. Selling into serious buyers.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.75] max-w-md" style={{ fontFamily: sans, color: "#6B5B47" }}>
            Dardy is built for compliance software companies selling to
            enterprise buyers who expect precision, not volume.
          </p>
          <p className="mt-5 text-[13.5px] italic" style={{ fontFamily: sans, color: "#8C7A63" }}>
            If most of the specifics on the right sound like you, we're probably a fit.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="premium-card rounded-2xl p-7" style={{ background: "#F3E7D2", border: "1px solid rgba(42,30,19,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: sans, color: "#A6957D" }}>Fit criteria · Internal reference</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: sans, background: "rgba(193,98,46,0.1)", color: "#A24F23", border: "1px solid rgba(193,98,46,0.25)" }}>
                Screening
              </span>
            </div>
            <div className="mb-4 h-px" style={{ background: "linear-gradient(90deg, rgba(42,30,19,0.12), rgba(42,30,19,0.02))" }} />
            <div className="flex flex-col">
              {FIT_SPECS.map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between gap-4 py-3.5"
                  style={{ borderTop: i === 0 ? "none" : "1px solid rgba(42,30,19,0.08)" }}
                >
                  <span className="text-[12px] tracking-wide uppercase" style={{ fontFamily: sans, color: "#A6957D" }}>{s.label}</span>
                  <span className="text-[13.5px] font-medium text-right" style={{ fontFamily: sans, color: "#3A2E20" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Who we don't help — confident, not negative                       */
/* ---------------------------------------------------------------- */
const NOT_FOR = [
  "Sending volume for its own sake.",
  "Success measured in email counts, not revenue.",
  "A product that isn't ready for enterprise buyers yet.",
  "Cheap, transactional appointment setting.",
];

function NotFor() {
  return (
    <section className="relative py-32 px-6" style={{ background: "#F3E7D2" }}>
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <SectionLabel color="#8C7A63">Selective by design</SectionLabel>
          <SectionTitle>Precision over volume.</SectionTitle>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-16 flex flex-col gap-3 text-left max-w-md mx-auto">
            {NOT_FOR.map((line) => (
              <div key={line} className="flex items-start gap-3 rounded-xl px-5 py-4" style={{ background: "#FAF2E3", border: "1px solid rgba(42,30,19,0.08)" }}>
                <XCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#C9BBA3" }} />
                <span className="text-[14.5px]" style={{ fontFamily: sans, color: "#4A3C2C" }}>{line}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-10 text-[17px] leading-snug max-w-md mx-auto" style={{ fontFamily: serif, color: "#241A10" }}>
            We're not built for volume. We're built for companies where every customer matters.
          </p>
          <a href="#contact" className="inline-block mt-7">
            <MagneticButton variant="secondary" className="!text-[13px]">See if we're a fit</MagneticButton>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Comparison — a visual story, not a checkmark grid                  */
/* ---------------------------------------------------------------- */
const OUTBOUND_FLOW = ["Hundreds of emails", "A few replies", "One meeting", "No context"];
const DARDY_FLOW = ["Research", "Buying signal", "Personalized insight", "Qualified conversation"];

function FlowColumn({ label, labelColor, steps, highlight }) {
  return (
    <div>
      <p className="text-[12px] tracking-widest uppercase mb-6 text-center" style={{ fontFamily: sans, color: labelColor }}>{label}</p>
      <div className="flex flex-col items-center gap-0">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <Reveal delay={i * 140} className="w-full">
              <div
                className="w-full text-center rounded-xl px-5 py-3.5"
                style={
                  highlight
                    ? { background: "linear-gradient(135deg, rgba(193,98,46,0.1), rgba(110,123,94,0.08))", border: "1px solid rgba(193,98,46,0.25)" }
                    : { background: "#F3E7D2", border: "1px dashed rgba(42,30,19,0.15)" }
                }
              >
                <span className={highlight ? "text-[13.5px] font-medium" : "text-[13.5px]"} style={{ fontFamily: sans, color: highlight ? "#241A10" : "#A6957D" }}>{step}</span>
              </div>
            </Reveal>
            {i < steps.length - 1 && (
              <Reveal delay={i * 140 + 90}>
                <div
                  className="w-px h-7"
                  style={{ background: highlight ? "linear-gradient(180deg,#C1622E,#6E7B5E)" : "rgba(42,30,19,0.15)" }}
                />
              </Reveal>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Comparison() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel color="#6E7B5E">Why it works</SectionLabel>
          <SectionTitle>Two ways to run outbound.</SectionTitle>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-16 grid sm:grid-cols-2 gap-10 sm:gap-8">
            <FlowColumn label="Generic outbound" labelColor="#A6957D" steps={OUTBOUND_FLOW} highlight={false} />
            <FlowColumn label="Dardy" labelColor="#A24F23" steps={DARDY_FLOW} highlight={true} />
          </div>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-14 text-[16px] text-center max-w-md mx-auto leading-snug" style={{ fontFamily: serif, color: "#241A10" }}>
            The difference isn't effort. It's what each message is built on.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  FAQ — friction-reducing                                            */
/* ---------------------------------------------------------------- */
const FAQS = [
  { q: "Why trust a company this new?", a: "Fair question. Don't take our word for it, judge the process itself. Look at a sample account brief and decide whether the thinking holds up before committing to anything." },
  { q: "How does Dardy actually work?", a: "We research your market, score accounts against your ICP, track buying signals, then run personalized outreach across channels. The methodology above walks through each step." },
  { q: "Why only compliance SaaS?", a: "Depth beats breadth. Studying one market closely produces sharper research than any generalist agency can match." },
  { q: "Why boutique?", a: "A large client roster dilutes the one thing that makes this work: senior attention on every account, not a rotation of reps still learning your market." },
  { q: "How involved is the founder?", a: "Directly. Strategy, research review, and account selection go through the founder, not a handed-off account manager." },
  { q: "How many clients do you take on?", a: "A small number at a time, by design. We'd rather turn down work than dilute the research quality." },
  { q: "How long until we see results?", a: "The first few weeks go into research and ICP definition, with campaigns live shortly after. Time to first qualified conversation depends on your market and sales cycle." },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-32 px-6 scroll-mt-[120px]">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel color="#A24F23">FAQ</SectionLabel>
          <SectionTitle>Questions, answered.</SectionTitle>
        </Reveal>
        <div className="mt-16 flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 40}>
                <div className="premium-card rounded-2xl overflow-hidden" style={{ background: "#F3E7D2", border: "1px solid rgba(42,30,19,0.1)" }}>
                  <button
                    type="button"
                    className="faq-trigger w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <span className="text-[15px] font-medium transition-colors duration-300" style={{ fontFamily: sans, color: isOpen ? "#A24F23" : "#241A10" }}>{f.q}</span>
                    <ChevronDown size={17} style={{ color: isOpen ? "#A24F23" : "#8C7A63", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1), color 0.3s ease", flexShrink: 0 }} />
                  </button>
                  <div id={`faq-panel-${i}`} style={{ maxHeight: isOpen ? "240px" : "0px", opacity: isOpen ? 1 : 0, transition: "max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease" }}>
                    <p className="px-6 pb-5 text-[14px] leading-relaxed" style={{ fontFamily: sans, color: "#6B5B47" }}>{f.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  CTA + Footer                                                        */
/* ---------------------------------------------------------------- */
function CTA() {
  return (
    <section id="contact" className="relative py-36 px-6 text-center overflow-hidden scroll-mt-[120px]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Parallax speed={0.1} className="warm-glow glow-3" />
      </div>
      <Reveal>
        <h2 className="font-semibold text-[34px] sm:text-[46px] max-w-2xl mx-auto leading-[1.1]" style={{ fontFamily: serif, color: "#241A10", letterSpacing: "-0.02em" }}>
          Most outbound gets ignored. This is built to get a reply.
        </h2>
        <p className="mt-5 text-[15px]" style={{ fontFamily: sans, color: "#8C7A63" }}>
          One conversation, real clarity on what's holding pipeline back.
        </p>
        <div className="mt-9">
          <MagneticButton variant="primary">Let's review your outbound <ArrowRight size={16} /></MagneticButton>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative pt-20 pb-12 px-6" style={{ borderTop: "1px solid rgba(42,30,19,0.1)" }}>
      <div className="max-w-6xl mx-auto grid sm:grid-cols-[1.3fr_1fr_1fr] gap-12">
        <div>
          <span className="text-[16px] font-semibold" style={{ fontFamily: serif, color: "#241A10" }}>Dardy</span>
          <p className="mt-3.5 text-[13px] max-w-xs leading-relaxed" style={{ fontFamily: sans, color: "#8C7A63" }}>
            Dardy is the outbound partner built exclusively for compliance software companies.
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-widest uppercase mb-4" style={{ fontFamily: sans, color: "#A6957D" }}>Navigate</p>
          <div className="flex flex-col gap-3 text-[13.5px]" style={{ fontFamily: sans, color: "#6B5B47" }}>
            <a href="#method" className="nav-link self-start">Method</a>
            <a href="#who-we-help" className="nav-link self-start">Who We Help</a>
            <a href="#about" className="nav-link self-start">About</a>
            <a href="#faq" className="nav-link self-start">FAQ</a>
          </div>
        </div>
        <div>
          <p className="text-[11px] tracking-widest uppercase mb-4" style={{ fontFamily: sans, color: "#A6957D" }}>Connect</p>
          <div className="flex flex-col gap-3 text-[13.5px]" style={{ fontFamily: sans, color: "#6B5B47" }}>
            <a href="mailto:hello@dardy.co" className="nav-link self-start">hello@dardy.co</a>
            <a href="#" className="nav-link self-start">LinkedIn</a>
            <span>Remote-first</span>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-6 flex flex-col sm:flex-row justify-between gap-3" style={{ borderTop: "1px solid rgba(42,30,19,0.08)" }}>
        <span className="text-[12px]" style={{ fontFamily: sans, color: "#A6957D" }}>© 2026 Dardy. All rights reserved.</span>
        <div className="flex gap-5 text-[12px]" style={{ fontFamily: sans, color: "#A6957D" }}>
          <a href="#" className="nav-link">Privacy</a>
          <a href="#" className="nav-link">Terms</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- */
/*  App                                                                 */
/* ---------------------------------------------------------------- */
export default function Dardy() {
  useFonts();
  return (
    <div style={{ background: "#FAF2E3", minHeight: "100vh", fontFamily: sans }}>
      <style>{`
        html { scroll-behavior: smooth; }
        body { position: relative; }

        .warm-glow { position: absolute; width: 560px; height: 560px; border-radius: 9999px; filter: blur(110px); opacity: 0.35; will-change: transform; transform: translate3d(0, var(--parallax-y, 0px), 0); animation: glowBreathe 9s ease-in-out infinite; }
        .glow-1 { top: -200px; left: -120px; background: #E9C9A3; animation-delay: 0s; }
        .glow-2 { top: -80px; right: -160px; background: #D9BFA0; animation-delay: -4s; }
        .glow-3 { top: 50%; left: 50%; background: #C1622E; opacity: 0.12; transform: translate(-50%,-50%) translate3d(0, var(--parallax-y, 0px), 0); animation-delay: -2s; }
        @keyframes glowBreathe { 0%, 100% { opacity: 0.32; } 50% { opacity: 0.4; } }

        a { text-decoration: none; }
        ::selection { background: rgba(193,98,46,0.25); color: #241A10; }
        :focus-visible { outline: 2px solid #C1622E; outline-offset: 3px; border-radius: 4px; }

        .grain-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.5;
          background-image: radial-gradient(rgba(42,30,19,0.55) 0.6px, transparent 0.6px);
          background-size: 3px 3px;
          mix-blend-mode: overlay;
        }
        .vignette-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          background: radial-gradient(120% 90% at 50% 8%, transparent 60%, rgba(42,30,19,0.05) 100%);
        }

        .nav-link { padding-bottom: 2px; background-image: linear-gradient(#C1622E,#C1622E); background-position: 0 100%; background-repeat: no-repeat; background-size: 0% 1px; transition: background-size 0.3s cubic-bezier(0.16,1,0.3,1), color 0.3s ease; }
        .nav-link:hover { background-size: 100% 1px; color: #241A10; }

        .nav-bar { background: rgba(250,242,227, var(--nav-alpha, 0.72)); box-shadow: var(--nav-shadow, 0 10px 30px -16px rgba(42,30,19,0.18)); transition: box-shadow 0.4s ease; }
        .nav-toggle { transition: background 0.25s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1); }
        .nav-toggle:hover { background: rgba(42,30,19,0.05); }
        .nav-toggle:active { transform: scale(0.93); }

        .faq-trigger { transition: background 0.3s ease; }
        .faq-trigger:hover { background: rgba(42,30,19,0.02); }

        .premium-card {
          transition: transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s cubic-bezier(0.16,1,0.3,1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(42,30,19,0.035), 0 1px 2px rgba(42,30,19,0.04), 0 8px 18px -14px rgba(42,30,19,0.13);
        }
        .premium-card:hover {
          transform: translateY(-3px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.48), inset 0 -1px 0 rgba(42,30,19,0.04), 0 2px 4px rgba(42,30,19,0.045), 0 26px 44px -28px rgba(42,30,19,0.32);
        }

        .hero-card-breathe { animation: cardBreathe 9s ease-in-out infinite; }
        @keyframes cardBreathe { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }

        @keyframes softPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .pulse-dot { animation: softPulse 1.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
      <div className="grain-overlay" />
      <div className="vignette-overlay" />
      <Nav />
      <main>
        <Hero />
        <FounderStory />
        <Problem />
        <Principles />
        <Methodology />
        <Deliverables />
        <WhoWeHelp />
        <NotFor />
        <Comparison />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

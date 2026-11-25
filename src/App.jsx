import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Menu, X, ScanSearch, Keyboard, Smartphone, Eye,
  FileText, Wrench, RefreshCcw, LineChart, CheckCircle2, XCircle,
  ChevronDown, ShieldCheck, AlertTriangle,
} from "lucide-react";

/* ---------------------------------------------------------------- */
/*  Fonts                                                             */
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

/* Palette — every text color passes WCAG AA (4.5:1) on both bg and surface.
   An accessibility company's own site has to pass its own audit. */
const C = {
  ink: "#241A10",
  text: "#3A2E20",
  body: "#5B4C3A",   // 6.8:1 on surface
  muted: "#74624B",  // 4.8:1 on surface (was #A6957D, 2.4:1 — failed)
  bg: "#FAF2E3",
  surface: "#F3E7D2",
  accent: "#A24F23", // 4.7:1 on surface
  sage: "#5C6A4D",   // 4.7:1 on surface
  line: "rgba(42,30,19,0.1)",
};

const MAIL_SCAN =
  "mailto:hello@dardy.co?subject=Free%20accessibility%20check&body=Store%20URL%3A%20";
const MAIL_SNAPSHOT =
  "mailto:hello@dardy.co?subject=Accessibility%20Snapshot&body=Store%20URL%3A%20";

function rafThrottle(fn) {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { fn(...args); ticking = false; });
  };
}

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

/* Renders a real <a> when given href (no more <button> inside <a>,
   and no buttons that do nothing). */
function MagneticButton({ children, variant = "primary", className = "", href, ...rest }) {
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
      ? { background: "linear-gradient(135deg, #A24F23 0%, #9A4A20 55%, #8E4520 100%)", color: "#FDF6EA", boxShadow: pressed ? "0 4px 14px -8px rgba(161,79,35,0.5)" : hovered ? "0 14px 30px -12px rgba(161,79,35,0.55)" : "0 10px 26px -10px rgba(161,79,35,0.5)" }
      : { background: "transparent", color: C.ink, border: "1px solid rgba(42,30,19,0.3)" };
  const Tag = href ? "a" : "button";
  return (
    <Tag
      ref={ref}
      href={href}
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
            background: "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.18) 35%, transparent 50%)",
            transform: hovered ? "translateX(60%)" : "translateX(-120%)",
            transition: `transform ${pressed ? "0.6s" : "1.1s"} cubic-bezier(0.16,1,0.3,1)`,
          }}
        />
      )}
      {children}
    </Tag>
  );
}

function SectionLabel({ color = C.accent, children }) {
  return <p className="text-[13px] tracking-widest uppercase" style={{ fontFamily: sans, color }}>{children}</p>;
}

function Parallax({ speed = 0.1, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const update = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--parallax-y", `${(rect.top + rect.height / 2 - window.innerHeight / 2) * speed}px`);
    };
    const onScroll = rafThrottle(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(update);
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return <div ref={ref} className={className} aria-hidden="true" />;
}

function SectionTitle({ children, max = "" }) {
  return (
    <h2 className={`mt-3 font-semibold text-[34px] sm:text-[42px] ${max}`} style={{ fontFamily: serif, color: C.ink, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
      {children}
    </h2>
  );
}

const card = { background: C.bg, border: `1px solid ${C.line}` };
const cardAlt = { background: C.surface, border: `1px solid ${C.line}` };

/* ---------------------------------------------------------------- */
/*  Nav                                                                */
/* ---------------------------------------------------------------- */
const NAV_LINKS = [
  { label: "How it works", href: "#method" },
  { label: "Pricing", href: "#pricing" },
  { label: "Sample report", href: "#sample" },
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
      node.style.setProperty("--nav-alpha", scrolled ? "0.92" : "0.78");
      node.style.setProperty("--nav-shadow", scrolled ? "0 14px 32px -16px rgba(42,30,19,0.26)" : "0 10px 30px -16px rgba(42,30,19,0.18)");
    };
    const onScroll = rafThrottle(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(update);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav aria-label="Primary" className="fixed top-5 left-0 right-0 z-50 px-4">
      <div
        ref={barRef}
        className="nav-bar max-w-5xl mx-auto flex items-center justify-between rounded-full px-3 py-3"
        style={{ backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(42,30,19,0.08)" }}
      >
        <a href="#top" className="pl-4 text-[19px] font-semibold" style={{ fontFamily: serif, color: C.ink }}>
          Dardy<span className="sr-only"> home</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="nav-link relative text-[13.5px]" style={{ fontFamily: sans, color: C.body }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <MagneticButton href={MAIL_SCAN} className="!px-5 !py-2.5 !text-[13px]">Get a free check</MagneticButton>
        </div>

        <button
          className="nav-toggle md:hidden w-11 h-11 rounded-full flex items-center justify-center"
          style={{ border: "1px solid rgba(42,30,19,0.25)", color: C.ink }}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden max-w-5xl mx-auto mt-2 rounded-2xl p-5 flex flex-col gap-4" style={cardAlt}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="nav-link text-[15px] py-1" style={{ fontFamily: sans, color: C.body }}>{l.label}</a>
          ))}
          <MagneticButton href={MAIL_SCAN} className="!text-[13px] w-full">Get a free check</MagneticButton>
        </div>
      )}
    </nav>
  );
}

/* ---------------------------------------------------------------- */
/*  Hero — one issue from a Snapshot report                            */
/* ---------------------------------------------------------------- */
const ISSUE_ROWS = [
  { label: "Page", value: "Product page · Add to Cart", icon: FileText },
  { label: "Issue", value: "Button has no label. A screen reader just says \"button\".", icon: AlertTriangle },
  { label: "WCAG rule", value: "4.1.2 Name, Role, Value · Level A", icon: ShieldCheck },
  { label: "Who it blocks", value: "Blind shoppers using a screen reader", icon: Eye },
  { label: "Status", value: "Fixed and re-tested with VoiceOver", icon: CheckCircle2, done: true },
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

  return (
    <section id="top" ref={heroRef} onMouseMove={(e) => onMove(e, heroRef.current.getBoundingClientRect())} className="relative overflow-hidden pt-44 pb-28 px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Parallax speed={0.06} className="warm-glow glow-1" />
        <Parallax speed={-0.08} className="warm-glow glow-2" />
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-20 items-center">
        <div>
          <Reveal blur>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] mb-7"
              style={{ fontFamily: sans, background: "rgba(193,98,46,0.1)", border: "1px solid rgba(193,98,46,0.35)", color: C.accent }}
            >
              <ShieldCheck size={13} aria-hidden="true" /> Accessibility audits and fixes for Shopify stores
            </div>
          </Reveal>

          <Reveal delay={80} blur>
            <h1 className="font-semibold leading-[1.05] text-[40px] sm:text-[54px] lg:text-[62px]" style={{ fontFamily: serif, color: C.ink, letterSpacing: "-0.02em" }}>
              Some shoppers can't use your checkout.{" "}
              <span style={{ color: C.accent, fontStyle: "italic" }}>We fix that.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-7 text-[17px] leading-[1.7] max-w-lg" style={{ fontFamily: sans, color: C.body }}>
              Unlabeled buttons, low contrast, cart drawers a keyboard can't
              leave. These errors stop blind and low-vision shoppers from
              buying, and they are the same errors cited in ADA demand letters.
              Dardy tests your store by hand, fixes the theme code, and keeps
              it clean.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton href={MAIL_SCAN}>
                Get 3 errors from your store, free <ArrowRight size={16} aria-hidden="true" />
              </MagneticButton>
              <MagneticButton href="#pricing" variant="secondary">See pricing</MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-11 text-[12.5px] tracking-wide uppercase" style={{ fontFamily: sans, color: C.muted }}>
              WCAG 2.2 AA &nbsp;·&nbsp; Manual testing &nbsp;·&nbsp; Tested on iPhone
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
                ...cardAlt,
                boxShadow: cardHovered
                  ? "inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px -2px rgba(42,30,19,0.14), 0 26px 48px -22px rgba(161,79,35,0.2), 0 54px 96px -30px rgba(42,30,19,0.44)"
                  : "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px -2px rgba(42,30,19,0.12), 0 20px 40px -22px rgba(161,79,35,0.16), 0 44px 84px -32px rgba(42,30,19,0.4)",
                transform: `rotateY(${tilt.x * 5}deg) rotateX(${-tilt.y * 5}deg) translateY(${cardHovered ? -2 : 0}px)`,
                transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s cubic-bezier(0.16,1,0.3,1)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="relative flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: sans, color: C.muted }}>Snapshot report · Issue 03 of 14</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: sans, background: "rgba(193,98,46,0.1)", color: "#8E4520", border: "1px solid rgba(193,98,46,0.3)" }}>
                  High risk
                </span>
              </div>
              <div className="relative px-1 mb-5">
                <span className="text-[17px] font-medium" style={{ fontFamily: serif, color: C.ink }}>Example store — Shopify, Dawn theme</span>
              </div>
              <div className="relative mb-1 h-px" style={{ background: "linear-gradient(90deg, rgba(42,30,19,0.14), rgba(42,30,19,0.02))" }} />

              <div className="relative flex flex-col">
                {ISSUE_ROWS.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <Reveal key={row.label} delay={420 + i * 130}>
                      <div className="flex items-start gap-3 py-4" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(42,30,19,0.08)", transform: `translateX(${tilt.x * Math.sin(i) * 3}px)`, transition: "transform 0.3s ease-out" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: row.done ? "rgba(110,123,94,0.14)" : "rgba(193,98,46,0.1)" }}>
                          <Icon size={14} aria-hidden="true" style={{ color: row.done ? C.sage : C.accent }} />
                        </div>
                        <div>
                          <p className="text-[11px] tracking-wide uppercase" style={{ fontFamily: sans, color: C.muted }}>{row.label}</p>
                          <p className="text-[13.5px] mt-0.5" style={{ fontFamily: sans, color: C.text }}>{row.value}</p>
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
/*  Problem — what a screen reader hears on a typical product page     */
/* ---------------------------------------------------------------- */
const HEARD_NOTES = [
  { n: 1, text: "Product photo with no alt text. The shopper doesn't know what they're looking at." },
  { n: 2, text: "Size picker built from plain divs. It can't be reached or read." },
  { n: 3, text: "Add to Cart is an icon with no label." },
  { n: 4, text: "The cart drawer opens, but focus stays behind it. The shopper is stuck." },
];

function HL({ n, children }) {
  return (
    <span style={{ background: "rgba(193,98,46,0.12)", borderBottom: "1px solid rgba(162,79,35,0.5)" }}>
      {children}
      <sup className="ml-0.5" style={{ color: C.accent, fontSize: "10px" }}>{n}</sup>
    </span>
  );
}

function Problem() {
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <SectionLabel>The problem</SectionLabel>
          <SectionTitle>Your store looks fine. It doesn't sound fine.</SectionTitle>
          <p className="mt-5 text-[15px] leading-[1.75] max-w-xl" style={{ fontFamily: sans, color: C.body }}>
            Blind shoppers use a screen reader that reads the page aloud. Here is
            what one hears on a typical Shopify product page.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="premium-card mt-12 rounded-2xl overflow-hidden" style={card}>
            <div className="p-7 sm:p-9">
              <p className="text-[11px] tracking-widest uppercase mb-6" style={{ fontFamily: sans, color: C.muted }}>Screen reader output · Illustrative example</p>
              <div className="pl-4" style={{ borderLeft: "2px solid rgba(42,30,19,0.14)" }}>
                <p className="text-[15px] sm:text-[16px] leading-[1.9]" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: C.body }}>
                  "Linen Shirt, heading level 1. <HL n={1}>Image. IMG_4471.jpg.</HL>{" "}
                  $68.00. <HL n={2}>S. M. L. XL.</HL>{" "}
                  <HL n={3}>Button.</HL> … <HL n={4}>Linen Shirt, heading level 1.</HL>"
                </p>
              </div>
              <div className="mt-8 pt-7" style={{ borderTop: `1px solid ${C.line}` }}>
                <p className="text-[11px] tracking-widest uppercase mb-4" style={{ fontFamily: sans, color: C.muted }}>What went wrong</p>
                <ol className="flex flex-col gap-3">
                  {HEARD_NOTES.map((note) => (
                    <li key={note.n} className="flex items-start gap-3">
                      <span aria-hidden="true" className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium" style={{ fontFamily: sans, background: "rgba(193,98,46,0.12)", color: C.accent }}>{note.n}</span>
                      <span className="text-[14px] leading-relaxed" style={{ fontFamily: sans, color: C.text }}>{note.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Why now — the numbers                                              */
/* ---------------------------------------------------------------- */
const STATS = [
  { value: "3,117", label: "federal website accessibility lawsuits filed in the US in 2025, up 27% from 2024." },
  { value: "#1", label: "Retail and e-commerce are the most targeted sectors. New York, Florida and California lead." },
  { value: "~25%", label: "of 2024 lawsuits named an overlay widget as a barrier, not a fix." },
  { value: "30–40%", label: "of issues is all automated scanners find. The rest needs a human." },
];

function WhyNow() {
  return (
    <section className="relative py-28 px-6" style={{ background: C.surface }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel color={C.sage}>Why now</SectionLabel>
          <SectionTitle>Demand letters are cheap to send. Fixes are cheaper than settling.</SectionTitle>
        </Reveal>
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: C.line }}>
          {STATS.map((s, i) => (
            <Reveal key={s.value} delay={i * 70}>
              <div className="premium-card p-9 h-full" style={{ background: C.bg }}>
                <p className="font-semibold text-[38px] leading-none" style={{ fontFamily: serif, color: C.accent }}>{s.value}</p>
                <p className="mt-4 text-[14px] leading-relaxed" style={{ fontFamily: sans, color: C.body }}>{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-center" style={{ fontFamily: sans, color: C.muted }}>
          Sources: AccessibilityChecker 2025 lawsuit report; WebAbility overlay lawsuit analysis.
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Method — the Snapshot SOP, scroll-linked                          */
/* ---------------------------------------------------------------- */
const METHODOLOGY = [
  { title: "Automated scan", desc: "We scan your whole store with axe-core against WCAG 2.0, 2.1 and 2.2 A and AA, plus WAVE on the key pages. This finds the obvious errors fast.", icon: ScanSearch },
  { title: "Keyboard test", desc: "Using only Tab, Enter, Space, Escape and arrow keys, we find a product, pick a size, add it to the cart and reach checkout. We note every place focus disappears, gets stuck or jumps.", icon: Keyboard },
  { title: "Screen reader test on a real phone", desc: "The same task with VoiceOver on iPhone and NVDA on desktop. Most of your traffic is mobile, so we test your checkout the way a blind shopper actually uses it.", icon: Smartphone },
  { title: "Visual check", desc: "Color contrast, 200% zoom, and visible focus on every interactive element.", icon: Eye },
  { title: "Snapshot report", desc: "Every issue with its page, WCAG rule, who it blocks, a screenshot, a risk level and how to fix it. Repeats are grouped, so 38 images with no alt text is one line, not 38.", icon: FileText },
  { title: "Fixes in your theme code", desc: "We fix the issues on a copy of your live theme, in order of risk. You review the preview. Nothing goes live until you approve it.", icon: Wrench },
  { title: "Re-test", desc: "Every fix is checked again with keyboard, screen reader and scanner. Nothing is marked fixed until a screen reader confirms it.", icon: CheckCircle2 },
  { title: "Monitoring", desc: "New apps and theme updates break things. A weekly scan, a monthly manual check, and fixes before they pile up.", icon: RefreshCcw },
];

function Methodology() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0);
    };
    const onScroll = rafThrottle(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(update);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={sectionRef} id="method" className="relative py-28 px-6 scroll-mt-[120px]">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel color={C.sage}>How it works</SectionLabel>
          <SectionTitle>Tested by a person, not just a plugin.</SectionTitle>
        </Reveal>

        <div className="relative mt-20 pl-10 sm:pl-14">
          <div aria-hidden="true" className="absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-px" style={{ background: "rgba(42,30,19,0.14)" }} />
          <div aria-hidden="true" className="absolute left-[15px] sm:left-[19px] top-2 w-px" style={{ height: `${progress * 100}%`, background: "linear-gradient(180deg,#C1622E,#6E7B5E)", boxShadow: "0 0 10px rgba(193,98,46,0.5)", transition: "height 0.1s linear" }} />
          <ol className="flex flex-col gap-14">
            {METHODOLOGY.map((step, i) => {
              const Icon = step.icon;
              const active = progress > i / METHODOLOGY.length;
              return (
                <li key={step.title}>
                  <Reveal delay={i * 40}>
                    <div className="relative flex gap-6 items-start -mx-4 px-4 py-2 rounded-xl" style={{ background: active ? "rgba(193,98,46,0.05)" : "transparent", transition: "background 0.5s ease" }}>
                      <div aria-hidden="true" className="absolute -left-6 sm:-left-10 top-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: active ? "linear-gradient(135deg,#C1622E,#A24F23)" : C.surface, border: active ? "none" : "1px solid rgba(42,30,19,0.2)", boxShadow: active ? "0 0 0 4px rgba(193,98,46,0.12)" : "none", transition: "background 0.4s ease, box-shadow 0.4s ease" }}>
                        <Icon size={14} color={active ? "#FDF6EA" : C.muted} />
                      </div>
                      <div>
                        <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: sans, color: C.muted }}>Step {String(i + 1).padStart(2, "0")}</span>
                        <h3 className="mt-1.5 font-medium text-[18px] transition-colors duration-500" style={{ fontFamily: serif, color: active ? C.accent : C.ink }}>{step.title}</h3>
                        <p className="mt-1.5 text-[14px] leading-[1.7] max-w-md" style={{ fontFamily: sans, color: C.body }}>{step.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Pricing — the three-step ladder                                   */
/* ---------------------------------------------------------------- */
const PLANS = [
  {
    name: "Accessibility Snapshot",
    price: "$390",
    unit: "one time",
    pitch: "Find out exactly what's broken.",
    items: [
      "Automated scan of your full store",
      "Manual test of 5 key pages: home, collection, product, cart, checkout",
      "Keyboard and screen reader testing, including iPhone VoiceOver",
      "PDF report: each issue, WCAG rule, screenshot, risk and fix",
      "20-minute call to walk through it",
    ],
    note: "100% credited to the Fix package if you upgrade within 30 days.",
    cta: "Order a Snapshot",
    href: MAIL_SNAPSHOT,
    featured: true,
  },
  {
    name: "Fix package",
    price: "$1,500–$3,500",
    unit: "fixed price, quoted from your Snapshot",
    pitch: "We fix it in your theme code.",
    items: [
      "Fixes made on a copy of your theme, published only after you approve",
      "Labels, alt text, focus, contrast, cart drawers, popups, skip link",
      "Every fix re-tested with a screen reader",
      "Accessibility statement page for your store",
      "Before-and-after report",
    ],
    note: "50% before work, 50% after.",
    cta: "Ask for a quote",
    href: "mailto:hello@dardy.co?subject=Fix%20package%20quote",
  },
  {
    name: "Monitoring",
    price: "$149",
    unit: "per month",
    pitch: "Stay fixed after every update.",
    items: [
      "Scan every week and after each theme change",
      "Monthly manual check of changed pages",
      "Up to 2 hours of fixes per month",
      "One-page monthly report and statement updates",
    ],
    note: "Cancel any month.",
    cta: "Ask about Monitoring",
    href: "mailto:hello@dardy.co?subject=Monitoring",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-28 px-6 scroll-mt-[120px]" style={{ background: C.surface }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel>Pricing</SectionLabel>
          <SectionTitle>Start small. Fix what matters. Stay fixed.</SectionTitle>
          <p className="mt-5 text-[15px] max-w-xl mx-auto leading-[1.7]" style={{ fontFamily: sans, color: C.body }}>
            Fixed prices in USD. No long contracts, no overlay subscriptions.
          </p>
        </Reveal>
        <div className="mt-16 grid lg:grid-cols-3 gap-5">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div className="premium-card rounded-2xl p-8 h-full flex flex-col" style={{ ...card, border: p.featured ? "1.5px solid rgba(162,79,35,0.55)" : card.border }}>
                {p.featured && (
                  <span className="self-start mb-4 text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: sans, background: "rgba(193,98,46,0.1)", color: C.accent, border: "1px solid rgba(193,98,46,0.3)" }}>Start here</span>
                )}
                <h3 className="font-medium text-[21px]" style={{ fontFamily: serif, color: C.ink }}>{p.name}</h3>
                <p className="mt-1 text-[14px]" style={{ fontFamily: sans, color: C.body }}>{p.pitch}</p>
                <p className="mt-6">
                  <span className="font-semibold text-[34px]" style={{ fontFamily: serif, color: C.ink }}>{p.price}</span>
                  <span className="ml-2 text-[13px]" style={{ fontFamily: sans, color: C.muted }}>{p.unit}</span>
                </p>
                <ul className="mt-6 flex flex-col gap-3 flex-1">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-[14px] leading-relaxed" style={{ fontFamily: sans, color: C.text }}>
                      <CheckCircle2 size={15} aria-hidden="true" className="mt-[3px] shrink-0" style={{ color: C.sage }} />
                      {it}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[12.5px] italic" style={{ fontFamily: sans, color: C.muted }}>{p.note}</p>
                <div className="mt-6">
                  <MagneticButton href={p.href} variant={p.featured ? "primary" : "secondary"} className="w-full !text-[13px]">{p.cta}</MagneticButton>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Sample output                                                      */
/* ---------------------------------------------------------------- */
const REPORT_ROWS = [
  { page: "Product", issue: "Add to Cart has no label", rule: "4.1.2", effort: "S" },
  { page: "All", issue: "38 images with no alt text", rule: "1.1.1", effort: "M" },
  { page: "Cart", issue: "Drawer traps keyboard focus", rule: "2.1.2", effort: "M" },
  { page: "Home", issue: "Gray text below 4.5:1 contrast", rule: "1.4.3", effort: "S" },
];

function MockHeader({ label, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[11px] tracking-widest uppercase font-normal" style={{ fontFamily: sans, color: C.muted }}>{label}</h3>
      <Icon size={14} aria-hidden="true" style={{ color: C.accent }} />
    </div>
  );
}

function Sample() {
  return (
    <section id="sample" className="relative py-28 px-6 scroll-mt-[120px]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <SectionLabel color={C.sage}>Sample report</SectionLabel>
          <SectionTitle max="max-w-2xl">This is what you get.</SectionTitle>
          <p className="mt-5 text-[15px] leading-[1.75] max-w-xl" style={{ fontFamily: sans, color: C.body }}>
            A clear list your team or developer can act on, sorted by risk and effort.
          </p>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          <Reveal delay={0} className="sm:col-span-2">
            <div className="premium-card rounded-2xl p-6" style={cardAlt}>
              <MockHeader label="Issue table · Excerpt" icon={FileText} />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13.5px]" style={{ fontFamily: sans, color: C.text }}>
                  <thead>
                    <tr style={{ color: C.muted }} className="text-[11px] uppercase tracking-wide">
                      <th scope="col" className="py-2 pr-4 font-normal">Page</th>
                      <th scope="col" className="py-2 pr-4 font-normal">Issue</th>
                      <th scope="col" className="py-2 pr-4 font-normal">WCAG</th>
                      <th scope="col" className="py-2 font-normal">Effort</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REPORT_ROWS.map((r) => (
                      <tr key={r.issue} style={{ borderTop: "1px solid rgba(42,30,19,0.08)" }}>
                        <td className="py-3 pr-4">{r.page}</td>
                        <td className="py-3 pr-4">{r.issue}</td>
                        <td className="py-3 pr-4">{r.rule}</td>
                        <td className="py-3">{r.effort}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="premium-card rounded-2xl p-6 h-full" style={cardAlt}>
              <MockHeader label="Before and after" icon={LineChart} />
              <div className="flex items-end gap-8">
                <div>
                  <p className="font-semibold text-[34px] leading-none" style={{ fontFamily: serif, color: C.accent }}>47</p>
                  <p className="mt-2 text-[12.5px]" style={{ fontFamily: sans, color: C.body }}>serious and critical errors before</p>
                </div>
                <ArrowRight size={18} aria-hidden="true" style={{ color: C.muted }} className="mb-6" />
                <div>
                  <p className="font-semibold text-[34px] leading-none" style={{ fontFamily: serif, color: C.sage }}>3</p>
                  <p className="mt-2 text-[12.5px]" style={{ fontFamily: sans, color: C.body }}>left, all in third-party apps</p>
                </div>
              </div>
              <p className="mt-5 text-[11.5px] italic" style={{ fontFamily: sans, color: C.muted }}>Illustrative numbers</p>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="premium-card rounded-2xl p-6 h-full" style={cardAlt}>
              <MockHeader label="Third-party apps" icon={AlertTriangle} />
              <p className="text-[14px] leading-relaxed" style={{ fontFamily: sans, color: C.text }}>
                Review widgets, chat and popups run code we can't change. We
                still test them and list their errors, so you can ask the
                vendor or switch apps.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <p className="mt-10 text-[14px]" style={{ fontFamily: sans, color: C.body }}>
            Want the full sample PDF?{" "}
            <a href="mailto:hello@dardy.co?subject=Sample%20report" className="underline underline-offset-4" style={{ color: C.accent }}>Ask for the sample report</a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Who we help                                                       */
/* ---------------------------------------------------------------- */
const FIT_SPECS = [
  { label: "Platform", value: "Shopify (WooCommerce on request)" },
  { label: "Size", value: "10–200 employees" },
  { label: "Where", value: "US stores, especially NY, FL and CA" },
  { label: "Sector", value: "Clothing, beauty, home, jewelry, furniture" },
  { label: "Bonus risk", value: "A physical shop as well as the website" },
];

function WhoWeHelp() {
  return (
    <section id="who-we-help" className="relative py-28 px-6 scroll-mt-[120px]" style={{ background: C.surface }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <Reveal>
          <SectionLabel>Who we help</SectionLabel>
          <h2 className="mt-3 font-semibold tracking-tight text-[30px] sm:text-[36px]" style={{ fontFamily: serif, color: C.ink, lineHeight: 1.15 }}>
            Online stores that want every shopper to be able to buy.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.75] max-w-md" style={{ fontFamily: sans, color: C.body }}>
            Dardy works with one kind of client: e-commerce stores on Shopify.
            Knowing one platform deeply means faster audits and fixes that
            fit your theme.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="premium-card rounded-2xl p-7" style={card}>
            <p className="text-[11px] tracking-widest uppercase mb-4" style={{ fontFamily: sans, color: C.muted }}>Best fit</p>
            <div className="mb-2 h-px" style={{ background: "linear-gradient(90deg, rgba(42,30,19,0.14), rgba(42,30,19,0.02))" }} />
            <dl className="flex flex-col">
              {FIT_SPECS.map((s, i) => (
                <div key={s.label} className="flex items-center justify-between gap-4 py-3.5" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(42,30,19,0.08)" }}>
                  <dt className="text-[12px] tracking-wide uppercase" style={{ fontFamily: sans, color: C.muted }}>{s.label}</dt>
                  <dd className="text-[13.5px] font-medium text-right" style={{ fontFamily: sans, color: C.text }}>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Honest limits                                                      */
/* ---------------------------------------------------------------- */
const NOT_FOR = [
  "We never sell or install overlay widgets.",
  "We never promise a store is \"lawsuit-proof\" or \"certified compliant\".",
  "We don't give legal advice. If you already have a demand letter, talk to a lawyer first. We can support them with an audit.",
  "We can't change code inside third-party apps. We report their errors instead.",
];

function Limits() {
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <SectionLabel color={C.muted}>Honest by design</SectionLabel>
          <SectionTitle>What we won't do.</SectionTitle>
        </Reveal>
        <Reveal delay={100}>
          <ul className="mt-14 flex flex-col gap-3 text-left max-w-lg mx-auto">
            {NOT_FOR.map((line) => (
              <li key={line} className="flex items-start gap-3 rounded-xl px-5 py-4" style={cardAlt}>
                <XCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.muted }} />
                <span className="text-[14.5px]" style={{ fontFamily: sans, color: C.text }}>{line}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-10 text-[17px] leading-snug max-w-md mx-auto" style={{ fontFamily: serif, color: C.ink }}>
            What we promise: your store tested against WCAG 2.2 Level AA, and real fixes in real code.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Comparison — overlay widget vs Dardy                              */
/* ---------------------------------------------------------------- */
const WIDGET_FLOW = ["One line of script", "A toolbar on top of the page", "Broken code underneath", "Still named in lawsuits"];
const DARDY_FLOW = ["Manual testing", "Fixes in your theme code", "Re-tested with a screen reader", "Monitored after every update"];

function FlowColumn({ label, labelColor, steps, highlight }) {
  return (
    <div>
      <h3 className="text-[12px] tracking-widest uppercase mb-6 text-center font-normal" style={{ fontFamily: sans, color: labelColor }}>{label}</h3>
      <ol className="flex flex-col items-center">
        {steps.map((step, i) => (
          <li key={step} className="w-full flex flex-col items-center">
            <Reveal delay={i * 140} className="w-full">
              <div className="w-full text-center rounded-xl px-5 py-3.5" style={highlight ? { background: "linear-gradient(135deg, rgba(193,98,46,0.1), rgba(110,123,94,0.08))", border: "1px solid rgba(193,98,46,0.3)" } : { background: C.surface, border: "1px dashed rgba(42,30,19,0.25)" }}>
                <span className={highlight ? "text-[13.5px] font-medium" : "text-[13.5px]"} style={{ fontFamily: sans, color: highlight ? C.ink : C.muted }}>{step}</span>
              </div>
            </Reveal>
            {i < steps.length - 1 && (
              <div aria-hidden="true" className="w-px h-7" style={{ background: highlight ? "linear-gradient(180deg,#C1622E,#6E7B5E)" : "rgba(42,30,19,0.18)" }} />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Comparison() {
  return (
    <section className="relative py-28 px-6" style={{ background: C.surface }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel color={C.sage}>Why not a widget?</SectionLabel>
          <SectionTitle>A widget covers the problem. We remove it.</SectionTitle>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-16 grid sm:grid-cols-2 gap-10 sm:gap-8">
            <FlowColumn label="Overlay widget" labelColor={C.muted} steps={WIDGET_FLOW} highlight={false} />
            <FlowColumn label="Dardy" labelColor={C.accent} steps={DARDY_FLOW} highlight />
          </div>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-14 text-[16px] text-center max-w-lg mx-auto leading-snug" style={{ fontFamily: serif, color: C.ink }}>
            The FTC fined one overlay vendor $1 million over misleading claims. A toolbar can't fix the code underneath.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  FAQ                                                                */
/* ---------------------------------------------------------------- */
const FAQS = [
  { q: "What is WCAG 2.2 AA?", a: "The Web Content Accessibility Guidelines are the standard courts, regulators and demand letters point to. Level AA is the level most of them expect. We test your store against version 2.2, the latest." },
  { q: "We already have an accessibility widget. Isn't that enough?", a: "Usually not. About 25% of 2024 lawsuits named a widget or overlay as a barrier. A widget sits on top of the page and doesn't change the code underneath. We're happy to check 3 errors on your store with the widget turned on." },
  { q: "We're a small store. Could we really be targeted?", a: "Small stores are frequent targets, because demand letters are cheap to send. But the bigger reason is simple: if a shopper can't use your checkout, you lose the sale." },
  { q: "Is this legal advice? Will it make us lawsuit-proof?", a: "No and no. Dardy does technical testing and fixes, not legal work, and nobody can honestly promise lawsuit protection. What we give you is a store tested against WCAG 2.2 AA and dated records of every test and fix." },
  { q: "We got a demand letter. Can you help?", a: "Talk to your lawyer first. We can then do a fast audit and fixes to support them, with the lawyer leading." },
  { q: "Can you fix Shopify's checkout?", a: "Shopify controls most of its own checkout. We test it and report what we find, and we mark clearly which issues only Shopify can fix." },
  { q: "Our developer handles the site.", a: "Great. The Snapshot report is written for developers: each issue has the rule, a screenshot and the fix. Many teams use it as a ready-made to-do list." },
  { q: "How long does it take?", a: "A Snapshot is delivered within a few days of kickoff. A Fix package usually takes one to two weeks, depending on how many issues we find." },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-28 px-6 scroll-mt-[120px]">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center">
          <SectionLabel>FAQ</SectionLabel>
          <SectionTitle>Questions, answered.</SectionTitle>
        </Reveal>
        <div className="mt-14 flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 40}>
                <div className="premium-card rounded-2xl overflow-hidden" style={cardAlt}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-btn-${i}`}
                      className="faq-trigger w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                    >
                      <span className="text-[15px] font-medium transition-colors duration-300" style={{ fontFamily: sans, color: isOpen ? C.accent : C.ink }}>{f.q}</span>
                      <ChevronDown size={17} aria-hidden="true" style={{ color: isOpen ? C.accent : C.muted, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)", flexShrink: 0 }} />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    hidden={!isOpen}
                  >
                    <p className="px-6 pb-5 text-[14px] leading-relaxed" style={{ fontFamily: sans, color: C.body }}>{f.a}</p>
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
    <section id="contact" className="relative py-32 px-6 text-center overflow-hidden scroll-mt-[120px]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Parallax speed={0.1} className="warm-glow glow-3" />
      </div>
      <Reveal>
        <h2 className="font-semibold text-[34px] sm:text-[46px] max-w-2xl mx-auto leading-[1.1]" style={{ fontFamily: serif, color: C.ink, letterSpacing: "-0.02em" }}>
          Send us your store URL. We'll send back 3 real errors.
        </h2>
        <p className="mt-5 text-[15px] max-w-lg mx-auto" style={{ fontFamily: sans, color: C.body }}>
          With screenshots and a short note on how to fix each one. Free, and no call needed.
        </p>
        <div className="mt-9">
          <MagneticButton href={MAIL_SCAN}>Get my free check <ArrowRight size={16} aria-hidden="true" /></MagneticButton>
        </div>
        <p className="mt-6 text-[13px]" style={{ fontFamily: sans, color: C.muted }}>
          Or email <a href="mailto:hello@dardy.co" className="underline underline-offset-4" style={{ color: C.accent }}>hello@dardy.co</a>
        </p>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative pt-20 pb-12 px-6" style={{ borderTop: `1px solid ${C.line}` }}>
      <div className="max-w-6xl mx-auto grid sm:grid-cols-[1.3fr_1fr_1fr] gap-12">
        <div>
          <span className="text-[16px] font-semibold" style={{ fontFamily: serif, color: C.ink }}>Dardy</span>
          <p className="mt-3.5 text-[13px] max-w-xs leading-relaxed" style={{ fontFamily: sans, color: C.body }}>
            Accessibility audits and fixes for Shopify stores. Tested against WCAG 2.2 Level AA. Dardy provides technical testing, not legal advice.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-[11px] tracking-widest uppercase mb-4 font-normal" style={{ fontFamily: sans, color: C.muted }}>Navigate</h2>
          <ul className="flex flex-col gap-3 text-[13.5px]" style={{ fontFamily: sans, color: C.body }}>
            <li><a href="#method" className="nav-link">How it works</a></li>
            <li><a href="#pricing" className="nav-link">Pricing</a></li>
            <li><a href="#sample" className="nav-link">Sample report</a></li>
            <li><a href="#faq" className="nav-link">FAQ</a></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-[11px] tracking-widest uppercase mb-4 font-normal" style={{ fontFamily: sans, color: C.muted }}>Connect</h2>
          <ul className="flex flex-col gap-3 text-[13.5px]" style={{ fontFamily: sans, color: C.body }}>
            <li><a href="mailto:hello@dardy.co" className="nav-link">hello@dardy.co</a></li>
            {/* Put your real LinkedIn URL here, or delete this line */}
            <li><a href="https://www.linkedin.com/" className="nav-link">LinkedIn</a></li>
            <li>Remote-first</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-6 flex flex-col sm:flex-row justify-between gap-3" style={{ borderTop: "1px solid rgba(42,30,19,0.08)" }}>
        <span className="text-[12px]" style={{ fontFamily: sans, color: C.muted }}>© 2026 Dardy. All rights reserved.</span>
        <a href="mailto:hello@dardy.co?subject=Accessibility%20problem%20on%20dardy.co" className="nav-link text-[12px]" style={{ fontFamily: sans, color: C.muted }}>
          Found an accessibility problem on this site? Tell us.
        </a>
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
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: sans }}>
      <style>{`
        html { scroll-behavior: smooth; }
        body { position: relative; }

        .skip-link { position: absolute; left: 16px; top: -60px; z-index: 100; background: ${C.ink}; color: #FDF6EA; padding: 10px 16px; border-radius: 8px; font-size: 14px; }
        .skip-link:focus { top: 16px; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

        .warm-glow { position: absolute; width: 560px; height: 560px; border-radius: 9999px; filter: blur(110px); opacity: 0.35; will-change: transform; transform: translate3d(0, var(--parallax-y, 0px), 0); animation: glowBreathe 9s ease-in-out infinite; }
        .glow-1 { top: -200px; left: -120px; background: #E9C9A3; }
        .glow-2 { top: -80px; right: -160px; background: #D9BFA0; animation-delay: -4s; }
        .glow-3 { top: 50%; left: 50%; background: #C1622E; opacity: 0.12; transform: translate(-50%,-50%) translate3d(0, var(--parallax-y, 0px), 0); animation-delay: -2s; }
        @keyframes glowBreathe { 0%, 100% { opacity: 0.32; } 50% { opacity: 0.4; } }

        a { text-decoration: none; }
        ::selection { background: rgba(193,98,46,0.25); color: ${C.ink}; }
        :focus-visible { outline: 2px solid ${C.accent}; outline-offset: 3px; border-radius: 4px; }

        .grain-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.5; background-image: radial-gradient(rgba(42,30,19,0.55) 0.6px, transparent 0.6px); background-size: 3px 3px; mix-blend-mode: overlay; }
        .vignette-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 1; background: radial-gradient(120% 90% at 50% 8%, transparent 60%, rgba(42,30,19,0.05) 100%); }

        .nav-link { padding-bottom: 2px; background-image: linear-gradient(${C.accent},${C.accent}); background-position: 0 100%; background-repeat: no-repeat; background-size: 0% 1px; transition: background-size 0.3s cubic-bezier(0.16,1,0.3,1), color 0.3s ease; }
        .nav-link:hover, .nav-link:focus-visible { background-size: 100% 1px; color: ${C.ink}; }

        .nav-bar { background: rgba(250,242,227, var(--nav-alpha, 0.78)); box-shadow: var(--nav-shadow, 0 10px 30px -16px rgba(42,30,19,0.18)); transition: box-shadow 0.4s ease; }
        .nav-toggle { transition: background 0.25s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1); }
        .nav-toggle:hover { background: rgba(42,30,19,0.05); }
        .nav-toggle:active { transform: scale(0.93); }

        .faq-trigger { transition: background 0.3s ease; }
        .faq-trigger:hover { background: rgba(42,30,19,0.03); }

        .premium-card { transition: transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s cubic-bezier(0.16,1,0.3,1); box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(42,30,19,0.035), 0 1px 2px rgba(42,30,19,0.04), 0 8px 18px -14px rgba(42,30,19,0.13); }
        .premium-card:hover { transform: translateY(-3px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.48), inset 0 -1px 0 rgba(42,30,19,0.04), 0 2px 4px rgba(42,30,19,0.045), 0 26px 44px -28px rgba(42,30,19,0.32); }

        .hero-card-breathe { animation: cardBreathe 9s ease-in-out infinite; }
        @keyframes cardBreathe { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
        }
      `}</style>
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className="grain-overlay" aria-hidden="true" />
      <div className="vignette-overlay" aria-hidden="true" />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Problem />
        <WhyNow />
        <Methodology />
        <Pricing />
        <Sample />
        <WhoWeHelp />
        <Limits />
        <Comparison />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

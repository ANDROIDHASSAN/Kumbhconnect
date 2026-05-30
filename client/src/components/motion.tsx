import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/smooth';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/**
 * Reliable "in view" hook built on IntersectionObserver — with a hard
 * fail-safe so content is NEVER left hidden. (The previous gsap.from +
 * ScrollTrigger approach could leave elements stuck at opacity 0 when the
 * trigger didn't fire under StrictMode / Lenis / route transitions.)
 */
function useInView(ref: React.RefObject<HTMLElement | null>, failSafeMs = 1300): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined' || !ref.current) {
      setShown(true);
      return;
    }
    const el = ref.current;
    let done = false;
    const reveal = () => { if (!done) { done = true; setShown(true); io.disconnect(); clearTimeout(timer); } };
    const io = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) reveal(); }, { threshold: 0.05, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    const timer = window.setTimeout(reveal, failSafeMs); // safety net
    return () => { io.disconnect(); clearTimeout(timer); };
  }, [ref]);
  return shown;
}

// ── Reveal: fade/slide in on scroll (CSS-driven, fail-safe) ──
export function Reveal({
  children, as: Tag = 'div', className, y = 28, delay = 0, stagger,
}: {
  children: ReactNode; as?: ElementType; className?: string; y?: number; delay?: number; stagger?: number; start?: string; once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref);
  const style = { '--rv-y': `${y}px`, '--rv-delay': `${delay}s` } as React.CSSProperties;
  return (
    <Tag ref={ref} style={style} className={cn(stagger ? 'reveal-stagger' : 'reveal', shown && 'is-in', className)}>
      {children}
    </Tag>
  );
}

// ── SplitHeading: word-by-word mask reveal (CSS-driven, fail-safe) ──
export function SplitHeading({
  text, as: Tag = 'h2', className, trigger = 'scroll', delay = 0,
}: {
  text: string; as?: ElementType; className?: string; trigger?: 'scroll' | 'load'; delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, trigger === 'load' ? 150 : 1300);
  return (
    <Tag ref={ref} className={cn('split', shown && 'is-in', className)}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="split-word">
          <span style={{ transitionDelay: `${delay + i * 0.05}s` }}>{w}&nbsp;</span>
        </span>
      ))}
    </Tag>
  );
}

// ── AnimatedNumber: counts up when scrolled into view (fail-safe) ──
export function AnimatedNumber({ to, duration = 1.8, prefix = '', suffix = '', className }: { to: number; duration?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useInView(ref, 1500);
  useEffect(() => {
    if (!shown || !ref.current) return;
    const el = ref.current;
    const render = (v: number) => { el.textContent = `${prefix}${Math.round(v).toLocaleString('en-IN')}${suffix}`; };
    if (prefersReducedMotion()) { render(to); return; }
    const obj = { v: 0 };
    const tween = gsap.to(obj, { v: to, duration, ease: 'power2.out', onUpdate: () => render(obj.v) });
    return () => { tween.kill(); };
  }, [shown, to, duration, prefix, suffix]);
  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}

// ── Parallax: scrub vertical drift while scrolling through viewport ──
export function Parallax({ children, speed = -14, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion() || isTouch() || !ref.current) return;
    gsap.to(ref.current, {
      yPercent: speed, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

// ── Magnetic: element eases toward the cursor on hover ──
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  function move(e: React.MouseEvent) {
    if (isTouch() || prefersReducedMotion() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    gsap.to(ref.current, { x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength, duration: 0.45, ease: 'power3.out' });
  }
  function leave() {
    if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
  }
  return <span ref={ref} onMouseMove={move} onMouseLeave={leave} className={cn('inline-block', className)}>{children}</span>;
}

// ── TiltCard: subtle 3D tilt toward the cursor ──
export function TiltCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.MouseEvent) {
    if (isTouch() || prefersReducedMotion() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(ref.current, { rotateY: px * max, rotateX: -py * max, duration: 0.4, ease: 'power2.out', transformPerspective: 900 });
  }
  function leave() {
    if (ref.current) gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power3.out' });
  }
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={className} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
}

// ── Marquee: seamless infinite scroll (pauses on hover) ──
export function Marquee({ children, speed = 34, reverse, className }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string }) {
  return (
    <div className={cn('marquee group relative flex overflow-hidden', className)}>
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className="marquee-track flex shrink-0 items-center gap-10 pr-10"
          style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

// ── ScrollProgress: thin saffron bar showing page scroll ──
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.set(ref.current, { scaleX: 0, transformOrigin: 'left center' });
    gsap.to(ref.current, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });
  }, []);
  return <div ref={ref} className="fixed inset-x-0 top-0 z-[90] h-[3px] bg-gradient-to-r from-saffron via-gold to-saffron" />;
}

// ── CustomCursor: soft follower that grows over interactive elements ──
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (isTouch() || prefersReducedMotion()) return;
    const d = dot.current!, r = ring.current!;
    const xs = gsap.quickTo(d, 'x', { duration: 0.15, ease: 'power3' });
    const ys = gsap.quickTo(d, 'y', { duration: 0.15, ease: 'power3' });
    const xr = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3' });
    const yr = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3' });
    const move = (e: MouseEvent) => { xs(e.clientX); ys(e.clientY); xr(e.clientX); yr(e.clientY); };
    let active = false;
    const over = (e: MouseEvent) => {
      const interactive = !!(e.target as HTMLElement).closest('a,button,select,input,textarea,[role="button"]');
      if (interactive === active) return;
      active = interactive;
      gsap.to(r, { scale: interactive ? 1.8 : 1, opacity: interactive ? 0.9 : 0.5, duration: 0.3 });
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); };
  }, []);
  if (typeof window !== 'undefined' && (isTouch() || prefersReducedMotion())) return null;
  return (
    <>
      <div ref={ring} className="cursor-ring pointer-events-none fixed left-0 top-0 z-[100] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-saffron/70 lg:block" />
      <div ref={dot} className="cursor-dot pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-saffron lg:block" />
    </>
  );
}

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface SmoothCtx {
  lenis: Lenis | null;
  scrollTo: (target: number | string | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;
}
const Ctx = createContext<SmoothCtx>({ lenis: null, scrollTo: () => {} });

export function useSmooth() {
  return useContext(Ctx);
}

/**
 * Lenis smooth-scroll synced to GSAP's ticker + ScrollTrigger. Gives the whole
 * site that weighted, glidey feel. Disabled when the user prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    ScrollTrigger.config({ ignoreMobileResize: true });
    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = instance;
    setLenis(instance);

    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const scrollTo: SmoothCtx['scrollTo'] = (target, opts) => {
    if (lenisRef.current) lenisRef.current.scrollTo(target as any, { offset: opts?.offset ?? 0, immediate: opts?.immediate });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: opts?.immediate ? 'auto' : 'smooth' });
  };

  return <Ctx.Provider value={{ lenis, scrollTo }}>{children}</Ctx.Provider>;
}

import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { WhatsAppFab } from '@/components/WhatsAppFab';
import { ConsentBanner } from '@/components/ConsentBanner';
import { ScrollProgress } from '@/components/motion';
import { useSmooth } from '@/lib/smooth';
import { Home } from '@/pages/Home';
import { Services } from '@/pages/Services';
import { ServiceDetail } from '@/pages/ServiceDetail';
import { VendorDetail } from '@/pages/VendorDetail';
import { Guide } from '@/pages/Guide';
import { HowItWorks } from '@/pages/HowItWorks';
import { Book } from '@/pages/Book';
import { Vendors } from '@/pages/Vendors';
import { About } from '@/pages/About';
import { Safety } from '@/pages/Safety';
import { Contact } from '@/pages/Contact';
import { Legal } from '@/pages/Legal';
import { Emergency } from '@/pages/Emergency';
import { Admin } from '@/pages/Admin';
import { NotFound } from '@/pages/NotFound';

function RouteEffects() {
  const { pathname } = useLocation();
  const { scrollTo } = useSmooth();
  useEffect(() => {
    scrollTo(0, { immediate: true });
    // Route content height changes — recompute ScrollTrigger positions.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 140);
    return () => window.clearTimeout(id);
  }, [pathname, scrollTo]);
  return null;
}

export function App() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <RouteEffects />
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* keyed by route → replays the entrance animation on each navigation */}
        <div key={pathname} className="route-fade">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/vendor/:id" element={<VendorDetail />} />
            <Route path="/kumbh-guide" element={<Guide />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/book" element={<Book />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/about" element={<About />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Legal kind="privacy" />} />
            <Route path="/refunds" element={<Legal kind="refunds" />} />
            <Route path="/terms" element={<Legal kind="terms" />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <SiteFooter />
      {/* The chat FAB is for public visitors — hide it in the admin console. */}
      {pathname !== '/admin' && <WhatsAppFab />}
      <ConsentBanner />
    </div>
  );
}

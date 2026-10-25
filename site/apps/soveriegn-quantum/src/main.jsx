import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '@fontsource-variable/azeret-mono/index.css';
import 'lenis/dist/lenis.css';
import './styles.css';
import { scrollToY, startSmoothScroll } from './smooth.js';
import { Header, Footer } from './components/Chrome.jsx';
import Home from './pages/Home.jsx';
import Basilisk from './pages/Basilisk.jsx';
import Company from './pages/Company.jsx';
import Facilities from './pages/Facilities.jsx';
import Contact from './pages/Contact.jsx';

const TITLES = {
  '/': 'Soveriegn Quantum: a machine you can open',
  '/basilisk-2': 'Basilisk 2 · Soveriegn Quantum',
  '/company': 'Company · Soveriegn Quantum',
  '/facilities': 'Facilities · Soveriegn Quantum',
  '/contact': 'Contact · Soveriegn Quantum',
};

function Page({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] || 'Not found · Soveriegn Quantum';
    scrollToY(0, { immediate: true });
    if (pathname !== '/') {
      document.documentElement.style.removeProperty('--stage-bg');
      document.documentElement.setAttribute('data-tone', 'light');
    }
  }, [pathname]);
  return children;
}

function NotFound() {
  return (
    <section className="page-hero" aria-labelledby="h-404">
      <div className="page-hero__text">
        <p className="kicker"><span className="mono">404</span> Not found</p>
        <h1 id="h-404" className="display">Nothing at this address.</h1>
        <p className="lede"><Link to="/">Back to the machine</Link></p>
      </div>
    </section>
  );
}

startSmoothScroll();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Header />
      <main id="main">
        <Page>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/basilisk-2" element={<Basilisk />} />
            <Route path="/company" element={<Company />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Page>
      </main>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);

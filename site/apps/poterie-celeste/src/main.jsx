import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Footer, Header } from './components/Chrome.jsx';
import Home from './pages/Home.jsx';
import { Collection, CollectionsIndex } from './pages/Collections.jsx';
import Piece from './pages/Piece.jsx';
import Commissions from './pages/Commissions.jsx';
import Atelier from './pages/Atelier.jsx';
import { JournalIndex, JournalPost } from './pages/Journal.jsx';
import Visit from './pages/Visit.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles/global.css';

// Holds on to the outgoing page while it fades, instead of rendering the new route twice.
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

function Layout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // Pinned scenes measure the page; let them re-measure once the new route has painted.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [location.pathname]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main id="main" key={location.pathname}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          <FrozenOutlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/collections', element: <CollectionsIndex /> },
      { path: '/collections/:slug', element: <Collection /> },
      { path: '/pieces/:slug', element: <Piece /> },
      { path: '/commissions', element: <Commissions /> },
      { path: '/atelier', element: <Atelier /> },
      { path: '/journal', element: <JournalIndex /> },
      { path: '/journal/:slug', element: <JournalPost /> },
      { path: '/visit', element: <Visit /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  </StrictMode>,
);

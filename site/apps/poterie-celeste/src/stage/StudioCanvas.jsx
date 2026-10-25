import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import * as THREE from 'three';
import Studio from './Studio.jsx';

const BASE = import.meta.env.BASE_URL;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// Keep pot and plinth framed whatever the viewport's shape: widen the lens on tall screens.
function Framing({ focus = 1.22, distance = 4.4 }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const fov = aspect >= 1.2 ? 26 : Math.min(46, 26 * (1.2 / aspect) * 0.66);
    camera.fov = fov;
    camera.position.set(0, focus + 0.25, distance);
    // On portrait screens aim lower so the pot rides high, clear of the chapter text.
    camera.lookAt(0, aspect < 1 ? focus - 0.34 : focus, 0);
    camera.updateProjectionMatrix();
  }, [camera, size, focus, distance]);
  return null;
}

function Ready({ onReady }) {
  const { active, progress } = useProgress();
  useEffect(() => {
    if (!active && progress === 100) onReady();
  }, [active, progress, onReady]);
  return null;
}

export default function StudioCanvas({ progressRef, label, className = '', active = true }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const webgl = useMemo(hasWebGL, []);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <div className={`studio ${className}`} data-ready={ready} role="img" aria-label={label}>
      <img className="studio__poster" src={`${BASE}models/studio-poster.webp`} srcSet={`${BASE}models/studio-poster-960.webp 960w, ${BASE}models/studio-poster.webp 1920w`} sizes="100vw" alt="" aria-hidden="true" />
      {webgl && !failed && (
        <Canvas
          className="studio__canvas"
          frameloop={active ? 'always' : 'never'}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, toneMapping: THREE.AgXToneMapping, toneMappingExposure: 1.18, powerPreference: 'high-performance' }}
          camera={{ position: [0, 1.47, 4.4], fov: 26, near: 0.1, far: 30 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setFailed(true); });
          }}
        >
          <color attach="background" args={['#6f675e']} />
          <Framing />
          <Suspense fallback={null}>
            <Studio progressRef={progressRef} pointerRef={pointer} />
            <Ready onReady={() => setReady(true)} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

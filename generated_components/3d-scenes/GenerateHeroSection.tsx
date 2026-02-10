/**
 * @description Hero section with a 3D background using a reference image as a textured plane.
 * Features a frosted-glass container, animated entrance, and responsive layout.
 * @props {{ imageUrl?: string; title?: string; subtitle?: string; ctaLabel?: string; className?: string; }}
 * @example <GenerateHeroSection title="Welcome" subtitle="Explore the future" ctaLabel="Get Started" imageUrl="http://localhost:5173/captures/capture-1770661545912.png" />
 * @peerdeps three @react-three/fiber @react-three/drei
 */
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  className?: string;
}

const HeroBackground: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  const textureRef = useTexture(imageUrl);
  return (
    <mesh rotation={-Math.PI / 2}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        map={textureRef}
        displacementScale={0.05}
        displacementMap={textureRef}
        transparent={true}
        opacity={0.85}
      />
    </mesh>
  );
};

const FloatingContainer: React.FC<Props> = ({ imageUrl, title, subtitle, ctaLabel, className }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (typeof window === 'undefined') return null;
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 60px ${ctaLabel || '#55efc4'}22`,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.96)',
        transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <HeroBackground imageUrl={imageUrl} />
        <ambientLight intensity={0.2} />
      </Canvas>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', textAlign: 'center', zIndex: 10 }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', -webkitBackgroundClip: 'text', -webkitTextFillColor: 'transparent' }}>{title}</h1>
        <p style={{ marginTop: '1rem', fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', lineHeight: '1.6' }}>{subtitle}</p>
        <button style={{ marginTop: '2rem', padding: '12px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: '#fff', fontSize: '1rem' }}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};

export default FloatingContainer;
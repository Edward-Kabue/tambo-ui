/**
 * @description Animated particle fog / dust background using Three.js points.
 * Creates a floating particle field effect for atmospheric backgrounds.
 * @props {{ count?: number; color?: string; speed?: number; size?: number; className?: string }}
 * @example <ParticleFog count={500} color="#ffffff" speed={0.3} />
 * @peerdeps three @react-three/fiber
 */
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
  className?: string;
}

function Particles({
  count = 300,
  color = "#ffffff",
  speed = 0.2,
  size = 0.02,
}: Omit<Props, "className">) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);

  const opacities = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = Math.random() * 0.6 + 0.2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(t + i * 0.1) * 0.001;
      pos[i * 3 + 0] += Math.cos(t + i * 0.05) * 0.0005;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = t * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

const ParticleFog: React.FC<Props> = ({ count, color, speed, size, className }) => {
  if (typeof window === "undefined") return null;
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "400px",
        background: "#0a0a0a",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <Particles count={count} color={color} speed={speed} size={size} />
      </Canvas>
    </div>
  );
};

export default ParticleFog;

/**
 * @description A floating 3D torus knot with metallic material, soft lighting, and orbit controls.
 * @props {{ speed?: number; color?: string; className?: string }}
 * @example <FloatingKnot speed={1.2} color="#ff6600" />
 * @peerdeps three @react-three/fiber @react-three/drei
 */
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  speed?: number;
  color?: string;
  className?: string;
}

function Knot({ speed = 1, color = "#6c5ce7" }: Omit<Props, "className">) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * speed * 0.5;
    ref.current.rotation.x += delta * speed * 0.2;
  });
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.35, 128, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
    </Float>
  );
}

const FloatingKnot: React.FC<Props> = ({ speed, color, className }) => {
  if (typeof window === "undefined") return null;
  return (
    <div className={className} style={{ width: "100%", height: "400px", background: "#0a0a0a", borderRadius: "12px", overflow: "hidden" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Knot speed={speed} color={color} />
        <Environment preset="city" />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default FloatingKnot;

/**
 * @description Interactive 3D product viewer with image texture, auto-rotation, and zoom.
 * Accepts imageUrl prop to texture a 3D box — useful for product showcases.
 * @props {{ imageUrl?: string; rotateSpeed?: number; color?: string; className?: string }}
 * @example <ProductViewer imageUrl="https://picsum.photos/512" />
 * @peerdeps three @react-three/fiber @react-three/drei
 */
import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  imageUrl?: string;
  rotateSpeed?: number;
  color?: string;
  className?: string;
}

function ProductBox({
  imageUrl,
  rotateSpeed = 0.5,
  color = "#ffffff",
}: Omit<Props, "className">) {
  const ref = useRef<THREE.Mesh>(null!);
  const texture = imageUrl ? useTexture(imageUrl) : null;

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * rotateSpeed;
  });

  return (
    <mesh ref={ref} castShadow position={[0, 0.5, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      {texture ? (
        <meshStandardMaterial map={texture} roughness={0.4} metalness={0.2} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      )}
    </mesh>
  );
}

function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

const ProductViewer: React.FC<Props> = ({ imageUrl, rotateSpeed, color, className }) => {
  if (typeof window === "undefined") return null;
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "450px",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas shadows camera={{ position: [4, 3, 4], fov: 40 }}>
        <ambientLight intensity={0.3} />
        <spotLight position={[5, 8, 5]} angle={0.3} penumbra={0.5} intensity={1.5} castShadow />
        <Suspense fallback={<Fallback />}>
          <ProductBox imageUrl={imageUrl} rotateSpeed={rotateSpeed} color={color} />
        </Suspense>
        <ContactShadows position={[0, -0.5, 0]} opacity={0.5} blur={2} far={4} />
        <Environment preset="studio" />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
      </Canvas>
    </div>
  );
};

export default ProductViewer;

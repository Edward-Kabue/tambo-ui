/**
 * @description Animated aurora / gradient mesh background using a custom GLSL shader.
 * Renders flowing color waves for hero sections or full-page backgrounds.
 * @props {{ colors?: [string, string, string]; speed?: number; className?: string }}
 * @example <AuroraMesh colors={["#6c5ce7","#00cec9","#fd79a8"]} speed={0.8} />
 * @peerdeps three @react-three/fiber
 */
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  colors?: [string, string, string];
  speed?: number;
  className?: string;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;

  // simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    float n1 = snoise(vUv * 3.0 + uTime * 0.3);
    float n2 = snoise(vUv * 2.0 - uTime * 0.2);
    float blend1 = smoothstep(-0.5, 0.5, n1);
    float blend2 = smoothstep(-0.3, 0.7, n2);
    vec3 color = mix(uColor1, uColor2, blend1);
    color = mix(color, uColor3, blend2 * 0.5);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function AuroraPlane({
  colors = ["#6c5ce7", "#00cec9", "#fd79a8"],
  speed = 1,
}: Omit<Props, "className">) {
  const ref = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(colors[0]) },
      uColor2: { value: new THREE.Color(colors[1]) },
      uColor3: { value: new THREE.Color(colors[2]) },
    }),
    [colors]
  );

  useFrame((_, delta) => {
    ref.current.uniforms.uTime.value += delta * speed;
  });

  return (
    <mesh>
      <planeGeometry args={[4, 4, 1, 1]} />
      <shaderMaterial
        ref={ref}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

const AuroraMesh: React.FC<Props> = ({ colors, speed, className }) => {
  if (typeof window === "undefined") return null;
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
        <AuroraPlane colors={colors} speed={speed} />
      </Canvas>
    </div>
  );
};

export default AuroraMesh;

/**
 * @description Animated loading spinner with staggered dots using GSAP.
 * @props {{ size?: number; color?: string; count?: number; className?: string }}
 * @example <PulseLoader size={12} color="#00cec9" />
 * @peerdeps gsap
 */
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface Props {
  size?: number;
  color?: string;
  count?: number;
  className?: string;
}

const PulseLoader: React.FC<Props> = ({
  size = 10,
  color = "#6c5ce7",
  count = 3,
  className,
}) => {
  const container = useRef<HTMLDivElement>(null!);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const dots = container.current.querySelectorAll<HTMLSpanElement>("[data-dot]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        dots,
        { scale: 0.5, opacity: 0.3 },
        {
          scale: 1.2,
          opacity: 1,
          duration: 0.5,
          ease: "power1.inOut",
          stagger: { each: 0.15, repeat: -1, yoyo: true },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [count]);

  return (
    <div
      ref={container}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${size * 0.6}px`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          data-dot=""
          style={{
            display: "block",
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
};

export default PulseLoader;

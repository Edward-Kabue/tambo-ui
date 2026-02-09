/**
 * @description Crossfade page transition with depth (scale + opacity).
 * Wrap route content and toggle `active` to animate in/out.
 * @props {{ active: boolean; duration?: number; scale?: number; children: React.ReactNode; className?: string }}
 * @example <CrossfadeDepth active={isVisible}><MyPage /></CrossfadeDepth>
 * @peerdeps gsap
 */
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface Props {
  active: boolean;
  duration?: number;
  scale?: number;
  children: React.ReactNode;
  className?: string;
}

const CrossfadeDepth: React.FC<Props> = ({
  active,
  duration = 0.6,
  scale = 0.95,
  children,
  className,
}) => {
  const el = useRef<HTMLDivElement>(null!);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (active) {
        gsap.fromTo(
          el.current,
          { opacity: 0, scale, filter: "blur(8px)" },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: prefersReduced ? 0 : duration,
            ease: "power2.out",
          }
        );
      } else {
        gsap.to(el.current, {
          opacity: 0,
          scale,
          filter: "blur(8px)",
          duration: prefersReduced ? 0 : duration * 0.6,
          ease: "power2.in",
        });
      }
    });

    return () => ctx.revert();
  }, [active, duration, scale]);

  return (
    <div
      ref={el}
      className={className}
      style={{
        willChange: "transform, opacity, filter",
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
};

export default CrossfadeDepth;

/**
 * @description Full-page wipe transition that reveals content with a sliding clip-path.
 * Toggle the `active` prop to trigger the transition.
 * @props {{ active: boolean; direction?: "left"|"right"|"up"|"down"; duration?: number; color?: string; children: React.ReactNode; className?: string }}
 * @example <WipeTransition active={show} direction="left"><Page /></WipeTransition>
 * @peerdeps gsap
 */
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface Props {
  active: boolean;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  color?: string;
  children: React.ReactNode;
  className?: string;
}

const clipPaths: Record<string, { from: string; to: string }> = {
  left:  { from: "inset(0 100% 0 0)", to: "inset(0 0% 0 0)" },
  right: { from: "inset(0 0 0 100%)", to: "inset(0 0 0 0%)" },
  up:    { from: "inset(100% 0 0 0)", to: "inset(0% 0 0 0)" },
  down:  { from: "inset(0 0 100% 0)", to: "inset(0 0 0% 0)" },
};

const WipeTransition: React.FC<Props> = ({
  active,
  direction = "left",
  duration = 0.8,
  color = "#6c5ce7",
  children,
  className,
}) => {
  const overlay = useRef<HTMLDivElement>(null!);
  const content = useRef<HTMLDivElement>(null!);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clip = clipPaths[direction] || clipPaths.left;

    const ctx = gsap.context(() => {
      if (active) {
        if (prefersReduced) {
          gsap.set(overlay.current, { clipPath: clip.to });
          gsap.set(content.current, { opacity: 1 });
          return;
        }
        const tl = gsap.timeline();
        tl.fromTo(
          overlay.current,
          { clipPath: clip.from },
          { clipPath: clip.to, duration, ease: "power3.inOut" }
        ).fromTo(
          content.current,
          { opacity: 0 },
          { opacity: 1, duration: duration * 0.5 },
          `-=${duration * 0.3}`
        );
      } else {
        gsap.set(overlay.current, { clipPath: clipPaths[direction].from });
        gsap.set(content.current, { opacity: 0 });
      }
    });

    return () => ctx.revert();
  }, [active, direction, duration]);

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={overlay}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: color,
          clipPath: clipPaths[direction]?.from ?? clipPaths.left.from,
          zIndex: 1,
        }}
      />
      <div ref={content} style={{ position: "relative", zIndex: 2, opacity: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default WipeTransition;

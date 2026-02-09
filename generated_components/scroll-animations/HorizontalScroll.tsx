/**
 * @description Horizontal scroll section — pins content and scrolls children horizontally
 * as the user scrolls vertically. Great for portfolios and showcases.
 * @props {{ children: React.ReactNode; speed?: number; backgroundColor?: string; className?: string }}
 * @example
 *   <HorizontalScroll>
 *     <div style={{ width: '100vw' }}>Panel 1</div>
 *     <div style={{ width: '100vw' }}>Panel 2</div>
 *   </HorizontalScroll>
 * @peerdeps gsap
 */
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: React.ReactNode;
  speed?: number;
  backgroundColor?: string;
  className?: string;
}

const HorizontalScroll: React.FC<Props> = ({
  children,
  speed = 1,
  backgroundColor = "#0a0a0a",
  className,
}) => {
  const container = useRef<HTMLDivElement>(null!);
  const track = useRef<HTMLDivElement>(null!);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const totalWidth = track.current.scrollWidth - window.innerWidth;

      gsap.to(track.current, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          pin: true,
          scrub: speed,
          end: () => `+=${totalWidth}`,
          invalidateOnRefresh: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div
      ref={container}
      className={className}
      style={{
        overflow: "hidden",
        background: backgroundColor,
      }}
    >
      <div
        ref={track}
        style={{
          display: "flex",
          flexWrap: "nowrap",
          width: "max-content",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default HorizontalScroll;

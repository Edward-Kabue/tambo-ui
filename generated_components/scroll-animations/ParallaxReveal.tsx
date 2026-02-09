/**
 * @description Content section that fades in and slides up on scroll with GSAP ScrollTrigger.
 * @props {{ children: React.ReactNode; offset?: number; duration?: number; className?: string }}
 * @example <ParallaxReveal offset={100}><h1>Hello World</h1></ParallaxReveal>
 * @peerdeps gsap
 */
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: React.ReactNode;
  offset?: number;
  duration?: number;
  className?: string;
}

const ParallaxReveal: React.FC<Props> = ({
  children,
  offset = 80,
  duration = 1,
  className,
}) => {
  const el = useRef<HTMLDivElement>(null!);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.current,
        { y: offset, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [offset, duration]);

  return (
    <div ref={el} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
};

export default ParallaxReveal;

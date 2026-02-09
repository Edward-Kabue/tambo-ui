/**
 * @description Button that magnetically follows the cursor on hover with elastic snap-back.
 * @props {{ children: React.ReactNode; strength?: number; backgroundColor?: string; textColor?: string; className?: string }}
 * @example <MagneticButton strength={0.4}>Click me</MagneticButton>
 * @peerdeps gsap
 */
import React, { useRef, useCallback } from "react";
import gsap from "gsap";

interface Props {
  children: React.ReactNode;
  strength?: number;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

const MagneticButton: React.FC<Props> = ({
  children,
  strength = 0.35,
  backgroundColor = "#6c5ce7",
  textColor = "#ffffff",
  className,
}) => {
  const btn = useRef<HTMLButtonElement>(null!);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const { left, top, width, height } = btn.current.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) * strength;
      const y = (e.clientY - top - height / 2) * strength;
      gsap.to(btn.current, { x, y, duration: 0.3, ease: "power2.out" });
    },
    [strength]
  );

  const handleLeave = useCallback(() => {
    gsap.to(btn.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  }, []);

  return (
    <button
      ref={btn}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 36px",
        border: "none",
        borderRadius: "8px",
        background: backgroundColor,
        color: textColor,
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        willChange: "transform",
        transition: "box-shadow 0.3s ease",
        boxShadow: `0 4px 24px ${backgroundColor}66`,
      }}
    >
      {children}
    </button>
  );
};

export default MagneticButton;

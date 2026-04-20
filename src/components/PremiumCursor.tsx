import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function PremiumCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Elements that should trigger cursor expansion
      const isInteractable = target.tagName.toLowerCase() === 'a' ||
                             target.tagName.toLowerCase() === 'button' ||
                             target.closest('a') !== null ||
                             target.closest('button') !== null ||
                             target.classList.contains('cursor-pointer');
      setIsHovering(isInteractable);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Don't show custom cursor on touch devices where hover isn't natural
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null;
  }

  return (
    <>
      {/* Outer Glowing Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.8 : 1,
          opacity: isHovering ? 0 : 1,
          border: '2px solid rgba(255, 255, 255, 0.8)'
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.5 }}
      />
      {/* Inner Dot / Highlight */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[10000] hidden md:block"
        animate={{
          x: mousePosition.x - (isHovering ? 24 : 4),
          y: mousePosition.y - (isHovering ? 24 : 4),
          width: isHovering ? 48 : 8,
          height: isHovering ? 48 : 8,
          backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 1)',
          backdropFilter: isHovering ? 'blur(4px)' : 'none',
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.2 }}
        style={{
          boxShadow: isHovering ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 0 10px rgba(255,255,255,0.8)'
        }}
      />
    </>
  );
}

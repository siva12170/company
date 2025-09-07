import React, { useRef, useEffect } from 'react';

// A reusable component that creates the glowing, mouse-tracking hover effect.
export default function HoverCard({ children, className }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={cardRef} className={`relative bg-white/95 rounded-2xl border-2 border-black shadow-2xl overflow-hidden group backdrop-blur-lg ${className}`}>
        <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
                background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(0, 0, 0, 0.05), transparent 80%)`,
            }}
        />
        <div className="relative z-10">
            {children}
        </div>
    </div>
  );
};

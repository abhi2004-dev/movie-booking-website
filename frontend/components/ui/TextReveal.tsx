import React from "react";

export function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`animate-[reveal_0.8s_ease-out_forwards] opacity-0 translate-y-4 ${className}`}>
      {text}
      <style>{`
        @keyframes reveal {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
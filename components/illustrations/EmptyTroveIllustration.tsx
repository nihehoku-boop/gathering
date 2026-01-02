/**
 * Enhanced empty state illustration for "Your trove is empty"
 * This shows a detailed treasure chest with sparkles to represent an empty collection
 */

export default function EmptyTroveIllustration({ className = "h-48 w-48" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background glow */}
      <circle cx="100" cy="100" r="95" fill="url(#glow-gradient)" opacity="0.1" />
      
      {/* Treasure Chest - Main Body */}
      <rect x="50" y="120" width="100" height="50" rx="4" fill="url(#chest-gradient)" stroke="var(--accent-color)" strokeWidth="2" />
      
      {/* Chest lid (closed) */}
      <path
        d="M 50 120 Q 50 110 55 105 L 100 90 L 145 105 Q 150 110 150 120"
        fill="url(#lid-gradient)"
        stroke="var(--accent-color)"
        strokeWidth="2"
      />
      
      {/* Chest lock/keyhole */}
      <circle cx="100" cy="125" r="8" fill="none" stroke="var(--accent-color)" strokeWidth="2" />
      <rect x="98" y="125" width="4" height="6" fill="var(--accent-color)" />
      
      {/* Chest straps/bands */}
      <rect x="60" y="135" width="80" height="4" fill="var(--accent-color)" opacity="0.3" />
      <rect x="60" y="145" width="80" height="4" fill="var(--accent-color)" opacity="0.3" />
      
      {/* Sparkles/particles around chest */}
      <g opacity="0.6">
        {/* Top sparkles */}
        <circle cx="85" cy="85" r="3" fill="var(--gold-color)" />
        <circle cx="115" cy="80" r="2.5" fill="var(--gold-color)" />
        <circle cx="75" cy="95" r="2" fill="var(--gold-color)" />
        <circle cx="125" cy="92" r="2.5" fill="var(--gold-color)" />
        
        {/* Side sparkles */}
        <circle cx="40" cy="110" r="2" fill="var(--accent-color)" />
        <circle cx="160" cy="108" r="2.5" fill="var(--accent-color)" />
        <circle cx="45" cy="140" r="2" fill="var(--gold-color)" />
        <circle cx="155" cy="138" r="2.5" fill="var(--gold-color)" />
      </g>
      
      {/* Subtle shadow under chest */}
      <ellipse cx="100" cy="175" rx="45" ry="8" fill="var(--bg-tertiary)" opacity="0.5" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="chest-gradient" x1="50" y1="120" x2="150" y2="170">
          <stop offset="0%" stopColor="var(--bg-tertiary)" />
          <stop offset="100%" stopColor="var(--bg-secondary)" />
        </linearGradient>
        <linearGradient id="lid-gradient" x1="50" y1="90" x2="150" y2="120">
          <stop offset="0%" stopColor="var(--bg-secondary)" />
          <stop offset="100%" stopColor="var(--bg-tertiary)" />
        </linearGradient>
        <radialGradient id="glow-gradient" cx="100" cy="100">
          <stop offset="0%" stopColor="var(--accent-color)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  )
}


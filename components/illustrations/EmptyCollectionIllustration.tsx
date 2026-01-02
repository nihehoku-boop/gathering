/**
 * Enhanced empty state illustration for "This collection is empty"
 * Shows an open treasure chest with items floating out or waiting to be added
 */

export default function EmptyCollectionIllustration({ className = "h-48 w-48" }: { className?: string }) {
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
      <rect x="50" y="130" width="100" height="50" rx="4" fill="url(#chest-gradient)" stroke="var(--accent-color)" strokeWidth="2" />
      
      {/* Chest lid (open) */}
      <path
        d="M 50 130 Q 50 120 55 115 L 100 95 L 145 115 Q 150 120 150 130"
        fill="url(#lid-gradient)"
        stroke="var(--accent-color)"
        strokeWidth="2"
        transform="rotate(-25 100 130)"
        transformOrigin="100 130"
      />
      
      {/* Chest interior (empty, showing inside) */}
      <rect x="55" y="135" width="90" height="40" rx="2" fill="var(--bg-primary)" opacity="0.5" />
      
      {/* Items floating above (representing items to be added) */}
      <g opacity="0.7">
        {/* Item 1 - Small box/card */}
        <rect x="70" y="80" width="20" height="15" rx="2" fill="var(--accent-color)" opacity="0.4" />
        <line x1="75" y1="85" x2="85" y2="85" stroke="var(--accent-color)" strokeWidth="1" />
        <line x1="75" y1="90" x2="85" y2="90" stroke="var(--accent-color)" strokeWidth="1" />
        
        {/* Item 2 - Circle/item */}
        <circle cx="120" cy="75" r="8" fill="var(--gold-color)" opacity="0.4" />
        <circle cx="120" cy="75" r="4" fill="var(--gold-color)" opacity="0.6" />
        
        {/* Item 3 - Another item */}
        <rect x="145" y="85" width="15" height="12" rx="2" fill="var(--accent-color)" opacity="0.4" transform="rotate(15 152.5 91)" />
      </g>
      
      {/* Sparkles/particles */}
      <g opacity="0.5">
        <circle cx="65" cy="70" r="2" fill="var(--gold-color)" />
        <circle cx="135" cy="65" r="2.5" fill="var(--gold-color)" />
        <circle cx="80" cy="60" r="2" fill="var(--accent-color)" />
        <circle cx="150" cy="70" r="2" fill="var(--accent-color)" />
      </g>
      
      {/* Subtle shadow under chest */}
      <ellipse cx="100" cy="185" rx="45" ry="8" fill="var(--bg-tertiary)" opacity="0.5" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="chest-gradient" x1="50" y1="130" x2="150" y2="180">
          <stop offset="0%" stopColor="var(--bg-tertiary)" />
          <stop offset="100%" stopColor="var(--bg-secondary)" />
        </linearGradient>
        <linearGradient id="lid-gradient" x1="50" y1="95" x2="150" y2="130">
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


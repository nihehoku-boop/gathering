/**
 * Enhanced empty state illustration for "No collections found" (search/filter results)
 * Shows a magnifying glass with a treasure map theme
 */

export default function NoResultsIllustration({ className = "h-48 w-48" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background glow */}
      <circle cx="100" cy="100" r="95" fill="url(#glow-gradient)" opacity="0.1" />
      
      {/* Magnifying glass handle */}
      <rect x="125" y="125" width="8" height="30" rx="4" fill="var(--bg-tertiary)" stroke="var(--accent-color)" strokeWidth="2" transform="rotate(45 129 140)" />
      
      {/* Magnifying glass lens/ring */}
      <circle cx="110" cy="110" r="35" fill="none" stroke="var(--accent-color)" strokeWidth="3" />
      <circle cx="110" cy="110" r="32" fill="var(--bg-primary)" opacity="0.3" />
      
      {/* Magnifying glass reflection */}
      <ellipse cx="105" cy="105" rx="8" ry="12" fill="white" opacity="0.2" />
      
      {/* Treasure map/scroll inside magnifying glass */}
      <g transform="translate(85, 90)">
        {/* Scroll/paper */}
        <rect x="0" y="0" width="50" height="40" rx="2" fill="var(--bg-secondary)" stroke="var(--accent-color)" strokeWidth="1.5" opacity="0.8" />
        
        {/* Map lines/paths */}
        <path d="M 10 10 L 40 15 L 35 30 L 15 25 Z" stroke="var(--accent-color)" strokeWidth="1.5" fill="none" opacity="0.6" />
        <circle cx="12" cy="12" r="2" fill="var(--accent-color)" opacity="0.8" />
        <circle cx="38" cy="17" r="2" fill="var(--gold-color)" opacity="0.8" />
        
        {/* X mark (treasure location) */}
        <g transform="translate(35, 30)">
          <line x1="-4" y1="-4" x2="4" y2="4" stroke="var(--gold-color)" strokeWidth="2" />
          <line x1="4" y1="-4" x2="-4" y2="4" stroke="var(--gold-color)" strokeWidth="2" />
        </g>
      </g>
      
      {/* Question marks floating around */}
      <g opacity="0.4" fill="var(--text-muted)">
        <text x="60" y="80" fontSize="24" fontFamily="system-ui" fontWeight="bold">?</text>
        <text x="140" y="75" fontSize="20" fontFamily="system-ui" fontWeight="bold">?</text>
        <text x="70" y="150" fontSize="18" fontFamily="system-ui" fontWeight="bold">?</text>
      </g>
      
      {/* Subtle particles */}
      <g opacity="0.3">
        <circle cx="50" cy="60" r="2" fill="var(--accent-color)" />
        <circle cx="150" cy="55" r="2.5" fill="var(--gold-color)" />
        <circle cx="55" cy="140" r="2" fill="var(--accent-color)" />
        <circle cx="145" cy="145" r="2" fill="var(--gold-color)" />
      </g>
      
      {/* Gradients */}
      <defs>
        <radialGradient id="glow-gradient" cx="100" cy="100">
          <stop offset="0%" stopColor="var(--accent-color)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  )
}


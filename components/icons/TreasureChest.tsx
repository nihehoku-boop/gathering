/**
 * Custom Treasure Chest Icon for Colletro
 * Represents the "trove" concept - a place where valuable collections are stored
 */
export default function TreasureChest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Chest body */}
      <rect x="3" y="10" width="18" height="10" rx="2" />
      {/* Chest lid */}
      <path d="M3 10 L12 6 L21 10" />
      {/* Lock/keyhole */}
      <circle cx="12" cy="15" r="1.5" />
      <line x1="12" y1="15" x2="12" y2="13" />
      {/* Decorative lines */}
      <line x1="7" y1="10" x2="7" y2="20" />
      <line x1="17" y1="10" x2="17" y2="20" />
    </svg>
  )
}


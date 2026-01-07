/**
 * Logo Icon Component - Uses the open treasure chest image
 * Replaces the SVG TreasureChest icon with the new image asset
 */

import Image from 'next/image'

interface LogoIconProps {
  className?: string
  width?: number
  height?: number
  showBeta?: boolean
}

export default function LogoIcon({ className = '', width, height, showBeta = true }: LogoIconProps) {
  // Extract width/height from className if provided, otherwise use props or defaults
  const iconWidth = width || 24
  const iconHeight = height || 24

  // Calculate beta badge size based on logo size
  const badgeSize = Math.max(12, Math.min(iconWidth * 0.3, 20))
  const badgeFontSize = Math.max(8, Math.min(badgeSize * 0.7, 12))

  return (
    <div className={`inline-block relative ${className}`} style={{ width: iconWidth, height: iconHeight }}>
      <Image
        src="/logo-icon.png" // Path to the treasure chest image - update to .svg if you have SVG version
        alt="Colletro Logo"
        width={iconWidth}
        height={iconHeight}
        className="w-full h-full object-contain"
        priority
      />
      {showBeta && (
        <span
          className="absolute top-0 right-0 px-1 py-0.5 text-[var(--accent-color)] bg-[var(--bg-primary)] border border-[var(--accent-color)] rounded font-semibold uppercase leading-none transform translate-x-1/4 -translate-y-1/4 shadow-sm"
          style={{
            fontSize: `${badgeFontSize}px`,
            minWidth: `${badgeSize}px`,
            height: `${badgeSize}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          β
        </span>
      )}
    </div>
  )
}

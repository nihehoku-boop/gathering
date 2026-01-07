/**
 * Logo Icon Component - Uses the open treasure chest image
 * Replaces the SVG TreasureChest icon with the new image asset
 */

import Image from 'next/image'

interface LogoIconProps {
  className?: string
  width?: number
  height?: number
}

export default function LogoIcon({ className = '', width, height }: LogoIconProps) {
  // Extract width/height from className if provided, otherwise use props or defaults
  const iconWidth = width || 24
  const iconHeight = height || 24

  return (
    <div className={`inline-block ${className}`} style={{ width: iconWidth, height: iconHeight }}>
      <Image
        src="/logo-icon.png" // Path to the treasure chest image - update to .svg if you have SVG version
        alt="Colletro Logo"
        width={iconWidth}
        height={iconHeight}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  )
}

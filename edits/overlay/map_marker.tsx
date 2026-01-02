// MAP MARKER - location pin animation
// for showing where something happened

import React from 'react'
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion'

interface MapMarkerProps {
  location: string
  x?: number
  y?: number
  color?: string
  durationInFrames: number
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  location,
  x = 50,
  y = 50,
  color = '#ef4444',
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const bounce = spring({
    fps,
    frame,
    config: { damping: 8, stiffness: 100 },
    durationInFrames: 20
  })
  
  const drop = interpolate(bounce, [0, 1], [-50, 0])
  const pulse = 1 + Math.sin(frame * 0.15) * 0.1

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, calc(-100% + ${drop}px))`,
        }}
      >
        {/* pin */}
        <svg width="48" height="64" viewBox="0 0 24 32">
          <path
            d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"
            fill={color}
          />
          <circle cx="12" cy="12" r="5" fill="#ffffff" />
        </svg>
        {/* pulse ring */}
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: `translate(-50%, 0) scale(${pulse})`,
            width: 30,
            height: 10,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.3
          }}
        />
        {/* label */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}
        >
          {location}
        </div>
      </div>
    </AbsoluteFill>
  )
}

export default MapMarker


// COLOR GRADE - color grading overlay
// adds mood and atmosphere to the video

import React from 'react'
import { AbsoluteFill } from 'remotion'

interface ColorGradeProps {
  preset?: 'warm' | 'cold' | 'cinematic' | 'vintage' | 'dramatic'
  intensity?: number
  durationInFrames: number
}

const presets: Record<string, string> = {
  warm: 'sepia(20%) saturate(110%) brightness(105%)',
  cold: 'saturate(90%) hue-rotate(10deg) brightness(100%)',
  cinematic: 'contrast(110%) saturate(90%) brightness(95%)',
  vintage: 'sepia(30%) contrast(105%) brightness(95%)',
  dramatic: 'contrast(120%) saturate(85%) brightness(90%)'
}

export const ColorGrade: React.FC<ColorGradeProps> = ({
  preset = 'cinematic',
  intensity = 1,
  durationInFrames
}) => {
  const filter = presets[preset] || presets.cinematic

  return (
    <AbsoluteFill
      style={{
        filter,
        opacity: intensity,
        mixBlendMode: 'color'
      }}
    />
  )
}

export default ColorGrade


// CLAUDE SERVICE - generates edit manifests
// NOW WITH HARD-CODED EDIT DENSITY - no more weak 17 edit BS
// MrBeast = 40 edits/min, TikTok = 55 edits/min etc.

import Anthropic from '@anthropic-ai/sdk'
import { EditManifest, Scene, EditInstance } from '../types/manifest'

// HARD-CODED EDIT DENSITY - edits per minute for each mode
// this is the REAL number of hits that should happen
export const VIDEO_MODES: Record<string, {
  name: string
  description: string
  editsPerMinute: number  // HARD CODED - this many edits per minute NO EXCEPTIONS
  icon: string
  preferredEdits: string[]
}> = {
  mrbeast: {
    name: 'MrBeast',
    description: 'High energy with SFX',
    editsPerMinute: 40,  // 40 HITS PER MINUTE
    icon: '💰',
    preferredEdits: ['zoom_pulse', 'shake', 'flash_transition', 'sound_hit', 'text_reveal', 'mrbeast_energy']
  },
  lemmino: {
    name: 'LEMMiNO',
    description: 'Smooth documentary',
    editsPerMinute: 20,
    icon: '🎬',
    preferredEdits: ['ken_burns', 'lemmino_cinematic', 'vignette', 'color_grade', 'text_reveal']
  },
  tiktok: {
    name: 'TikTok',
    description: 'Rapid fire edits',
    editsPerMinute: 55,  // 55 HITS PER MINUTE - insane
    icon: '📱',
    preferredEdits: ['tiktok_rapid', 'zoom_pulse', 'glitch', 'flash_transition', 'subtitle']
  },
  documentary: {
    name: 'Documentary',
    description: 'Classic B-roll',
    editsPerMinute: 15,
    icon: '🎥',
    preferredEdits: ['documentary_broll', 'ken_burns', 'lower_third', 'color_grade', 'vignette']
  },
  tutorial: {
    name: 'Tutorial',
    description: 'Educational',
    editsPerMinute: 12,
    icon: '📚',
    preferredEdits: ['tutorial_highlight', 'highlight', 'counter', 'progress_bar', 'subtitle']
  },
  vox: {
    name: 'Vox Explainer',
    description: 'Animated text',
    editsPerMinute: 25,
    icon: '📊',
    preferredEdits: ['vox_animated', 'typewriter', 'text_reveal', 'counter', 'ken_burns']
  },
  truecrime: {
    name: 'True Crime',
    description: 'Dark & dramatic',
    editsPerMinute: 18,
    icon: '🔍',
    preferredEdits: ['truecrime_dramatic', 'vignette', 'color_grade', 'text_reveal', 'letterbox']
  },
  gaming: {
    name: 'Gaming',
    description: 'Fast montage',
    editsPerMinute: 50,  // 50 HITS PER MINUTE
    icon: '🎮',
    preferredEdits: ['gaming_montage', 'shake', 'glitch', 'zoom_pulse', 'chromatic_aberration']
  },
  podcast: {
    name: 'Podcast',
    description: 'Minimal edits',
    editsPerMinute: 8,
    icon: '🎙️',
    preferredEdits: ['podcast_minimal', 'lower_third', 'subtitle', 'ken_burns']
  },
  aesthetic: {
    name: 'Aesthetic',
    description: 'Chill vibes',
    editsPerMinute: 10,
    icon: '✨',
    preferredEdits: ['aesthetic_chill', 'ken_burns', 'color_grade', 'blur', 'vignette']
  }
}

// Generate manifest - HARD CODED edit counts
export async function generateEditManifest(
  apiKey: string,
  transcript: any,
  mode: string,
  sourceVideo: string,
  assets?: { images: string[], audio: string[], videos: string[] }
): Promise<EditManifest> {
  console.log('[manifest] generating for mode:', mode)
  
  const modeConfig = VIDEO_MODES[mode] || VIDEO_MODES.documentary
  const duration = transcript.duration || 60
  
  // HARD CODED: Calculate exact number of edits needed
  const totalEdits = Math.ceil((duration / 60) * modeConfig.editsPerMinute)
  console.log(`[manifest] HARD CODED: ${totalEdits} edits for ${Math.round(duration)}s video (${modeConfig.editsPerMinute}/min)`)
  
  // Generate manifest with EXACT edit count
  const manifest = generateHardCodedManifest(
    transcript,
    mode,
    sourceVideo,
    duration,
    modeConfig,
    totalEdits
  )
  
  console.log('[manifest] created', manifest.scenes.length, 'scenes with', 
    manifest.scenes.reduce((sum, s) => sum + s.edits.length, 0), 'total edits')
  
  return manifest
}

// HARD CODED manifest generator - fills entire timeline with edits
function generateHardCodedManifest(
  transcript: any,
  mode: string,
  sourceVideo: string,
  duration: number,
  modeConfig: typeof VIDEO_MODES[string],
  totalEdits: number
): EditManifest {
  const scenes: Scene[] = []
  const edits = modeConfig.preferredEdits
  
  // Calculate exact interval between edits
  const editInterval = duration / totalEdits
  console.log(`[manifest] edit interval: ${editInterval.toFixed(2)}s between each edit`)
  
  // Create scenes every 5 seconds for better organization
  const sceneLength = 5
  const numScenes = Math.ceil(duration / sceneLength)
  
  for (let i = 0; i < numScenes; i++) {
    const sceneStart = i * sceneLength
    const sceneEnd = Math.min((i + 1) * sceneLength, duration)
    
    // Find transcript text for this scene
    const segmentTexts = (transcript.segments || [])
      .filter((s: any) => s.start >= sceneStart && s.start < sceneEnd)
      .map((s: any) => s.text)
      .join(' ')
    
    const sceneEdits: EditInstance[] = []
    
    // Calculate how many edits belong in this scene
    const editsInScene = Math.ceil((sceneEnd - sceneStart) / editInterval)
    
    for (let j = 0; j < editsInScene; j++) {
      const editTime = sceneStart + (j * editInterval) + (Math.random() * editInterval * 0.5)
      if (editTime >= sceneEnd) break
      
      // Pick random edit from preferred list
      const editId = edits[Math.floor(Math.random() * edits.length)]
      
      // Vary duration based on mode
      const minDur = mode === 'mrbeast' || mode === 'tiktok' || mode === 'gaming' ? 0.3 : 0.8
      const maxDur = mode === 'mrbeast' || mode === 'tiktok' || mode === 'gaming' ? 1.5 : 3
      
      sceneEdits.push({
        editId,
        at: editTime,
        duration: minDur + Math.random() * (maxDur - minDur),
        props: getRandomProps(editId, mode),
        layer: (j % 3) + 1  // cycle through layers
      })
    }
    
    scenes.push({
      start: sceneStart,
      end: sceneEnd,
      text: segmentTexts || '',
      edits: sceneEdits
    })
  }
  
  return {
    mode,
    duration,
    fps: 30,
    width: 1920,
    height: 1080,
    sourceVideo,
    scenes
  }
}

// Get random props based on edit type
function getRandomProps(editId: string, mode: string): Record<string, any> {
  const props: Record<string, any> = {}
  
  switch (editId) {
    case 'zoom_pulse':
    case 'mrbeast_energy':
      props.intensity = 0.8 + Math.random() * 0.6
      props.zoomPeak = 1.2 + Math.random() * 0.3
      break
    case 'shake':
      props.intensity = mode === 'gaming' ? 1.5 : 1
      props.frequency = 10 + Math.random() * 10
      break
    case 'flash_transition':
      props.color = ['#ffffff', '#ff0000', '#00ff00'][Math.floor(Math.random() * 3)]
      break
    case 'ken_burns':
    case 'lemmino_cinematic':
      props.zoomDirection = Math.random() > 0.5 ? 'in' : 'out'
      props.zoomTarget = 1.1 + Math.random() * 0.1
      break
    case 'glitch':
    case 'gaming_montage':
      props.effectType = ['rgb', 'glitch', 'speed'][Math.floor(Math.random() * 3)]
      props.intensity = 1 + Math.random() * 0.5
      break
    case 'tiktok_rapid':
      props.cutType = ['zoom', 'pan', 'flash'][Math.floor(Math.random() * 3)]
      props.speed = 1.5 + Math.random()
      break
    case 'vignette':
    case 'truecrime_dramatic':
      props.intensity = 0.6 + Math.random() * 0.4
      break
    case 'color_grade':
      props.temperature = -20 + Math.random() * 40
      props.contrast = 1 + Math.random() * 0.3
      break
  }
  
  return props
}

export default { generateEditManifest, VIDEO_MODES }

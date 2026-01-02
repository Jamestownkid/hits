// CLAUDE SERVICE - generates edit manifests
// SIMPLIFIED to avoid JSON truncation errors

import Anthropic from '@anthropic-ai/sdk'
import { EditManifest, Scene, EditInstance } from '../types/manifest'

// 10 video styles with edit configs
export const VIDEO_MODES: Record<string, {
  name: string
  description: string
  editFrequency: number
  preferredEdits: string[]
}> = {
  mrbeast: {
    name: 'MrBeast',
    description: 'High energy with SFX',
    editFrequency: 3,
    preferredEdits: ['zoom_pulse', 'shake', 'text_reveal', 'flash_transition', 'sound_hit']
  },
  lemmino: {
    name: 'Lemmino',
    description: 'Smooth documentary',
    editFrequency: 8,
    preferredEdits: ['ken_burns', 'text_reveal', 'color_grade', 'vignette']
  },
  tiktok: {
    name: 'TikTok',
    description: 'Rapid fire edits',
    editFrequency: 2,
    preferredEdits: ['zoom_pulse', 'glitch', 'subtitle', 'flash_transition']
  },
  documentary: {
    name: 'Documentary',
    description: 'Classic B-roll',
    editFrequency: 10,
    preferredEdits: ['ken_burns', 'lower_third', 'color_grade']
  },
  tutorial: {
    name: 'Tutorial',
    description: 'Educational',
    editFrequency: 12,
    preferredEdits: ['highlight', 'counter', 'progress_bar', 'subtitle']
  },
  vox: {
    name: 'Vox Explainer',
    description: 'Animated text',
    editFrequency: 6,
    preferredEdits: ['typewriter', 'text_reveal', 'counter', 'ken_burns']
  },
  truecrime: {
    name: 'True Crime',
    description: 'Dark dramatic',
    editFrequency: 7,
    preferredEdits: ['vignette', 'color_grade', 'text_reveal', 'letterbox']
  },
  gaming: {
    name: 'Gaming',
    description: 'Fast montage',
    editFrequency: 2,
    preferredEdits: ['shake', 'glitch', 'zoom_pulse', 'chromatic_aberration']
  },
  podcast: {
    name: 'Podcast',
    description: 'Minimal edits',
    editFrequency: 15,
    preferredEdits: ['lower_third', 'subtitle', 'ken_burns']
  },
  aesthetic: {
    name: 'Aesthetic',
    description: 'Chill vibes',
    editFrequency: 10,
    preferredEdits: ['ken_burns', 'color_grade', 'blur', 'vignette']
  }
}

// Generate manifest - uses local generator with optional Claude enhancement
export async function generateEditManifest(
  apiKey: string,
  transcript: any,
  mode: string,
  sourceVideo: string,
  assets?: { images: string[], audio: string[], videos: string[] }
): Promise<EditManifest> {
  console.log('[manifest] generating for mode:', mode)
  
  const modeConfig = VIDEO_MODES[mode] || VIDEO_MODES.documentary
  const duration = Math.min(transcript.duration || 60, 120)
  
  // Always use local generator first - it's reliable
  const manifest = generateLocalManifest(transcript, mode, sourceVideo, duration, modeConfig)
  
  // Optionally enhance with Claude if API key provided
  if (apiKey && apiKey.length > 20) {
    try {
      const enhanced = await enhanceWithClaude(apiKey, manifest, transcript)
      if (enhanced) {
        console.log('[manifest] enhanced with Claude')
        return enhanced
      }
    } catch (err) {
      console.warn('[manifest] Claude enhancement failed, using local:', err)
    }
  }
  
  console.log('[manifest] using local generator, scenes:', manifest.scenes.length)
  return manifest
}

// Local manifest generator - ALWAYS works
function generateLocalManifest(
  transcript: any,
  mode: string,
  sourceVideo: string,
  duration: number,
  modeConfig: typeof VIDEO_MODES[string]
): EditManifest {
  const scenes: Scene[] = []
  const interval = modeConfig.editFrequency
  const edits = modeConfig.preferredEdits
  
  // Create scenes from transcript segments
  let currentScene: Scene | null = null
  let lastSceneStart = 0
  
  for (const seg of (transcript.segments || [])) {
    if (seg.start > duration) break
    
    // Start new scene every ~10 seconds
    if (!currentScene || seg.start - lastSceneStart > 10) {
      if (currentScene) scenes.push(currentScene)
      lastSceneStart = seg.start
      
      currentScene = {
        start: seg.start,
        end: seg.end,
        text: seg.text,
        edits: []
      }
      
      // Add edit at scene start
      const editId = edits[Math.floor(Math.random() * edits.length)]
      currentScene.edits.push({
        editId,
        at: seg.start,
        duration: 1 + Math.random() * 2,
        props: {},
        layer: 1
      })
    } else {
      currentScene.end = seg.end
      currentScene.text += ' ' + seg.text
    }
    
    // Add edits at intervals
    if (currentScene.edits.length < 3) {
      const timeSinceLastEdit = seg.start - (currentScene.edits[currentScene.edits.length - 1]?.at || 0)
      if (timeSinceLastEdit >= interval) {
        const editId = edits[Math.floor(Math.random() * edits.length)]
        currentScene.edits.push({
          editId,
          at: seg.start,
          duration: 1 + Math.random(),
          props: {},
          layer: currentScene.edits.length
        })
      }
    }
  }
  
  if (currentScene) scenes.push(currentScene)
  
  // If no segments, create basic scenes
  if (scenes.length === 0) {
    for (let t = 0; t < duration; t += 10) {
      scenes.push({
        start: t,
        end: Math.min(t + 10, duration),
        text: '',
        edits: [{
          editId: edits[Math.floor(Math.random() * edits.length)],
          at: t + 2,
          duration: 2,
          props: {},
          layer: 1
        }]
      })
    }
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

// Optional Claude enhancement - keeps it simple
async function enhanceWithClaude(
  apiKey: string,
  manifest: EditManifest,
  transcript: any
): Promise<EditManifest | null> {
  try {
    const client = new Anthropic({ apiKey })
    
    // Very simple prompt
    const prompt = `Video has ${manifest.scenes.length} scenes. Mode: ${manifest.mode}.
Current edit count: ${manifest.scenes.reduce((sum, s) => sum + s.edits.length, 0)}.
Should I add more edits? Reply with just "yes" or "no" and optionally suggest 1-3 timestamps like "yes: 15s, 32s, 48s"`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0]
    if (text.type !== 'text') return null
    
    console.log('[claude] suggestion:', text.text)
    
    // Parse any suggested timestamps and add edits
    const timeMatches = text.text.match(/(\d+)s/g)
    if (timeMatches) {
      const modeConfig = VIDEO_MODES[manifest.mode] || VIDEO_MODES.documentary
      for (const match of timeMatches) {
        const time = parseInt(match)
        // Find the scene for this time
        const scene = manifest.scenes.find(s => time >= s.start && time < s.end)
        if (scene && scene.edits.length < 5) {
          scene.edits.push({
            editId: modeConfig.preferredEdits[Math.floor(Math.random() * modeConfig.preferredEdits.length)],
            at: time,
            duration: 1.5,
            props: {},
            layer: scene.edits.length + 1
          })
        }
      }
    }
    
    return manifest
  } catch (err) {
    console.warn('[claude] enhancement error:', err)
    return null
  }
}

export default { generateEditManifest, VIDEO_MODES }

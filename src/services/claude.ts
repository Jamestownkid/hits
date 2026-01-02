// CLAUDE SERVICE - generates edit manifests from transcripts
// this is the "King Kong" - connecting words to edits

import Anthropic from '@anthropic-ai/sdk'
import { EditManifest, Scene, EditInstance } from '../types/manifest'

// 10 video styles with their edit configurations
export const VIDEO_MODES: Record<string, {
  name: string
  description: string
  editFrequency: number  // seconds between edits
  overlayDuration: number  // how long overlays show
  brollMaxDuration: number  // max broll clip length (to avoid copyright)
  preferredEdits: string[]  // which edits to use most
  keywordTriggers: string[]  // words that trigger overlays
}> = {
  lemmino: {
    name: 'Lemmino / Documentary',
    description: 'Clean, cinematic with text reveals and subtle motion',
    editFrequency: 8,
    overlayDuration: 3,
    brollMaxDuration: 4,
    preferredEdits: ['ken_burns', 'text_reveal', 'color_grade', 'vignette', 'letterbox'],
    keywordTriggers: ['mystery', 'unknown', 'discovered', 'evidence', 'theory', 'investigation']
  },
  mrbeast: {
    name: 'MrBeast / High Energy',
    description: 'Fast cuts, zooms, shakes, lots of text pop-ups',
    editFrequency: 3,
    overlayDuration: 1.5,
    brollMaxDuration: 2,
    preferredEdits: ['zoom_pulse', 'shake', 'text_reveal', 'flash_transition', 'counter', 'sound_hit'],
    keywordTriggers: ['million', 'crazy', 'insane', 'wow', 'money', 'win', 'lose', 'challenge']
  },
  tiktok: {
    name: 'TikTok / Vertical Short',
    description: 'Quick cuts, captions, trendy effects',
    editFrequency: 2,
    overlayDuration: 1,
    brollMaxDuration: 2,
    preferredEdits: ['subtitle', 'zoom_pulse', 'glitch', 'flash_transition', 'chromatic_aberration'],
    keywordTriggers: ['like', 'follow', 'viral', 'trending', 'fyp', 'crazy']
  },
  documentary: {
    name: 'Documentary / Educational',
    description: 'Informative with lower thirds, maps, diagrams',
    editFrequency: 10,
    overlayDuration: 4,
    brollMaxDuration: 5,
    preferredEdits: ['lower_third', 'ken_burns', 'map_marker', 'text_reveal', 'color_grade'],
    keywordTriggers: ['research', 'study', 'found', 'percent', 'data', 'scientist', 'year']
  },
  tutorial: {
    name: 'Tutorial / How-To',
    description: 'Step markers, highlights, progress bars',
    editFrequency: 15,
    overlayDuration: 5,
    brollMaxDuration: 3,
    preferredEdits: ['highlight', 'counter', 'progress_bar', 'lower_third', 'subtitle'],
    keywordTriggers: ['step', 'first', 'next', 'then', 'click', 'select', 'open', 'install']
  },
  vox: {
    name: 'Vox Explainer',
    description: 'Animated text, charts, clean graphics',
    editFrequency: 6,
    overlayDuration: 3,
    brollMaxDuration: 4,
    preferredEdits: ['typewriter', 'text_reveal', 'counter', 'progress_bar', 'ken_burns'],
    keywordTriggers: ['why', 'how', 'because', 'actually', 'means', 'important', 'problem']
  },
  truecrime: {
    name: 'True Crime',
    description: 'Dark mood, dramatic reveals, timeline markers',
    editFrequency: 7,
    overlayDuration: 3,
    brollMaxDuration: 4,
    preferredEdits: ['vignette', 'color_grade', 'text_reveal', 'map_marker', 'letterbox', 'bass_drop'],
    keywordTriggers: ['murder', 'victim', 'suspect', 'police', 'evidence', 'night', 'found', 'disappeared']
  },
  gaming: {
    name: 'Gaming / Montage',
    description: 'Fast edits, screen shake, glitch effects, sound hits',
    editFrequency: 2,
    overlayDuration: 1,
    brollMaxDuration: 2,
    preferredEdits: ['shake', 'glitch', 'zoom_pulse', 'flash_transition', 'sound_hit', 'chromatic_aberration'],
    keywordTriggers: ['kill', 'win', 'clutch', 'insane', 'play', 'shot', 'headshot', 'victory']
  },
  podcast: {
    name: 'Podcast / Interview',
    description: 'Minimal edits, lower thirds for speakers, subtle',
    editFrequency: 20,
    overlayDuration: 4,
    brollMaxDuration: 5,
    preferredEdits: ['lower_third', 'subtitle', 'ken_burns', 'color_grade'],
    keywordTriggers: ['think', 'believe', 'interesting', 'point', 'agree', 'question']
  },
  aesthetic: {
    name: 'Aesthetic / ASMR / Chill',
    description: 'Slow, smooth transitions, color grading, vibes',
    editFrequency: 12,
    overlayDuration: 4,
    brollMaxDuration: 5,
    preferredEdits: ['ken_burns', 'color_grade', 'blur', 'vignette', 'wipe'],
    keywordTriggers: ['beautiful', 'peaceful', 'calm', 'relaxing', 'smooth', 'soft']
  }
}

// Generate edit manifest using Claude
export async function generateEditManifest(
  apiKey: string,
  transcript: any,
  mode: string,
  sourceVideo: string,
  assets?: { images: string[], audio: string[], videos: string[] }
): Promise<EditManifest> {
  const client = new Anthropic({ apiKey })
  
  const modeConfig = VIDEO_MODES[mode] || VIDEO_MODES.documentary
  
  // Build a simplified transcript summary to avoid token limits
  const transcriptSummary = transcript.segments.slice(0, 50).map((seg: any) => ({
    start: Math.round(seg.start * 10) / 10,
    end: Math.round(seg.end * 10) / 10,
    text: seg.text.substring(0, 100)
  }))

  const prompt = `You are a video editor AI. Generate an edit manifest for a "${modeConfig.name}" style video.

VIDEO DURATION: ${Math.round(transcript.duration)} seconds
STYLE: ${modeConfig.description}
EDIT FREQUENCY: Every ${modeConfig.editFrequency} seconds approximately

AVAILABLE EDITS: ${modeConfig.preferredEdits.join(', ')}

TRANSCRIPT (first 50 segments):
${JSON.stringify(transcriptSummary, null, 2)}

${assets?.videos?.length ? `AVAILABLE B-ROLL: ${assets.videos.slice(0, 10).join(', ')}` : ''}
${assets?.audio?.length ? `AVAILABLE SFX: ${assets.audio.slice(0, 10).join(', ')}` : ''}

IMPORTANT RULES:
1. B-roll clips should be MAX ${modeConfig.brollMaxDuration} seconds (copyright safety)
2. Overlays should last about ${modeConfig.overlayDuration} seconds
3. Add edits every ~${modeConfig.editFrequency} seconds
4. Match edits to transcript content (e.g., "money" → counter animation)
5. Keep response SHORT - only first 60 seconds of edits

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "mode": "${mode}",
  "duration": ${Math.min(transcript.duration, 60)},
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "sourceVideo": "${sourceVideo}",
  "scenes": [
    {
      "start": 0,
      "end": 10,
      "text": "transcript text here",
      "edits": [
        {"editId": "zoom_pulse", "at": 2, "duration": 1, "props": {}, "layer": 1}
      ]
    }
  ]
}`

  console.log('[claude] sending request...')
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,  // reduced to prevent truncation
    messages: [{ role: 'user', content: prompt }]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Claude returned non-text response')
  }

  console.log('[claude] got response, length:', content.text.length)

  // Clean the response - remove any markdown or extra text
  let jsonText = content.text.trim()
  
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
  }
  
  // Find JSON object boundaries
  const jsonStart = jsonText.indexOf('{')
  const jsonEnd = jsonText.lastIndexOf('}')
  
  if (jsonStart === -1 || jsonEnd === -1) {
    console.error('[claude] no valid JSON found in response:', jsonText.substring(0, 200))
    throw new Error('Claude did not return valid JSON')
  }
  
  jsonText = jsonText.substring(jsonStart, jsonEnd + 1)
  
  // Try to parse, with fallback
  try {
    const manifest = JSON.parse(jsonText) as EditManifest
    console.log('[claude] parsed manifest:', manifest.scenes?.length, 'scenes')
    return manifest
  } catch (parseErr) {
    console.error('[claude] JSON parse failed:', parseErr)
    console.error('[claude] raw response:', jsonText.substring(0, 500))
    
    // Return a basic fallback manifest
    return createFallbackManifest(transcript, mode, sourceVideo, modeConfig)
  }
}

// Create a fallback manifest when Claude fails
function createFallbackManifest(
  transcript: any,
  mode: string,
  sourceVideo: string,
  modeConfig: typeof VIDEO_MODES[string]
): EditManifest {
  console.log('[claude] using fallback manifest generator')
  
  const duration = Math.min(transcript.duration, 120)
  const scenes: Scene[] = []
  
  // Create scenes based on transcript segments
  let currentScene: Scene | null = null
  let sceneStart = 0
  
  for (const seg of transcript.segments) {
    if (seg.start > duration) break
    
    // Start new scene every ~10 seconds
    if (!currentScene || seg.start - sceneStart > 10) {
      if (currentScene) scenes.push(currentScene)
      sceneStart = seg.start
      currentScene = {
        start: seg.start,
        end: seg.end,
        text: seg.text,
        edits: []
      }
      
      // Add an edit at the start of each scene
      const editId = modeConfig.preferredEdits[Math.floor(Math.random() * modeConfig.preferredEdits.length)]
      currentScene.edits.push({
        editId,
        at: seg.start,
        duration: modeConfig.overlayDuration,
        props: {},
        layer: 1
      })
    } else {
      currentScene.end = seg.end
      currentScene.text += ' ' + seg.text
    }
    
    // Check for keyword triggers
    const textLower = seg.text.toLowerCase()
    for (const trigger of modeConfig.keywordTriggers) {
      if (textLower.includes(trigger) && currentScene.edits.length < 3) {
        currentScene.edits.push({
          editId: 'text_reveal',
          at: seg.start,
          duration: 2,
          props: { text: trigger.toUpperCase() },
          layer: 2
        })
        break
      }
    }
  }
  
  if (currentScene) scenes.push(currentScene)
  
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

export default { generateEditManifest, VIDEO_MODES }

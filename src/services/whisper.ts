// WHISPER SERVICE - transcribes video/audio files
// uses the system whisper CLI (pip install openai-whisper)

import * as fs from 'fs'
import * as path from 'path'
import { spawn } from 'child_process'
import { app } from 'electron'

export interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
  words: { word: string; start: number; end: number }[]
}

export interface TranscriptResult {
  segments: TranscriptSegment[]
  text: string
  language: string
  duration: number
}

export interface WhisperModel {
  name: string
  size: string
  downloaded: boolean
}

// available models - we use the system whisper so "downloaded" is always true
const WHISPER_MODELS = ['tiny', 'base', 'small', 'medium', 'large']

export function listModels(): WhisperModel[] {
  const sizes: Record<string, string> = {
    'tiny': '75 MB (fast)', 'base': '142 MB', 'small': '466 MB (recommended)',
    'medium': '1.5 GB', 'large': '3.1 GB (slow)'
  }
  return WHISPER_MODELS.map(name => ({
    name,
    size: sizes[name] || '?',
    downloaded: true  // system whisper downloads on demand
  }))
}

export function isModelDownloaded(_model: string): boolean {
  return true  // system whisper handles this
}

export async function downloadModel(model: string): Promise<string> {
  return model  // no-op, whisper downloads on first use
}

export class WhisperService {
  private model: string = 'small'

  constructor(model?: string) {
    if (model) this.model = model
  }

  setModel(model: string) {
    this.model = model
    console.log('[whisper] model set to:', model)
  }

  async transcribe(
    filePath: string,
    onProgress?: (stage: string) => void,
    _openaiKey?: string
  ): Promise<TranscriptResult> {
    console.log('[whisper] starting:', filePath)
    console.log('[whisper] model:', this.model)
    
    onProgress?.('transcribing...')

    const outputDir = path.dirname(filePath)
    const baseName = path.basename(filePath, path.extname(filePath))
    const jsonPath = path.join(outputDir, baseName + '.json')

    // delete old output if exists
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath)
    }

    return new Promise((resolve, reject) => {
      const args = [
        filePath,
        '--model', this.model === 'large-v3' ? 'large' : this.model,
        '--output_dir', outputDir,
        '--output_format', 'json',
        '--language', 'en'
      ]

      console.log('[whisper] command: whisper', args.join(' '))
      onProgress?.(`running whisper (${this.model} model)...`)

      const proc = spawn('whisper', args, {
        env: { ...process.env, CUDA_VISIBLE_DEVICES: '0' }
      })

      let lastLine = ''

      // whisper outputs progress to stderr
      proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n')
        for (const line of lines) {
          if (line.trim()) {
            lastLine = line.trim()
            // extract timestamp from progress lines like "[00:00.000 --> 00:05.000]  text"
            const match = line.match(/\[(\d{2}:\d{2}\.\d{3})/)
            if (match) {
              onProgress?.(`transcribing: ${match[1]}`)
            }
            console.log('[whisper]', line)
          }
        }
      })

      proc.stdout.on('data', (data) => {
        console.log('[whisper]', data.toString())
      })

      proc.on('error', (err) => {
        console.error('[whisper] spawn error:', err)
        reject(new Error('whisper not found. Install with: pip install openai-whisper'))
      })

      proc.on('close', (code) => {
        console.log('[whisper] process closed with code:', code)
        
        // check if output file was created (this is the real success indicator)
        if (fs.existsSync(jsonPath)) {
          try {
            const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
            const result = this.parseWhisperJson(json)
            console.log('[whisper] success:', result.segments.length, 'segments,', result.duration, 'seconds')
            onProgress?.('done!')
            resolve(result)
          } catch (err) {
            console.error('[whisper] failed to parse output:', err)
            reject(new Error('Failed to parse whisper output'))
          }
        } else {
          console.error('[whisper] no output file created, last output:', lastLine)
          reject(new Error(`Whisper failed: ${lastLine || 'unknown error'}`))
        }
      })
    })
  }

  private parseWhisperJson(json: any): TranscriptResult {
    const segments: TranscriptSegment[] = []
    let fullText = ''
    let maxEnd = 0

    for (let i = 0; i < (json.segments?.length || 0); i++) {
      const seg = json.segments[i]
      segments.push({
        id: i,
        start: seg.start,
        end: seg.end,
        text: (seg.text || '').trim(),
        words: []
      })
      fullText += (seg.text || '').trim() + ' '
      if (seg.end > maxEnd) maxEnd = seg.end
    }

    return {
      segments,
      text: fullText.trim(),
      language: json.language || 'en',
      duration: maxEnd
    }
  }
}

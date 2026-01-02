// WHISPER SERVICE - transcribes your video/audio with word-level timestamps
// this is crucial cause claude needs to know WHEN things are said to place edits

import { nodewhisper } from 'nodejs-whisper'
import * as fs from 'fs'
import * as path from 'path'

// word with timestamp
export interface Word {
  word: string
  start: number
  end: number
}

// a segment of transcript (usually a sentence or phrase)
export interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
  words: Word[]
}

// the full result
export interface TranscriptResult {
  segments: TranscriptSegment[]
  text: string
  language: string
  duration: number
}

// whisper service class
export class WhisperService {
  private model: string = 'large-v3'
  
  constructor(model?: string) {
    if (model) this.model = model
  }

  // transcribe a video or audio file
  // returns word-level timestamps so we can sync edits perfectly
  async transcribe(filePath: string, onProgress?: (stage: string) => void): Promise<TranscriptResult> {
    console.log('[whisper] starting transcription:', filePath)
    console.log('[whisper] using model:', this.model)
    
    onProgress?.('loading model')

    const outputDir = path.dirname(filePath)
    const baseName = path.basename(filePath, path.extname(filePath))

    // run whisper with word timestamps enabled - this is the key
    await nodewhisper(filePath, {
      modelName: this.model,
      autoDownloadModelName: this.model,
      removeWavFileAfterTranscription: false,
      withCuda: true,  // use GPU if available
      whisperOptions: {
        outputInText: false,
        outputInVtt: false,
        outputInSrt: true,
        outputInCsv: false,
        translateToEnglish: false,
        wordTimestamps: true,  // WE NEED THESE for precise edit timing
        language: 'auto',
        splitOnWord: true
      }
    })

    onProgress?.('parsing results')

    // check what output files we got
    const jsonPath = path.join(outputDir, baseName + '.json')
    const srtPath = path.join(outputDir, baseName + '.srt')

    let result: TranscriptResult

    if (fs.existsSync(jsonPath)) {
      // prefer JSON if available - has more detailed timing
      const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
      result = this.parseWhisperJson(json)
    } else if (fs.existsSync(srtPath)) {
      // fall back to SRT
      const srt = fs.readFileSync(srtPath, 'utf-8')
      result = this.parseSrt(srt)
    } else {
      throw new Error('whisper didnt output anything - check if the file is valid')
    }

    console.log('[whisper] done:', result.segments.length, 'segments,', result.duration.toFixed(1), 'seconds')
    return result
  }

  // parse whisper JSON output (has the most detail)
  private parseWhisperJson(json: any): TranscriptResult {
    const segments: TranscriptSegment[] = []
    let fullText = ''
    let maxEnd = 0

    for (let i = 0; i < (json.segments?.length || 0); i++) {
      const seg = json.segments[i]
      
      const segment: TranscriptSegment = {
        id: i,
        start: seg.start,
        end: seg.end,
        text: (seg.text || '').trim(),
        words: (seg.words || []).map((w: any) => ({
          word: w.word,
          start: w.start,
          end: w.end
        }))
      }

      segments.push(segment)
      fullText += segment.text + ' '
      if (seg.end > maxEnd) maxEnd = seg.end
    }

    return {
      segments,
      text: fullText.trim(),
      language: json.language || 'en',
      duration: maxEnd
    }
  }

  // parse SRT format (fallback)
  private parseSrt(srt: string): TranscriptResult {
    const segments: TranscriptSegment[] = []
    const blocks = srt.trim().split(/\n\n+/)
    let fullText = ''
    let maxEnd = 0

    for (const block of blocks) {
      const lines = block.split('\n')
      if (lines.length < 3) continue

      const timeLine = lines[1]
      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
      
      if (!timeMatch) continue

      // convert timestamp to seconds
      const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000
      const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000
      const text = lines.slice(2).join(' ').trim()

      segments.push({
        id: segments.length,
        start,
        end,
        text,
        words: []  // SRT doesnt have word-level timestamps unfortunately
      })

      fullText += text + ' '
      if (end > maxEnd) maxEnd = end
    }

    return {
      segments,
      text: fullText.trim(),
      language: 'en',
      duration: maxEnd
    }
  }
}


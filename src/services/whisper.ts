// WHISPER SERVICE - transcribes your video/audio with word-level timestamps
// supports: OpenAI whisper CLI (python), whisper.cpp, or OpenAI API

import * as fs from 'fs'
import * as path from 'path'
import { spawn, exec } from 'child_process'
import { app } from 'electron'
import https from 'https'

export interface Word {
  word: string
  start: number
  end: number
}

export interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
  words: Word[]
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
  path?: string
}

const WHISPER_MODELS = ['tiny', 'base', 'small', 'medium', 'large-v3']

function getModelsDir(): string {
  const userDataPath = app?.getPath('userData') || path.join(process.env.HOME || '', '.hits')
  const modelsDir = path.join(userDataPath, 'whisper-models')
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true })
  }
  return modelsDir
}

export function isModelDownloaded(model: string): boolean {
  const modelsDir = getModelsDir()
  const modelFile = path.join(modelsDir, `ggml-${model}.bin`)
  return fs.existsSync(modelFile)
}

export function listModels(): WhisperModel[] {
  const modelsDir = getModelsDir()
  const sizes: Record<string, string> = {
    'tiny': '75 MB', 'base': '142 MB', 'small': '466 MB',
    'medium': '1.5 GB', 'large-v3': '3.1 GB'
  }
  return WHISPER_MODELS.map(name => ({
    name,
    size: sizes[name] || 'unknown',
    downloaded: fs.existsSync(path.join(modelsDir, `ggml-${name}.bin`)),
    path: fs.existsSync(path.join(modelsDir, `ggml-${name}.bin`)) 
      ? path.join(modelsDir, `ggml-${name}.bin`) : undefined
  }))
}

function getModelSize(name: string): string {
  const sizes: Record<string, string> = {
    'tiny': '75 MB', 'base': '142 MB', 'small': '466 MB',
    'medium': '1.5 GB', 'large-v3': '3.1 GB'
  }
  return sizes[name] || 'unknown'
}

export async function downloadModel(
  model: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const modelsDir = getModelsDir()
  const modelFile = path.join(modelsDir, `ggml-${model}.bin`)

  if (fs.existsSync(modelFile)) {
    console.log('[whisper] model already exists:', modelFile)
    return modelFile
  }

  const url = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`
  console.log('[whisper] downloading model:', url)

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(modelFile)

    const download = (downloadUrl: string) => {
      https.get(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          download(response.headers.location!)
          return
        }

        const totalSize = parseInt(response.headers['content-length'] || '0', 10)
        let downloaded = 0

        response.on('data', (chunk: Buffer) => {
          downloaded += chunk.length
          if (totalSize > 0 && onProgress) {
            onProgress((downloaded / totalSize) * 100)
          }
        })

        response.pipe(file)

        file.on('finish', () => {
          file.close()
          console.log('[whisper] model downloaded:', modelFile)
          resolve(modelFile)
        })

        file.on('error', (err) => {
          fs.unlinkSync(modelFile)
          reject(err)
        })
      }).on('error', (err) => {
        if (fs.existsSync(modelFile)) fs.unlinkSync(modelFile)
        reject(err)
      })
    }

    download(url)
  })
}

export class WhisperService {
  private model: string = 'small'

  constructor(model?: string) {
    if (model) this.model = model
  }

  setModel(model: string) {
    this.model = model
  }

  // Try OpenAI's whisper CLI (python) - most common on Linux
  async transcribeWithWhisperCLI(filePath: string, onProgress?: (stage: string) => void): Promise<TranscriptResult> {
    onProgress?.('transcribing with whisper')
    
    const outputDir = path.dirname(filePath)
    const baseName = path.basename(filePath, path.extname(filePath))

    return new Promise((resolve, reject) => {
      // OpenAI whisper CLI syntax: whisper <audio> --model <model> --output_dir <dir> --output_format json
      const args = [
        filePath,
        '--model', this.model === 'large-v3' ? 'large' : this.model,
        '--output_dir', outputDir,
        '--output_format', 'json',
        '--language', 'en'
      ]

      console.log('[whisper] running: whisper', args.join(' '))

      const proc = spawn('whisper', args)
      let stderr = ''
      let stdout = ''

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
        console.log('[whisper]', data.toString())
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
        console.log('[whisper]', data.toString())
      })

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`whisper failed (code ${code}): ${stderr}`))
          return
        }

        // whisper outputs to <basename>.json
        const jsonPath = path.join(outputDir, baseName + '.json')

        try {
          if (fs.existsSync(jsonPath)) {
            const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
            resolve(this.parseWhisperJson(json))
          } else {
            reject(new Error('whisper did not create output file'))
          }
        } catch (err) {
          reject(err)
        }
      })

      proc.on('error', (err) => {
        reject(new Error(`whisper not found: ${err.message}. Install with: pip install openai-whisper`))
      })
    })
  }

  // Try whisper.cpp binary
  async transcribeWithWhisperCpp(filePath: string, onProgress?: (stage: string) => void): Promise<TranscriptResult> {
    const modelsDir = getModelsDir()
    const modelFile = path.join(modelsDir, `ggml-${this.model}.bin`)

    if (!fs.existsSync(modelFile)) {
      throw new Error(`Model ${this.model} not downloaded for whisper.cpp`)
    }

    onProgress?.('transcribing with whisper.cpp')

    const outputDir = path.dirname(filePath)
    const baseName = path.basename(filePath, path.extname(filePath))
    const outputFile = path.join(outputDir, baseName)

    // Find whisper.cpp binary
    const whisperCmd = await this.findWhisperCppCommand()
    if (!whisperCmd) {
      throw new Error('whisper.cpp not found')
    }

    return new Promise((resolve, reject) => {
      const args = [
        '-m', modelFile,
        '-f', filePath,
        '-of', outputFile,
        '-oj',
        '-l', 'en'
      ]

      console.log('[whisper] running:', whisperCmd, args.join(' '))

      const proc = spawn(whisperCmd, args)
      let stderr = ''

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
        console.log('[whisper.cpp]', data.toString())
      })

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`whisper.cpp failed: ${stderr}`))
          return
        }

        const jsonPath = outputFile + '.json'
        const srtPath = outputFile + '.srt'

        try {
          if (fs.existsSync(jsonPath)) {
            const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
            resolve(this.parseWhisperJson(json))
          } else if (fs.existsSync(srtPath)) {
            const srt = fs.readFileSync(srtPath, 'utf-8')
            resolve(this.parseSrt(srt))
          } else {
            reject(new Error('no output from whisper.cpp'))
          }
        } catch (err) {
          reject(err)
        }
      })

      proc.on('error', reject)
    })
  }

  // OpenAI Whisper API (most reliable fallback)
  async transcribeOpenAI(filePath: string, apiKey: string, onProgress?: (stage: string) => void): Promise<TranscriptResult> {
    onProgress?.('uploading to OpenAI')

    const FormData = (await import('form-data')).default
    const form = new FormData()

    form.append('file', fs.createReadStream(filePath))
    form.append('model', 'whisper-1')
    form.append('response_format', 'verbose_json')
    form.append('timestamp_granularities[]', 'word')

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.openai.com',
        path: '/v1/audio/transcriptions',
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${apiKey}`
        }
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(json.error.message))
              return
            }
            resolve(this.parseOpenAIResponse(json))
          } catch (err) {
            reject(err)
          }
        })
      })

      req.on('error', reject)
      form.pipe(req)
    })
  }

  // Main transcribe - tries multiple methods
  async transcribe(
    filePath: string,
    onProgress?: (stage: string) => void,
    openaiKey?: string
  ): Promise<TranscriptResult> {
    console.log('[whisper] starting transcription:', filePath)
    console.log('[whisper] using model:', this.model)

    // Method 1: Try OpenAI whisper CLI (python) - most common
    try {
      onProgress?.('trying whisper CLI')
      return await this.transcribeWithWhisperCLI(filePath, onProgress)
    } catch (err) {
      console.warn('[whisper] CLI failed:', err)
    }

    // Method 2: Try whisper.cpp if model downloaded
    if (isModelDownloaded(this.model)) {
      try {
        onProgress?.('trying whisper.cpp')
        return await this.transcribeWithWhisperCpp(filePath, onProgress)
      } catch (err) {
        console.warn('[whisper] whisper.cpp failed:', err)
      }
    }

    // Method 3: OpenAI API
    if (openaiKey) {
      try {
        onProgress?.('using OpenAI API')
        return await this.transcribeOpenAI(filePath, openaiKey, onProgress)
      } catch (err) {
        console.warn('[whisper] OpenAI API failed:', err)
        throw err
      }
    }

    throw new Error(`Transcription failed. Install whisper: pip install openai-whisper`)
  }

  private async findWhisperCppCommand(): Promise<string | null> {
    const commands = ['whisper-cpp', 'whisper.cpp', 'main']

    for (const cmd of commands) {
      try {
        await new Promise((resolve, reject) => {
          exec(`which ${cmd}`, (err) => err ? reject(err) : resolve(true))
        })
        return cmd
      } catch {
        continue
      }
    }
    return null
  }

  private parseOpenAIResponse(json: any): TranscriptResult {
    const segments: TranscriptSegment[] = []

    for (const seg of (json.segments || [])) {
      segments.push({
        id: segments.length,
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
        words: (json.words || [])
          .filter((w: any) => w.start >= seg.start && w.end <= seg.end)
          .map((w: any) => ({ word: w.word, start: w.start, end: w.end }))
      })
    }

    return {
      segments,
      text: json.text || '',
      language: json.language || 'en',
      duration: segments.length > 0 ? segments[segments.length - 1].end : 0
    }
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
        words: (seg.words || []).map((w: any) => ({
          word: w.word || w.text,
          start: w.start,
          end: w.end
        }))
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

  private parseSrt(srt: string): TranscriptResult {
    const segments: TranscriptSegment[] = []
    const blocks = srt.trim().split(/\n\n+/)
    let fullText = ''
    let maxEnd = 0

    for (const block of blocks) {
      const lines = block.split('\n')
      if (lines.length < 3) continue

      const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
      if (!timeMatch) continue

      const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000
      const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000
      const text = lines.slice(2).join(' ').trim()

      segments.push({ id: segments.length, start, end, text, words: [] })
      fullText += text + ' '
      if (end > maxEnd) maxEnd = end
    }

    return { segments, text: fullText.trim(), language: 'en', duration: maxEnd }
  }
}

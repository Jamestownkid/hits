// WHISPER SERVICE - transcribes your video/audio with word-level timestamps
// supports multiple backends: OpenAI API (reliable) or local whisper.cpp

import * as fs from 'fs'
import * as path from 'path'
import { spawn, exec } from 'child_process'
import { app } from 'electron'
import https from 'https'

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

// model info
export interface WhisperModel {
  name: string
  size: string
  downloaded: boolean
  path?: string
}

// available models
const WHISPER_MODELS = ['tiny', 'base', 'small', 'medium', 'large-v3']

// get the models directory (persistent, outside asar)
function getModelsDir(): string {
  const userDataPath = app?.getPath('userData') || path.join(process.env.HOME || '', '.hits')
  const modelsDir = path.join(userDataPath, 'whisper-models')
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true })
  }
  return modelsDir
}

// check if a model is downloaded
export function isModelDownloaded(model: string): boolean {
  const modelsDir = getModelsDir()
  const modelFile = path.join(modelsDir, `ggml-${model}.bin`)
  return fs.existsSync(modelFile)
}

// list available models
export function listModels(): WhisperModel[] {
  const modelsDir = getModelsDir()
  return WHISPER_MODELS.map(name => {
    const modelPath = path.join(modelsDir, `ggml-${name}.bin`)
    return {
      name,
      size: getModelSize(name),
      downloaded: fs.existsSync(modelPath),
      path: fs.existsSync(modelPath) ? modelPath : undefined
    }
  })
}

function getModelSize(name: string): string {
  const sizes: Record<string, string> = {
    'tiny': '75 MB',
    'base': '142 MB',
    'small': '466 MB',
    'medium': '1.5 GB',
    'large-v3': '3.1 GB'
  }
  return sizes[name] || 'unknown'
}

// download a model from huggingface
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
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      // handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location!, (res) => {
          handleDownload(res, file, modelFile, onProgress, resolve, reject)
        }).on('error', reject)
        return
      }
      handleDownload(response, file, modelFile, onProgress, resolve, reject)
    }).on('error', (err) => {
      fs.unlinkSync(modelFile)
      reject(err)
    })
  })
}

function handleDownload(
  response: any, 
  file: fs.WriteStream, 
  modelFile: string,
  onProgress: ((percent: number) => void) | undefined,
  resolve: (value: string) => void,
  reject: (reason: any) => void
) {
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
}

// whisper service class
export class WhisperService {
  private model: string = 'medium'
  
  constructor(model?: string) {
    if (model) this.model = model
  }

  setModel(model: string) {
    this.model = model
  }

  // transcribe using local whisper.cpp binary (if installed)
  async transcribeLocal(filePath: string, onProgress?: (stage: string) => void): Promise<TranscriptResult> {
    const modelsDir = getModelsDir()
    const modelFile = path.join(modelsDir, `ggml-${this.model}.bin`)
    
    if (!fs.existsSync(modelFile)) {
      throw new Error(`Model ${this.model} not downloaded. Please download it first in Settings.`)
    }

    onProgress?.('checking whisper.cpp')
    
    // check if whisper-cpp is installed
    const whisperCmd = await this.findWhisperCommand()
    if (!whisperCmd) {
      throw new Error('whisper.cpp not found. Install it with: sudo apt install whisper.cpp')
    }

    onProgress?.('transcribing')
    
    const outputDir = path.dirname(filePath)
    const baseName = path.basename(filePath, path.extname(filePath))
    const outputFile = path.join(outputDir, baseName)

    return new Promise((resolve, reject) => {
      const args = [
        '-m', modelFile,
        '-f', filePath,
        '-of', outputFile,
        '-oj',  // output json
        '--word-timestamps',
        '-l', 'auto'
      ]

      console.log('[whisper] running:', whisperCmd, args.join(' '))

      const proc = spawn(whisperCmd, args)
      let stderr = ''

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
        console.log('[whisper]', data.toString())
      })

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`whisper failed: ${stderr}`))
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
            reject(new Error('no output from whisper'))
          }
        } catch (err) {
          reject(err)
        }
      })

      proc.on('error', reject)
    })
  }

  // transcribe using OpenAI Whisper API (most reliable)
  async transcribeOpenAI(
    filePath: string, 
    apiKey: string,
    onProgress?: (stage: string) => void
  ): Promise<TranscriptResult> {
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

  // main transcribe method - tries local first, falls back to API
  async transcribe(
    filePath: string, 
    onProgress?: (stage: string) => void,
    openaiKey?: string
  ): Promise<TranscriptResult> {
    console.log('[whisper] starting transcription:', filePath)
    console.log('[whisper] using model:', this.model)
    
    // try local whisper first if model is downloaded
    if (isModelDownloaded(this.model)) {
      try {
        return await this.transcribeLocal(filePath, onProgress)
      } catch (err) {
        console.warn('[whisper] local failed, trying fallback:', err)
      }
    }

    // try OpenAI API if key provided
    if (openaiKey) {
      try {
        return await this.transcribeOpenAI(filePath, openaiKey, onProgress)
      } catch (err) {
        console.warn('[whisper] OpenAI failed:', err)
        throw err
      }
    }

    throw new Error(`Model ${this.model} not downloaded. Go to Settings → Download Model.`)
  }

  private async findWhisperCommand(): Promise<string | null> {
    const commands = ['whisper-cpp', 'whisper', 'main']
    
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
    let segmentId = 0
    
    // OpenAI returns segments and words separately
    for (const seg of (json.segments || [])) {
      segments.push({
        id: segmentId++,
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
          word: w.word,
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

      segments.push({
        id: segments.length,
        start,
        end,
        text,
        words: []
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

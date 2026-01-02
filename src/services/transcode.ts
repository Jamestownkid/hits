// VIDEO TRANSCODER - converts HEVC/MOV to H.264 MP4
// cause Linux Chromium can't decode HEVC and we ain't got time for that
// runs in main process using ffmpeg

import { spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import * as crypto from 'crypto'

// cache dir for converted videos
const CACHE_DIR = path.join(os.tmpdir(), 'hits-video-cache')

// ensure cache dir exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

// generate a unique cache key for a file
function getCacheKey(filePath: string): string {
  const stats = fs.statSync(filePath)
  const hash = crypto.createHash('md5')
    .update(filePath + stats.size + stats.mtime.getTime())
    .digest('hex')
  return hash.slice(0, 12)
}

// check if file is already converted and cached
function getCachedPath(filePath: string): string | null {
  const cacheKey = getCacheKey(filePath)
  const cachedFile = path.join(CACHE_DIR, `${cacheKey}.mp4`)
  
  if (fs.existsSync(cachedFile)) {
    console.log('[transcode] cache hit:', cachedFile)
    return cachedFile
  }
  return null
}

// check if file needs transcoding - INCLUDES .mp4 because iPhone videos can be HEVC!
export function needsTranscode(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase()
  // IMPORTANT: include .mp4 - many iPhone/screen recordings are HEVC in mp4 container
  const videoContainers = ['.mp4', '.m4v', '.mov', '.mkv', '.avi', '.webm', '.hevc', '.h265']
  return videoContainers.includes(ext)
}

// probe video codec using ffprobe
export async function getVideoCodec(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=codec_name',
      '-of', 'default=nw=1:nk=1',
      filePath
    ])
    
    let output = ''
    proc.stdout.on('data', (data) => { output += data.toString() })
    proc.stderr.on('data', (data) => console.log('[ffprobe]', data.toString()))
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim().toLowerCase())
      } else {
        resolve('unknown')
      }
    })
    
    proc.on('error', () => resolve('unknown'))
  })
}

// check if ffmpeg is installed
export async function isFFmpegInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('ffmpeg', ['-version'])
    proc.on('close', (code) => resolve(code === 0))
    proc.on('error', () => resolve(false))
  })
}

// transcode video to H.264 MP4
export interface TranscodeProgress {
  percent: number
  stage: string
  eta?: number
}

export async function transcodeVideo(
  inputPath: string,
  onProgress?: (progress: TranscodeProgress) => void
): Promise<string> {
  // check cache first
  const cached = getCachedPath(inputPath)
  if (cached) {
    onProgress?.({ percent: 100, stage: 'cached' })
    return cached
  }
  
  // check if ffmpeg is available
  const hasFFmpeg = await isFFmpegInstalled()
  if (!hasFFmpeg) {
    console.warn('[transcode] ffmpeg not installed, using original file')
    return inputPath
  }
  
  // check codec - if already H.264, no need to transcode
  const codec = await getVideoCodec(inputPath)
  console.log('[transcode] detected codec:', codec)
  
  if (codec === 'h264' || codec === 'avc' || codec === 'avc1') {
    console.log('[transcode] already H.264, skipping transcode')
    return inputPath
  }
  
  // output path in cache
  const cacheKey = getCacheKey(inputPath)
  const outputPath = path.join(CACHE_DIR, `${cacheKey}.mp4`)
  
  console.log('[transcode] starting:', inputPath, '->', outputPath)
  onProgress?.({ percent: 0, stage: 'starting' })
  
  return new Promise((resolve, reject) => {
    // get duration first for progress calculation
    const durationProc = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=nw=1:nk=1',
      inputPath
    ])
    
    let duration = 0
    durationProc.stdout.on('data', (data) => {
      duration = parseFloat(data.toString().trim()) || 0
    })
    
    durationProc.on('close', () => {
      // now transcode
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c:v', 'libx264',        // H.264 codec
        '-preset', 'veryfast',     // fast encoding
        '-crf', '18',              // good quality
        '-pix_fmt', 'yuv420p',     // compatible pixel format
        '-c:a', 'aac',             // AAC audio
        '-b:a', '192k',            // audio bitrate
        '-movflags', '+faststart', // web-friendly
        '-progress', 'pipe:1',     // output progress to stdout
        '-y',                      // overwrite output
        outputPath
      ])
      
      const startTime = Date.now()
      
      ffmpeg.stdout.on('data', (data) => {
        const str = data.toString()
        // parse progress output
        const timeMatch = str.match(/out_time_ms=(\d+)/)
        if (timeMatch && duration > 0) {
          const currentMs = parseInt(timeMatch[1]) / 1000000
          const percent = Math.min(99, (currentMs / duration) * 100)
          const elapsed = (Date.now() - startTime) / 1000
          const eta = elapsed > 0 ? ((duration - currentMs) / (currentMs / elapsed)) : 0
          
          onProgress?.({ 
            percent: Math.round(percent), 
            stage: 'transcoding',
            eta: Math.round(eta)
          })
        }
      })
      
      ffmpeg.stderr.on('data', (data) => {
        // ffmpeg outputs info to stderr, that's normal
        const str = data.toString()
        if (str.includes('Error') || str.includes('error')) {
          console.error('[ffmpeg error]', str)
        }
      })
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          // WAIT for file to flush to disk, then VERIFY it exists and has size
          setTimeout(() => {
            if (fs.existsSync(outputPath)) {
              const stats = fs.statSync(outputPath)
              if (stats.size > 1000) { // at least 1KB
                console.log('[transcode] verified:', outputPath, Math.round(stats.size / 1024), 'KB')
                onProgress?.({ percent: 100, stage: 'complete' })
                resolve(outputPath)
                return
              }
            }
            console.error('[transcode] output missing or empty, using original')
            resolve(inputPath)
          }, 500) // 500ms delay to ensure file is written
        } else {
          console.error('[transcode] failed with code:', code)
          resolve(inputPath)
        }
      })
      
      ffmpeg.on('error', (err) => {
        console.error('[transcode] ffmpeg error:', err)
        resolve(inputPath)  // fall back to original
      })
    })
  })
}

// clean up old cached files (call periodically)
export function cleanupCache(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
  try {
    const files = fs.readdirSync(CACHE_DIR)
    const now = Date.now()
    
    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file)
      const stats = fs.statSync(filePath)
      
      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath)
        console.log('[transcode] cleaned up:', file)
      }
    }
  } catch (err) {
    console.error('[transcode] cleanup error:', err)
  }
}


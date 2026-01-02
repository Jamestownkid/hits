// RENDER SERVICE - uses remotion to actually render the video
// GPU accelerated when possible cause aint nobody got time for CPU rendering

import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import * as path from 'path'
import { EditManifest } from '../types/manifest'

// render progress callback type
export interface RenderProgress {
  percent: number
  frame: number
  totalFrames: number
  eta: number
  stage: string
}

// render service class
export class RenderService {
  private bundlePath: string | null = null

  // bundle the remotion project (do this once)
  async bundle(): Promise<string> {
    if (this.bundlePath) return this.bundlePath

    console.log('[render] bundling remotion project...')
    
    const entryPoint = path.join(process.cwd(), 'src/remotion/index.ts')
    
    this.bundlePath = await bundle({
      entryPoint,
      onProgress: (progress) => {
        console.log(`[render] bundle progress: ${Math.round(progress * 100)}%`)
      }
    })

    console.log('[render] bundle complete:', this.bundlePath)
    return this.bundlePath
  }

  // render a video from manifest
  async render(
    manifest: EditManifest,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<void> {
    const bundlePath = await this.bundle()

    console.log('[render] starting render:', outputPath)
    console.log('[render] duration:', manifest.duration, 'seconds @', manifest.fps, 'fps')

    const totalFrames = Math.round(manifest.duration * manifest.fps)

    // select the composition
    const composition = await selectComposition({
      serveUrl: bundlePath,
      id: 'HitsVideo',
      inputProps: { manifest }
    })

    // override dimensions from manifest
    const compositionWithOverrides = {
      ...composition,
      width: manifest.width,
      height: manifest.height,
      fps: manifest.fps,
      durationInFrames: totalFrames
    }

    const startTime = Date.now()

    // render with GPU acceleration
    await renderMedia({
      composition: compositionWithOverrides,
      serveUrl: bundlePath,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { manifest },
      
      // GPU settings for linux
      chromiumOptions: {
        gl: 'angle-egl',
        enableMultiProcessOnLinux: true
      },

      onProgress: ({ renderedFrames, stitchStage }) => {
        const elapsed = (Date.now() - startTime) / 1000
        const fps = renderedFrames / elapsed
        const remaining = totalFrames - renderedFrames
        const eta = fps > 0 ? remaining / fps : 0

        onProgress?.({
          percent: (renderedFrames / totalFrames) * 100,
          frame: renderedFrames,
          totalFrames,
          eta,
          stage: stitchStage || 'rendering'
        })
      }
    })

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log('[render] complete in', elapsed, 'seconds:', outputPath)
  }
}

// singleton instance
export const renderService = new RenderService()


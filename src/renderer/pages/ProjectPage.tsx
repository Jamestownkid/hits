// PROJECT PAGE - the main video editing workflow
// upload -> transcribe -> generate -> render -> export

import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  Play,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileVideo,
  Loader2,
  FolderOpen,
} from 'lucide-react'
import { useStore } from '../hooks/useStore'
import clsx from 'clsx'

// workflow steps
const steps = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'transcribe', label: 'Transcribe', icon: FileVideo },
  { id: 'generate', label: 'Generate', icon: RefreshCw },
  { id: 'render', label: 'Render', icon: Play },
  { id: 'export', label: 'Export', icon: Download },
]

export const ProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    currentProject,
    setSourceFile,
    setTranscript,
    setManifest,
    setStatus,
    setProgress,
    setError,
    renderProgress,
    setRenderProgress,
    outputFormat,
  } = useStore()

  const [dragActive, setDragActive] = useState(false)

  // set up progress listeners
  useEffect(() => {
    if (!currentProject) return

    const cleanupWhisper = window.api.whisper.onProgress((data) => {
      console.log('[whisper]', data.stage)
    })

    const cleanupRender = window.api.render.onProgress((data) => {
      setRenderProgress(data)
      setProgress(data.percent)
    })

    return () => {
      cleanupWhisper()
      cleanupRender()
    }
  }, [currentProject, setRenderProgress, setProgress])

  // no project selected - send em back
  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-hits-muted mb-4">No project selected fam</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // get dimensions based on output format
  const getDimensions = () => {
    switch (outputFormat) {
      case 'vertical':
        return { width: 1080, height: 1920 }
      case 'square':
        return { width: 1080, height: 1080 }
      default:
        return { width: 1920, height: 1080 }
    }
  }

  // file select handler
  const handleFileSelect = async () => {
    const filePath = await window.api.dialog.openFile()
    if (filePath) {
      setSourceFile(filePath)
      setError(null)
    }
  }

  // start transcription
  const handleTranscribe = async () => {
    if (!currentProject.sourceFile) return

    setStatus('transcribing')
    setProgress(0)
    setError(null)

    try {
      const result = await window.api.whisper.transcribe(currentProject.sourceFile)

      if (result.success && result.data) {
        setTranscript(result.data)
        setError(null)  // make sure error is cleared
        setStatus('idle')
        setProgress(100)
      } else {
        setError(result.error || 'transcription failed')
        setStatus('idle')
      }
    } catch (err) {
      setError('Transcription failed: ' + String(err))
      setStatus('idle')
    }
  }

  // generate edit manifest
  const handleGenerate = async () => {
    if (!currentProject.transcript) return

    setStatus('generating')
    setProgress(0)
    setError(null)

    try {
      const result = await window.api.claude.generateManifest(
        currentProject.transcript,
        currentProject.mode,
        currentProject.sourceFile!
      )

      if (result.success && result.data) {
        // update dimensions based on output format
        const dims = getDimensions()
        result.data.width = dims.width
        result.data.height = dims.height
        
        setManifest(result.data)
        setError(null)
        setStatus('idle')
        setProgress(100)
      } else {
        setError(result.error || 'generation failed')
        setStatus('idle')
      }
    } catch (err) {
      setError('Generation failed: ' + String(err))
      setStatus('idle')
    }
  }

  // start render
  const handleRender = async () => {
    if (!currentProject.manifest) return

    setStatus('rendering')
    setProgress(0)
    setError(null)

    try {
      const outputPath = await window.api.dialog.saveFile(
        `${currentProject.name.replace(/\s+/g, '_')}.mp4`
      )

      if (!outputPath) {
        setStatus('idle')
        return
      }

      const result = await window.api.render.start(currentProject.manifest, outputPath)

      if (result.success) {
        setStatus('complete')
        setError(null)
        setProgress(100)
        setRenderProgress(null)
      } else {
        setError(result.error || 'render failed')
        setStatus('idle')
      }
    } catch (err) {
      setError('Render failed: ' + String(err))
      setStatus('idle')
    }
  }

  // figure out current step
  const getCurrentStep = () => {
    if (!currentProject.sourceFile) return 0
    if (!currentProject.transcript) return 1
    if (!currentProject.manifest) return 2
    if (currentProject.status === 'rendering') return 3
    if (currentProject.status === 'complete') return 4
    return 2
  }

  const currentStep = getCurrentStep()

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* progress steps header */}
      <div className="border-b border-hits-border px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isComplete = idx < currentStep
            const isCurrent = idx === currentStep
            const isActive = currentProject.status !== 'idle' && isCurrent

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      isComplete && 'bg-hits-success text-white',
                      isCurrent && !isComplete && 'bg-hits-accent text-white',
                      !isComplete && !isCurrent && 'bg-hits-border text-hits-muted'
                    )}
                  >
                    {isActive ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isComplete ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>
                  <span
                    className={clsx(
                      'text-xs mt-2',
                      isCurrent ? 'text-hits-text' : 'text-hits-muted'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={clsx(
                      'flex-1 h-0.5 mx-2',
                      idx < currentStep ? 'bg-hits-success' : 'bg-hits-border'
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* main content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* error display */}
          {currentProject.error && (
            <div className="bg-hits-error/10 border border-hits-error/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-hits-error flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-hits-error">Error</p>
                <p className="text-sm text-hits-muted">{currentProject.error}</p>
              </div>
            </div>
          )}

          {/* project info */}
          <div className="card flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{currentProject.name}</h2>
              <p className="text-sm text-hits-muted">Mode: {currentProject.mode}</p>
            </div>
            <div className="text-sm text-hits-muted">
              {outputFormat === 'vertical' ? '9:16' : outputFormat === 'square' ? '1:1' : '16:9'}
            </div>
          </div>

          {/* file upload */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Source File</h2>
            {!currentProject.sourceFile ? (
              <div
                className={clsx('drop-zone', dragActive && 'active')}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragActive(false)
                  handleFileSelect()
                }}
                onClick={handleFileSelect}
              >
                <Upload size={40} className="text-hits-muted" />
                <div className="text-center">
                  <p className="font-medium">Drop your video or audio file</p>
                  <p className="text-sm text-hits-muted">MP4, MOV, MKV, MP3, WAV supported</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-hits-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <FileVideo size={24} className="text-hits-accent" />
                  <div>
                    <p className="font-medium">
                      {currentProject.sourceFile.split('/').pop()}
                    </p>
                    <p className="text-sm text-hits-muted">Ready to process</p>
                  </div>
                </div>
                <button onClick={handleFileSelect} className="btn-secondary">
                  Change
                </button>
              </div>
            )}
          </div>

          {/* transcription */}
          {currentProject.sourceFile && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Transcription</h2>
                {currentProject.status === 'transcribing' && (
                  <span className="text-sm text-hits-accent flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Working...
                  </span>
                )}
              </div>
              {!currentProject.transcript ? (
                <div className="text-center py-8">
                  {currentProject.status === 'transcribing' ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-hits-accent border-t-transparent animate-spin" />
                      </div>
                      <p className="text-hits-accent font-medium">Transcribing with Whisper...</p>
                      <p className="text-sm text-hits-muted">This may take 1-5 minutes depending on video length</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleTranscribe}
                        disabled={currentProject.status !== 'idle'}
                        className="btn-primary"
                      >
                        Start Transcription
                      </button>
                      <p className="text-sm text-hits-muted mt-2">
                        Using Whisper speech-to-text
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={18} className="text-hits-success" />
                    <span className="text-sm text-hits-muted">
                      {currentProject.transcript.segments.length} segments ·{' '}
                      {Math.round(currentProject.transcript.duration)}s duration
                    </span>
                  </div>
                  <div className="max-h-40 overflow-auto bg-hits-bg rounded-lg p-4 text-sm font-mono">
                    {currentProject.transcript.text}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* manifest generation */}
          {currentProject.transcript && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Edit Manifest</h2>
                {currentProject.status === 'generating' && (
                  <span className="text-sm text-hits-accent flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Working...
                  </span>
                )}
              </div>
              {!currentProject.manifest ? (
                <div className="text-center py-8">
                  {currentProject.status === 'generating' ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-hits-accent border-t-transparent animate-spin" />
                      </div>
                      <p className="text-hits-accent font-medium">Generating edits with Claude AI...</p>
                      <p className="text-sm text-hits-muted">This may take 10-30 seconds</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleGenerate}
                        disabled={currentProject.status !== 'idle'}
                        className="btn-primary"
                      >
                        Generate Edit Manifest
                      </button>
                      <p className="text-sm text-hits-muted mt-2">
                        Claude will analyze transcript and pick the right edits
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={18} className="text-hits-success" />
                    <span className="text-sm text-hits-muted">
                      {currentProject.manifest.scenes?.length || 0} scenes ·{' '}
                      {currentProject.manifest.scenes?.reduce(
                        (sum: number, s: any) => sum + (s.edits?.length || 0),
                        0
                      ) || 0}{' '}
                      edits
                    </span>
                  </div>
                  <div className="text-sm text-hits-muted">
                    Mode: {currentProject.manifest.mode} ·{' '}
                    {currentProject.manifest.width}x{currentProject.manifest.height} @{' '}
                    {currentProject.manifest.fps}fps
                  </div>
                </div>
              )}
            </div>
          )}

          {/* render */}
          {currentProject.manifest && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Render Video</h2>
              {currentProject.status === 'rendering' && renderProgress ? (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      Frame {renderProgress.frame} / {renderProgress.totalFrames}
                    </span>
                    <span>{Math.round(renderProgress.percent)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${renderProgress.percent}%` }}
                    />
                  </div>
                  <p className="text-sm text-hits-muted mt-2">
                    ETA: {Math.round(renderProgress.eta)}s · Stage: {renderProgress.stage}
                  </p>
                </div>
              ) : currentProject.status === 'complete' ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="mx-auto text-hits-success mb-2" />
                  <p className="font-medium">Render Complete!</p>
                  <p className="text-sm text-hits-muted">Your video has been exported</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button onClick={handleRender} className="btn-primary">
                    Start Render
                  </button>
                  <p className="text-sm text-hits-muted mt-2">
                    GPU accelerated with Remotion
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


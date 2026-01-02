// PROJECT PAGE - the main video editing workflow
// upload -> transcribe -> generate -> render -> export
// NOW WITH VISIBLE FEEDBACK FOR EVERY STEP - NO MORE CONFUSION!

import React, { useState, useCallback, useEffect, useRef } from 'react'
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
  Clock,
  Copy,
  Check,
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

// BIG WORKING INDICATOR COMPONENT - shows when stuff is happening
const WorkingOverlay: React.FC<{
  status: string
  startTime: number
  estimatedSeconds: number
  stageText?: string
}> = ({ status, startTime, estimatedSeconds, stageText }) => {
  const [elapsed, setElapsed] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])
  
  const remaining = Math.max(0, estimatedSeconds - elapsed)
  const progress = Math.min(99, (elapsed / Math.max(1, estimatedSeconds)) * 100)
  
  const statusConfig: Record<string, { emoji: string; text: string; color: string }> = {
    transcribing: { emoji: '🎤', text: 'Transcribing Audio', color: 'from-blue-500 to-cyan-500' },
    generating: { emoji: '🧠', text: 'Generating Edits', color: 'from-purple-500 to-pink-500' },
    rendering: { emoji: '🎬', text: 'Rendering Video', color: 'from-orange-500 to-red-500' },
  }
  
  const config = statusConfig[status] || { emoji: '⏳', text: 'Working...', color: 'from-gray-500 to-gray-600' }
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-hits-surface border border-hits-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* big spinner */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-hits-border" />
          {/* progress ring */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.89} 289`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          {/* center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl">{config.emoji}</span>
            <span className="text-xl font-bold text-hits-accent">{Math.round(progress)}%</span>
          </div>
        </div>
        
        {/* status text */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-hits-text mb-1">{config.text}</h3>
          {stageText && (
            <p className="text-hits-accent text-sm font-medium mb-1">{stageText}</p>
          )}
          <p className="text-hits-muted">Please wait, this is working in the background...</p>
        </div>
        
        {/* time display */}
        <div className="bg-hits-bg rounded-xl p-4 flex justify-around text-center">
          <div>
            <div className="text-2xl font-mono font-bold text-hits-text">
              {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-hits-muted uppercase">Elapsed</div>
          </div>
          <div className="border-l border-hits-border" />
          <div>
            <div className="text-2xl font-mono font-bold text-hits-accent">
              ~{Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-hits-muted uppercase">Remaining</div>
          </div>
        </div>
        
        {/* pulse indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-hits-muted">Processing...</span>
        </div>
      </div>
    </div>
  )
}

// ERROR DISPLAY with easy copy button
const ErrorDisplay: React.FC<{ error: string; onClear: () => void }> = ({ error, onClear }) => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(error)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="bg-hits-error/10 border border-hits-error/20 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="text-hits-error flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-medium text-hits-error mb-1">Error</p>
            <p className="text-sm text-hits-muted break-words">{error}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded hover:bg-hits-error/20 text-hits-error transition-colors"
            title="Copy error"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            onClick={onClear}
            className="p-2 rounded hover:bg-hits-error/20 text-hits-error transition-colors text-lg leading-none"
            title="Clear error"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

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
  const [workStartTime, setWorkStartTime] = useState(0)
  const [generateStage, setGenerateStage] = useState('')

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
    
    // NEW: Listen to Claude progress events!
    const cleanupClaude = window.api.claude.onProgress((data) => {
      const stage = String(data?.stage || '')
      setGenerateStage(stage)
      
      // update progress based on stage
      if (stage === 'starting') setProgress(5)
      if (stage === 'scanning_assets') setProgress(20)
      if (stage === 'assets_scanned') setProgress(40)
      if (stage === 'generating_manifest') setProgress(70)
      if (stage === 'complete') setProgress(100)
    })

    return () => {
      cleanupWhisper()
      cleanupRender()
      cleanupClaude()
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
      case 'custom':
        return { width: 1440, height: 1080 } // 4:3
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

  // start transcription - PREVENTS DOUBLE CLICKS
  const handleTranscribe = async () => {
    if (!currentProject.sourceFile) return
    if (currentProject.status !== 'idle') return  // GUARD!

    setStatus('transcribing')
    setProgress(0)
    setError(null)
    setWorkStartTime(Date.now())

    try {
      const result = await window.api.whisper.transcribe(currentProject.sourceFile)

      if (result.success && result.data) {
        setTranscript(result.data)
        setError(null)
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

  // generate edit manifest - PREVENTS DOUBLE CLICKS
  const handleGenerate = async () => {
    if (!currentProject.transcript) return
    if (currentProject.status !== 'idle') return  // GUARD!

    setStatus('generating')
    setProgress(0)
    setError(null)
    setWorkStartTime(Date.now())
    setGenerateStage('starting')

    try {
      const result = await window.api.claude.generateManifest(
        currentProject.transcript,
        currentProject.mode,
        currentProject.sourceFile!
      )

      if (result.success && result.data) {
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
    
    setGenerateStage('')
  }

  // start render - PREVENTS DOUBLE CLICKS
  const handleRender = async () => {
    if (!currentProject.manifest) return
    if (currentProject.status !== 'idle') return  // GUARD!

    setStatus('rendering')
    setProgress(0)
    setError(null)
    setWorkStartTime(Date.now())

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

  // calculate estimated time based on status
  const getEstimatedTime = () => {
    if (currentProject?.status === 'transcribing') return 180  // ~3 min for transcription
    if (currentProject?.status === 'generating') return 30     // ~30s for manifest
    if (currentProject?.status === 'rendering') {
      const duration = currentProject?.manifest?.duration || 60
      return duration * 2  // roughly 2x video length
    }
    return 60
  }
  
  // get stage text for generate
  const getStageText = () => {
    switch (generateStage) {
      case 'starting': return 'Starting up...'
      case 'scanning_assets': return 'Scanning assets folder...'
      case 'assets_scanned': return 'Assets scanned. Building edit plan...'
      case 'generating_manifest': return 'Generating edit manifest with AI...'
      case 'complete': return 'Done!'
      case 'error': return 'Error occurred'
      default: return 'Working...'
    }
  }

  // is currently working?
  const isWorking = currentProject?.status === 'transcribing' || 
                    currentProject?.status === 'generating' || 
                    currentProject?.status === 'rendering'

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
      {/* BIG WORKING OVERLAY - shows when processing */}
      {isWorking && workStartTime > 0 && (
        <WorkingOverlay
          status={currentProject.status}
          startTime={workStartTime}
          estimatedSeconds={getEstimatedTime()}
          stageText={currentProject.status === 'generating' ? getStageText() : undefined}
        />
      )}

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
          {/* error display with copy button */}
          {currentProject.error && (
            <ErrorDisplay error={currentProject.error} onClear={() => setError(null)} />
          )}

          {/* project info */}
          <div className="card flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{currentProject.name}</h2>
              <p className="text-sm text-hits-muted">Mode: {currentProject.mode}</p>
            </div>
            <div className="text-sm text-hits-muted">
              {outputFormat === 'vertical' ? '9:16' : outputFormat === 'square' ? '1:1' : outputFormat === 'custom' ? '4:3' : '16:9'}
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
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentProject.status !== 'idle' ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Working...
                          </span>
                        ) : (
                          'Start Transcription'
                        )}
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
                    {getStageText()}
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
                      <p className="text-hits-accent font-medium">{getStageText()}</p>
                      <p className="text-sm text-hits-muted">This may take 10-30 seconds</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleGenerate}
                        disabled={currentProject.status !== 'idle'}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentProject.status !== 'idle' ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Working...
                          </span>
                        ) : (
                          'Generate Edit Manifest'
                        )}
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
                  <button 
                    onClick={handleRender} 
                    disabled={currentProject.status !== 'idle'}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentProject.status !== 'idle' ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Working...
                      </span>
                    ) : (
                      'Start Render'
                    )}
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

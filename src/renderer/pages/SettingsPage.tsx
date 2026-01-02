// SETTINGS PAGE - API keys, whisper models, and configuration
// where users set up their stuff

import React, { useState, useEffect } from 'react'
import { Key, FolderOpen, Cpu, CheckCircle, Save, ExternalLink, Volume2, Download, Loader2 } from 'lucide-react'

interface WhisperModel {
  name: string
  size: string
  downloaded: boolean
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    anthropicApiKey: '',
    openaiApiKey: '',
    whisperModel: 'medium',
    outputDir: '',
    assetsDir: '',
    aspectRatio: '16:9',
  })
  const [saved, setSaved] = useState(false)
  const [sfxCount, setSfxCount] = useState(0)
  const [models, setModels] = useState<WhisperModel[]>([])
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // load settings and models on mount
  useEffect(() => {
    const load = async () => {
      const config = await window.api.config.getAll()
      setSettings({
        anthropicApiKey: config.anthropicApiKey || '',
        openaiApiKey: config.openaiApiKey || '',
        whisperModel: config.whisperModel || 'medium',
        outputDir: config.outputDir || '',
        assetsDir: config.assetsDir || '',
        aspectRatio: config.aspectRatio || '16:9',
      })
      
      const sfx = await window.api.assets.listSfx()
      setSfxCount(sfx.length)
      
      // load whisper models
      const modelList = await window.api.whisper.listModels()
      setModels(modelList)
    }
    load()

    // listen for download progress
    const unsubscribe = window.api.whisper.onDownloadProgress((data) => {
      setDownloadProgress(data.percent)
      if (data.percent >= 100) {
        setDownloading(null)
        // refresh models list
        window.api.whisper.listModels().then(setModels)
      }
    })
    
    return () => unsubscribe()
  }, [])

  const handleSave = async () => {
    await window.api.config.set('anthropicApiKey', settings.anthropicApiKey)
    await window.api.config.set('openaiApiKey', settings.openaiApiKey)
    await window.api.config.set('whisperModel', settings.whisperModel)
    await window.api.config.set('outputDir', settings.outputDir)
    await window.api.config.set('assetsDir', settings.assetsDir)
    await window.api.config.set('aspectRatio', settings.aspectRatio)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDownloadModel = async (model: string) => {
    setDownloading(model)
    setDownloadProgress(0)
    const result = await window.api.whisper.downloadModel(model)
    if (!result.success) {
      alert(`Failed to download: ${result.error}`)
    }
    setDownloading(null)
    const modelList = await window.api.whisper.listModels()
    setModels(modelList)
  }

  const handleSelectOutputDir = async () => {
    const dir = await window.api.dialog.openDirectory()
    if (dir) setSettings((prev) => ({ ...prev, outputDir: dir }))
  }

  const handleSelectAssetsDir = async () => {
    const dir = await window.api.dialog.openDirectory()
    if (dir) {
      setSettings((prev) => ({ ...prev, assetsDir: dir }))
      await window.api.assets.setDir(dir)
      const sfx = await window.api.assets.listSfx()
      setSfxCount(sfx.length)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

      {/* API keys */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key size={20} className="text-hits-accent" />
          API Keys
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Claude API Key <span className="text-hits-muted">(Required for editing)</span>
            </label>
            <input
              type="password"
              value={settings.anthropicApiKey}
              onChange={(e) => setSettings((prev) => ({ ...prev, anthropicApiKey: e.target.value }))}
              placeholder="sk-ant-..."
              className="input"
            />
            <p className="text-xs text-hits-muted mt-1">
              Get from{' '}
              <button onClick={() => window.api.shell.openExternal('https://console.anthropic.com')} className="text-hits-accent hover:underline">
                console.anthropic.com
              </button>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              OpenAI API Key <span className="text-hits-muted">(Optional - fallback transcription)</span>
            </label>
            <input
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) => setSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))}
              placeholder="sk-..."
              className="input"
            />
            <p className="text-xs text-hits-muted mt-1">
              Optional: Used as fallback if local Whisper fails
            </p>
          </div>
        </div>
      </section>

      {/* Whisper models */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cpu size={20} className="text-hits-accent" />
          Whisper Models
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Active Model</label>
          <select
            value={settings.whisperModel}
            onChange={(e) => setSettings((prev) => ({ ...prev, whisperModel: e.target.value }))}
            className="input"
          >
            {models.map((m) => (
              <option key={m.name} value={m.name} disabled={!m.downloaded}>
                {m.name} ({m.size}) {m.downloaded ? '✓' : '- not downloaded'}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium mb-2">Download Models</p>
          {models.map((m) => (
            <div key={m.name} className="flex items-center justify-between bg-hits-bg rounded-lg p-3">
              <div>
                <span className="font-medium">{m.name}</span>
                <span className="text-hits-muted ml-2 text-sm">{m.size}</span>
              </div>
              {m.downloaded ? (
                <span className="text-hits-success flex items-center gap-1 text-sm">
                  <CheckCircle size={16} /> Downloaded
                </span>
              ) : downloading === m.name ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  {downloadProgress.toFixed(0)}%
                </div>
              ) : (
                <button onClick={() => handleDownloadModel(m.name)} className="btn-secondary text-sm py-1">
                  <Download size={14} /> Download
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-hits-muted mt-3">
          💡 Tip: Start with "medium" - good balance of speed and quality. Use "tiny" for testing.
        </p>
      </section>

      {/* Aspect Ratio */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Default Aspect Ratio</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: '16:9', label: '16:9', desc: 'YouTube' },
            { value: '9:16', label: '9:16', desc: 'TikTok/Reels' },
            { value: '1:1', label: '1:1', desc: 'Square' },
            { value: '4:3', label: '4:3', desc: 'Classic' },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setSettings((prev) => ({ ...prev, aspectRatio: r.value }))}
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.aspectRatio === r.value
                  ? 'border-hits-accent bg-hits-accent/10'
                  : 'border-hits-border hover:border-hits-accent/50'
              }`}
            >
              <div className="font-bold">{r.label}</div>
              <div className="text-xs text-hits-muted">{r.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Assets directory */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 size={20} className="text-hits-accent" />
          Assets
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Assets Directory</label>
          <div className="flex gap-2">
            <input type="text" value={settings.assetsDir} readOnly placeholder="Select folder..." className="input flex-1" />
            <button onClick={handleSelectAssetsDir} className="btn-secondary">Browse</button>
          </div>
          <p className="text-xs text-hits-muted mt-1">
            {sfxCount > 0 ? <span className="text-hits-success">{sfxCount} sound effects loaded</span> : 'Point to folder with sfx/ and images/ subfolders'}
          </p>
        </div>
      </section>

      {/* Output directory */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FolderOpen size={20} className="text-hits-accent" />
          Output
        </h2>

        <div>
          <label className="block text-sm font-medium mb-2">Default Output Directory</label>
          <div className="flex gap-2">
            <input type="text" value={settings.outputDir} readOnly placeholder="Select folder..." className="input flex-1" />
            <button onClick={handleSelectOutputDir} className="btn-secondary">Browse</button>
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="flex items-center gap-2 text-hits-success">
            <CheckCircle size={18} /> Settings saved
          </span>
        )}
        <button onClick={handleSave} className="btn-primary">
          <Save size={18} /> Save Settings
        </button>
      </div>

      {/* Help links */}
      <section className="mt-8 card bg-hits-accent/5 border-hits-accent/20">
        <h2 className="text-lg font-semibold mb-4">Resources</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <button onClick={() => window.api.shell.openExternal('https://www.remotion.dev/docs')} className="flex items-center gap-2 text-hits-muted hover:text-hits-accent">
            <ExternalLink size={14} /> Remotion Docs
          </button>
          <button onClick={() => window.api.shell.openExternal('https://www.reactvideoeditor.com/remotion-templates')} className="flex items-center gap-2 text-hits-muted hover:text-hits-accent">
            <ExternalLink size={14} /> Edit Templates
          </button>
          <button onClick={() => window.api.shell.openExternal('https://console.anthropic.com')} className="flex items-center gap-2 text-hits-muted hover:text-hits-accent">
            <ExternalLink size={14} /> Claude Console
          </button>
          <button onClick={() => window.api.edits.openFolder()} className="flex items-center gap-2 text-hits-muted hover:text-hits-accent">
            <FolderOpen size={14} /> Open Edits Folder
          </button>
        </div>
      </section>
    </div>
  )
}

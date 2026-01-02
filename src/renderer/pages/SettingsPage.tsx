// SETTINGS PAGE - API keys and configuration
// where users set up their stuff

import React, { useState, useEffect } from 'react'
import { Key, FolderOpen, Cpu, CheckCircle, Save, ExternalLink, Volume2 } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    anthropicApiKey: '',
    whisperModel: 'large-v3',
    outputDir: '',
    assetsDir: '',
  })
  const [saved, setSaved] = useState(false)
  const [sfxCount, setSfxCount] = useState(0)

  // load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const config = await window.api.config.getAll()
      setSettings({
        anthropicApiKey: config.anthropicApiKey || '',
        whisperModel: config.whisperModel || 'large-v3',
        outputDir: config.outputDir || '',
        assetsDir: config.assetsDir || '',
      })
      
      // count SFX
      const sfx = await window.api.assets.listSfx()
      setSfxCount(sfx.length)
    }
    loadSettings()
  }, [])

  // save settings
  const handleSave = async () => {
    await window.api.config.set('anthropicApiKey', settings.anthropicApiKey)
    await window.api.config.set('whisperModel', settings.whisperModel)
    await window.api.config.set('outputDir', settings.outputDir)
    await window.api.config.set('assetsDir', settings.assetsDir)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // select output directory
  const handleSelectOutputDir = async () => {
    const dir = await window.api.dialog.openDirectory()
    if (dir) {
      setSettings((prev) => ({ ...prev, outputDir: dir }))
    }
  }

  // select assets directory
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
              Claude API Key
              <span className="text-hits-muted ml-2">(Required)</span>
            </label>
            <input
              type="password"
              value={settings.anthropicApiKey}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, anthropicApiKey: e.target.value }))
              }
              placeholder="sk-ant-..."
              className="input"
            />
            <p className="text-xs text-hits-muted mt-1">
              Get your key from{' '}
              <button
                onClick={() => window.api.shell.openExternal('https://console.anthropic.com')}
                className="text-hits-accent hover:underline"
              >
                console.anthropic.com
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Whisper settings */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cpu size={20} className="text-hits-accent" />
          Whisper Settings
        </h2>

        <div>
          <label className="block text-sm font-medium mb-2">Model</label>
          <select
            value={settings.whisperModel}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, whisperModel: e.target.value }))
            }
            className="input"
          >
            <option value="tiny">Tiny (fastest)</option>
            <option value="base">Base</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large-v2">Large v2</option>
            <option value="large-v3">Large v3 (recommended)</option>
            <option value="large-v3-turbo">Large v3 Turbo</option>
          </select>
          <p className="text-xs text-hits-muted mt-1">
            Bigger models = better quality but slower. GPU recommended for large models.
          </p>
        </div>
      </section>

      {/* Assets directory */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 size={20} className="text-hits-accent" />
          Assets
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Assets Directory (SFX, Images)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.assetsDir}
              readOnly
              placeholder="Select folder with sfx/ and images/ subfolders"
              className="input flex-1"
            />
            <button onClick={handleSelectAssetsDir} className="btn-secondary">
              Browse
            </button>
          </div>
          <p className="text-xs text-hits-muted mt-1">
            {sfxCount > 0 ? (
              <span className="text-hits-success">{sfxCount} sound effects loaded</span>
            ) : (
              'Point to a folder with sfx/ and images/ subfolders'
            )}
          </p>
        </div>

        {/* Audio pack info */}
        <div className="bg-hits-bg rounded-lg p-4">
          <p className="text-sm text-hits-muted mb-3">
            Hits works best with a collection of sound effects. Use the included AUDIO folder
            or download our free starter pack.
          </p>
          <div className="text-xs text-hits-muted">
            Expected structure:
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>assets/sfx/*.mp3 - Sound effects</li>
              <li>assets/images/*.jpg - B-roll images</li>
            </ul>
          </div>
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
            <input
              type="text"
              value={settings.outputDir}
              readOnly
              placeholder="Select folder..."
              className="input flex-1"
            />
            <button onClick={handleSelectOutputDir} className="btn-secondary">
              Browse
            </button>
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="flex items-center gap-2 text-hits-success">
            <CheckCircle size={18} />
            Settings saved
          </span>
        )}
        <button onClick={handleSave} className="btn-primary">
          <Save size={18} />
          Save Settings
        </button>
      </div>

      {/* Help links */}
      <section className="mt-8 card bg-hits-accent/5 border-hits-accent/20">
        <h2 className="text-lg font-semibold mb-4">Resources</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <button
            onClick={() => window.api.shell.openExternal('https://www.remotion.dev/docs')}
            className="flex items-center gap-2 text-hits-muted hover:text-hits-accent"
          >
            <ExternalLink size={14} />
            Remotion Docs
          </button>
          <button
            onClick={() => window.api.shell.openExternal('https://www.reactvideoeditor.com/remotion-templates')}
            className="flex items-center gap-2 text-hits-muted hover:text-hits-accent"
          >
            <ExternalLink size={14} />
            Edit Templates
          </button>
          <button
            onClick={() => window.api.shell.openExternal('https://console.anthropic.com')}
            className="flex items-center gap-2 text-hits-muted hover:text-hits-accent"
          >
            <ExternalLink size={14} />
            Claude Console
          </button>
          <button
            onClick={() => window.api.edits.openFolder()}
            className="flex items-center gap-2 text-hits-muted hover:text-hits-accent"
          >
            <FolderOpen size={14} />
            Open Edits Folder
          </button>
        </div>
      </section>
    </div>
  )
}


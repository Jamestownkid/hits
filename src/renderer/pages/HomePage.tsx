// HOME PAGE - mode selection and getting started
// this is where users pick their editing style

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, Zap, Sparkles, Clock, MonitorPlay, Smartphone, Square } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import clsx from 'clsx'

// 10 video modes with their vibes and EMOJIS
const videoModes = [
  { id: 'mrbeast', name: 'MrBeast', description: 'High energy with SFX', hits: '~40/min', icon: '💰', color: 'bg-red-500' },
  { id: 'lemmino', name: 'LEMMiNO', description: 'Smooth documentary', hits: '~20/min', icon: '🎬', color: 'bg-blue-600' },
  { id: 'tiktok', name: 'TikTok', description: 'Rapid fire edits', hits: '~55/min', icon: '📱', color: 'bg-pink-500' },
  { id: 'documentary', name: 'Documentary', description: 'Classic B-roll', hits: '~15/min', icon: '🎥', color: 'bg-amber-600' },
  { id: 'tutorial', name: 'Tutorial', description: 'Educational', hits: '~12/min', icon: '📚', color: 'bg-green-600' },
  { id: 'vox', name: 'Vox Explainer', description: 'Animated text', hits: '~25/min', icon: '📊', color: 'bg-yellow-500' },
  { id: 'truecrime', name: 'True Crime', description: 'Dark & dramatic', hits: '~18/min', icon: '🔍', color: 'bg-gray-700' },
  { id: 'gaming', name: 'Gaming', description: 'Fast montage', hits: '~50/min', icon: '🎮', color: 'bg-purple-600' },
  { id: 'podcast', name: 'Podcast', description: 'Minimal edits', hits: '~8/min', icon: '🎙️', color: 'bg-orange-500' },
  { id: 'aesthetic', name: 'Aesthetic', description: 'Chill vibes', hits: '~10/min', icon: '✨', color: 'bg-indigo-500' },
]

// output format options
const outputFormats = [
  { id: 'horizontal', icon: MonitorPlay, label: '16:9', desc: 'YouTube' },
  { id: 'vertical', icon: Smartphone, label: '9:16', desc: 'TikTok/Reels' },
  { id: 'square', icon: Square, label: '1:1', desc: 'Instagram' },
  { id: 'custom', icon: Square, label: '4:3', desc: 'Classic' },
]

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { createProject, projects, setCurrentProject, outputFormat, setOutputFormat } = useStore()
  const [editCount, setEditCount] = useState(0)

  // load edit count
  useEffect(() => {
    window.api.brain.getCount().then(setEditCount)
  }, [])

  // handle mode selection - create project and go to it
  const handleModeSelect = (modeId: string) => {
    const mode = videoModes.find((m) => m.id === modeId)
    createProject(`${mode?.name || 'New'} Project`, modeId)
    navigate('/project')
  }

  // handle recent project click
  const handleProjectClick = (project: any) => {
    setCurrentProject(project)
    navigate('/project')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold mb-3 bg-gradient-to-r from-hits-accent to-hits-accent-bright bg-clip-text text-transparent">
          Welcome to Hits
        </h1>
        <p className="text-hits-muted text-lg">
          Plugin-based video editing powered by AI. Drop in edits and let the brain figure out the rest.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-hits-accent">
            <Zap size={16} />
            <span>{editCount} edit plugins loaded</span>
          </div>
          <button
            onClick={() => window.api.edits.openFolder()}
            className="text-hits-muted hover:text-hits-text underline"
          >
            Open edits folder
          </button>
        </div>
      </div>

      {/* output format selection */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-hits-muted mb-3 uppercase tracking-wider">
          Output Format
        </h2>
        <div className="flex gap-3">
          {outputFormats.map((format) => {
            const Icon = format.icon
            return (
              <button
                key={format.id}
                onClick={() => setOutputFormat(format.id as any)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all',
                  outputFormat === format.id
                    ? 'border-hits-accent bg-hits-accent/10 text-hits-accent'
                    : 'border-hits-border hover:border-hits-accent/50'
                )}
              >
                <Icon size={20} />
                <div className="text-left">
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-hits-muted">{format.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* mode selection */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-hits-muted mb-3 uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={16} className="text-hits-accent" />
          Choose Your Style
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {videoModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.id)}
              className="card hover:border-hits-accent transition-all duration-200 text-left group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${mode.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-2xl`}
              >
                {mode.icon}
              </div>
              <h3 className="font-display font-semibold mb-1">{mode.name}</h3>
              <p className="text-xs text-hits-muted mb-2">{mode.description}</p>
              <div className="flex items-center gap-1 text-xs text-hits-accent">
                <Zap size={10} />
                {mode.hits}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* recent projects */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-hits-muted mb-3 uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} className="text-hits-accent" />
            Recent Projects
          </h2>
          <div className="space-y-2">
            {projects.slice(0, 5).map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="w-full card hover:border-hits-accent transition-colors flex items-center justify-between py-4"
              >
                <div className="text-left">
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-hits-muted">
                    {project.mode} · {project.status}
                  </p>
                </div>
                <div className="text-xs text-hits-muted">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* empty state */}
      {projects.length === 0 && (
        <section className="text-center py-12 card">
          <Film size={48} className="mx-auto text-hits-muted mb-4" />
          <p className="text-hits-muted">
            No projects yet. Pick a style above to start editing.
          </p>
        </section>
      )}
    </div>
  )
}


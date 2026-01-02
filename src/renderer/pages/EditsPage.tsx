// EDITS PAGE - browse all available edit plugins
// this is the edit browser where users can see whats loaded

import React, { useEffect, useState } from 'react'
import { Puzzle, RefreshCw, FolderOpen, ExternalLink, Search, Filter } from 'lucide-react'
import { useStore, EditInfo } from '../hooks/useStore'
import clsx from 'clsx'

// category colors for badges
const categoryColors: Record<string, string> = {
  motion: 'badge-motion',
  text: 'badge-text',
  audio: 'badge-audio',
  transition: 'badge-transition',
  effect: 'badge-effect',
  overlay: 'badge-overlay',
  background: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export const EditsPage: React.FC = () => {
  const { edits, setEdits, setEditCount } = useStore()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // load edits on mount
  useEffect(() => {
    loadEdits()
  }, [])

  const loadEdits = async () => {
    setLoading(true)
    const editList = await window.api.brain.getEdits()
    setEdits(editList)
    setEditCount(editList.length)
    setLoading(false)
  }

  // rescan edits folder
  const handleRescan = async () => {
    setLoading(true)
    await window.api.brain.rescan()
    await loadEdits()
  }

  // open edits folder
  const handleOpenFolder = () => {
    window.api.edits.openFolder()
  }

  // open remotion templates site
  const handleOpenTemplates = () => {
    window.api.shell.openExternal('https://www.reactvideoeditor.com/remotion-templates')
  }

  // get unique categories
  const categories = [...new Set(edits.map((e) => e.category))]

  // filter edits
  const filteredEdits = edits.filter((edit) => {
    const matchesSearch =
      !searchQuery ||
      edit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edit.triggers?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = !categoryFilter || edit.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // group by category
  const groupedEdits: Record<string, EditInfo[]> = {}
  for (const edit of filteredEdits) {
    if (!groupedEdits[edit.category]) {
      groupedEdits[edit.category] = []
    }
    groupedEdits[edit.category].push(edit)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Edit Plugins</h1>
          <p className="text-hits-muted">
            {edits.length} edits loaded · Drop new plugins in the /edits folder
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRescan} className="btn-secondary" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Rescan
          </button>
          <button onClick={handleOpenFolder} className="btn-secondary">
            <FolderOpen size={16} />
            Open Folder
          </button>
          <button onClick={handleOpenTemplates} className="btn-primary">
            <ExternalLink size={16} />
            Get More
          </button>
        </div>
      </div>

      {/* search and filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-hits-muted" />
          <input
            type="text"
            placeholder="Search edits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryFilter(null)}
            className={clsx(
              'px-3 py-2 rounded-lg border text-sm transition-colors',
              !categoryFilter
                ? 'border-hits-accent bg-hits-accent/10 text-hits-accent'
                : 'border-hits-border hover:border-hits-accent/50'
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
              className={clsx(
                'px-3 py-2 rounded-lg border text-sm transition-colors capitalize',
                cat === categoryFilter
                  ? 'border-hits-accent bg-hits-accent/10 text-hits-accent'
                  : 'border-hits-border hover:border-hits-accent/50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* edits grid */}
      {loading ? (
        <div className="text-center py-12">
          <Puzzle size={48} className="mx-auto text-hits-muted mb-4 animate-pulse" />
          <p className="text-hits-muted">Loading edits...</p>
        </div>
      ) : filteredEdits.length === 0 ? (
        <div className="text-center py-12 card">
          <Puzzle size={48} className="mx-auto text-hits-muted mb-4" />
          <p className="text-hits-muted mb-4">
            {searchQuery || categoryFilter
              ? 'No edits match your search'
              : 'No edits found - drop some plugins in /edits folder'}
          </p>
          <button onClick={handleOpenTemplates} className="btn-primary">
            Browse Templates
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEdits).map(([category, categoryEdits]) => (
            <section key={category}>
              <h2 className="text-sm font-semibold text-hits-muted mb-3 uppercase tracking-wider flex items-center gap-2">
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    category === 'motion' && 'bg-blue-500',
                    category === 'text' && 'bg-green-500',
                    category === 'audio' && 'bg-purple-500',
                    category === 'transition' && 'bg-orange-500',
                    category === 'effect' && 'bg-pink-500',
                    category === 'overlay' && 'bg-cyan-500'
                  )}
                />
                {category} ({categoryEdits.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryEdits.map((edit) => (
                  <div key={edit.id} className="card hover:border-hits-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{edit.name}</h3>
                        <span
                          className={clsx(
                            'inline-block px-2 py-0.5 rounded text-xs border mt-1',
                            categoryColors[edit.category]
                          )}
                        >
                          {edit.category}
                        </span>
                      </div>
                      {edit.version && (
                        <span className="text-xs text-hits-muted">v{edit.version}</span>
                      )}
                    </div>
                    <p className="text-sm text-hits-muted mb-3">{edit.description}</p>
                    
                    {/* props */}
                    {edit.props.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-hits-muted mb-1">Props:</p>
                        <div className="flex flex-wrap gap-1">
                          {edit.props.slice(0, 4).map((prop: any) => (
                            <span
                              key={prop.name}
                              className="px-2 py-0.5 bg-hits-bg rounded text-xs"
                            >
                              {prop.name}
                            </span>
                          ))}
                          {edit.props.length > 4 && (
                            <span className="px-2 py-0.5 bg-hits-bg rounded text-xs text-hits-muted">
                              +{edit.props.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* triggers */}
                    {edit.triggers && edit.triggers.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-hits-muted mb-1">Triggers:</p>
                        <div className="flex flex-wrap gap-1">
                          {edit.triggers.slice(0, 5).map((trigger) => (
                            <span
                              key={trigger}
                              className="px-2 py-0.5 bg-hits-accent/10 text-hits-accent rounded text-xs"
                            >
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* modes */}
                    {edit.modes && edit.modes.length > 0 && (
                      <div>
                        <p className="text-xs text-hits-muted mb-1">Modes:</p>
                        <div className="flex flex-wrap gap-1">
                          {edit.modes.map((mode) => (
                            <span
                              key={mode}
                              className="px-2 py-0.5 bg-hits-border rounded text-xs"
                            >
                              {mode}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* how to add edits */}
      <section className="mt-12 card bg-hits-accent/5 border-hits-accent/20">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Puzzle size={20} className="text-hits-accent" />
          Adding New Edits
        </h2>
        <div className="text-sm text-hits-muted space-y-2">
          <p>
            To add a new edit plugin, create two files in <code className="bg-hits-bg px-1 rounded">/edits/[category]/</code>:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code className="bg-hits-bg px-1 rounded">[name].tsx</code> - The Remotion component</li>
            <li><code className="bg-hits-bg px-1 rounded">[name].meta.json</code> - Metadata for the brain</li>
          </ul>
          <p className="pt-2">
            Check out{' '}
            <button onClick={handleOpenTemplates} className="text-hits-accent hover:underline">
              reactvideoeditor.com/remotion-templates
            </button>{' '}
            for ready-to-use effects.
          </p>
        </div>
      </section>
    </div>
  )
}


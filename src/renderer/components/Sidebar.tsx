// SIDEBAR - navigation and quick actions
// keeps things organized and accessible
// now with JOB TRACKER and ERROR LOG so u can see what's happening!!

import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, Film, Puzzle, Settings, ChevronLeft, ChevronRight, Zap,
  AlertCircle, Copy, Check, X, ChevronDown, ChevronUp, Trash2
} from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { JobTracker } from './JobTracker'
import clsx from 'clsx'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/project', icon: Film, label: 'Project' },
  { path: '/edits', icon: Puzzle, label: 'Edit Plugins' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

// ERROR LOG PANEL - shows all errors so users can copy em
const ErrorLogPanel: React.FC<{
  errors: string[]
  onClear: () => void
}> = ({ errors, onClear }) => {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  if (errors.length === 0) return null

  const handleCopy = async () => {
    const text = errors.join('\n\n---\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-t border-hits-border">
      {/* header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-hits-border/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <span className="text-sm font-medium text-red-400">
            {errors.length} Error{errors.length > 1 ? 's' : ''}
          </span>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* expanded error list */}
      {expanded && (
        <div className="px-2 pb-2">
          {/* action buttons */}
          <div className="flex gap-2 mb-2 px-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs bg-hits-border rounded hover:bg-hits-border/80 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={onClear}
              className="flex items-center justify-center gap-1 py-1.5 px-2 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>

          {/* error list */}
          <div className="max-h-48 overflow-auto space-y-2">
            {errors.map((err, i) => (
              <div
                key={i}
                className="bg-red-950/30 border border-red-500/20 rounded p-2 text-xs font-mono text-red-300 break-words"
              >
                {err}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    sidebarCollapsed, setSidebarCollapsed, 
    editCount, setEditCount,
    currentProject
  } = useStore()

  // error log state - collects all errors
  const [errorLog, setErrorLog] = useState<string[]>([])

  // listen for errors and add to log
  useEffect(() => {
    if (currentProject?.error) {
      setErrorLog(prev => {
        // don't add duplicates
        if (prev.includes(currentProject.error!)) return prev
        return [...prev, currentProject.error!]
      })
    }
  }, [currentProject?.error])

  // load edit count on mount
  useEffect(() => {
    window.api.brain.getCount().then(setEditCount)
  }, [setEditCount])

  const clearErrors = () => setErrorLog([])

  return (
    <div
      className={clsx(
        'h-full bg-hits-surface border-r border-hits-border flex flex-col transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* nav items */}
      <nav className="py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                isActive
                  ? 'bg-hits-accent/10 text-hits-accent border-r-2 border-hits-accent'
                  : 'text-hits-muted hover:bg-hits-border/50 hover:text-hits-text'
              )}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* JOB TRACKER - shows all running jobs so user can navigate away */}
      {!sidebarCollapsed && <JobTracker />}

      {/* spacer */}
      <div className="flex-1" />

      {/* ERROR LOG - shows errors so users can copy them */}
      {!sidebarCollapsed && (
        <ErrorLogPanel errors={errorLog} onClear={clearErrors} />
      )}

      {/* edit count indicator */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-hits-border">
          <div className="flex items-center gap-2 text-hits-muted text-xs">
            <Zap size={14} className="text-hits-accent" />
            <span>{editCount} edits loaded</span>
          </div>
        </div>
      )}

      {/* collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="p-4 border-t border-hits-border text-hits-muted hover:text-hits-text transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  )
}

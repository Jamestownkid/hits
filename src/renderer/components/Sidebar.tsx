// SIDEBAR - navigation and quick actions
// keeps things organized and accessible
// now with JOB TRACKER so u can see running processes!!

import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Film, Puzzle, Settings, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { JobTracker } from './JobTracker'
import clsx from 'clsx'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/project', icon: Film, label: 'Project' },
  { path: '/edits', icon: Puzzle, label: 'Edit Plugins' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, setSidebarCollapsed, editCount, setEditCount } = useStore()

  // load edit count on mount
  useEffect(() => {
    window.api.brain.getCount().then(setEditCount)
  }, [setEditCount])

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


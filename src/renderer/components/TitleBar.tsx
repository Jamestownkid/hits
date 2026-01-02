// TITLE BAR - custom window controls for that clean look
// draggable area + minimize/maximize/close buttons

import React, { useState, useEffect } from 'react'
import { Minus, Square, X, Maximize2 } from 'lucide-react'

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // check initial state
    window.api.window.isMaximized().then(setIsMaximized)
  }, [])

  const handleMinimize = () => window.api.window.minimize()
  
  const handleMaximize = async () => {
    const maximized = await window.api.window.maximize()
    setIsMaximized(maximized)
  }
  
  const handleClose = () => window.api.window.close()

  return (
    <div className="h-10 bg-hits-surface border-b border-hits-border flex items-center justify-between px-4 drag-region">
      {/* logo and title */}
      <div className="flex items-center gap-3 no-drag">
        <div className="w-6 h-6 rounded bg-hits-accent flex items-center justify-center">
          <span className="text-white font-bold text-xs">H</span>
        </div>
        <span className="font-display font-semibold text-sm tracking-wide">HITS</span>
        <span className="text-hits-muted text-xs">v1.0</span>
      </div>

      {/* window controls */}
      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-hits-border text-hits-muted hover:text-hits-text transition-colors"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-hits-border text-hits-muted hover:text-hits-text transition-colors"
        >
          {isMaximized ? <Square size={12} /> : <Maximize2 size={14} />}
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-hits-error text-hits-muted hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}


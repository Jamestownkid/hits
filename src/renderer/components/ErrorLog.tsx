// ERROR LOG - shows errors so users can see and copy them
// cause debugging is a pain without this

import React, { useState } from 'react'
import { AlertCircle, Copy, Check, X, ChevronDown, ChevronUp } from 'lucide-react'

interface ErrorLogProps {
  errors: string[]
  onClear: () => void
}

export const ErrorLog: React.FC<ErrorLogProps> = ({ errors, onClear }) => {
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
    <div className="fixed bottom-4 right-4 w-96 bg-red-950/95 border border-red-500/50 rounded-xl shadow-2xl z-50 backdrop-blur">
      {/* header */}
      <div className="flex items-center justify-between p-3 border-b border-red-500/30">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={18} />
          <span className="font-semibold">{errors.length} Error{errors.length > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
            title="Copy errors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={onClear}
            className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
            title="Clear errors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* error list */}
      {expanded && (
        <div className="max-h-64 overflow-auto p-3 space-y-2">
          {errors.map((err, i) => (
            <div key={i} className="bg-red-900/50 rounded-lg p-3 text-sm font-mono text-red-200 whitespace-pre-wrap break-words">
              {err}
            </div>
          ))}
        </div>
      )}

      {/* collapsed preview */}
      {!expanded && (
        <div className="p-3">
          <p className="text-sm text-red-300 truncate">{errors[errors.length - 1]}</p>
          <p className="text-xs text-red-500 mt-1">Click ↑ to expand • Click copy to share</p>
        </div>
      )}
    </div>
  )
}


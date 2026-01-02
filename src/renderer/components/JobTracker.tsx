// JOB TRACKER - shows running jobs so u can navigate away and come back
// yo this was a pain but now u can see ur stuff processing in the background

import React from 'react'
import { useStore, Project } from '../hooks/useStore'
import { useNavigate } from 'react-router-dom'

const statusColors: Record<Project['status'], string> = {
  idle: 'bg-gray-500',
  transcribing: 'bg-blue-500 animate-pulse',
  generating: 'bg-purple-500 animate-pulse',
  rendering: 'bg-orange-500 animate-pulse',
  complete: 'bg-green-500',
  error: 'bg-red-500',
}

const statusText: Record<Project['status'], string> = {
  idle: 'Waiting',
  transcribing: 'Transcribing...',
  generating: 'Generating...',
  rendering: 'Rendering...',
  complete: 'Done!',
  error: 'Error',
}

const statusEmoji: Record<Project['status'], string> = {
  idle: '⏸️',
  transcribing: '🎤',
  generating: '🧠',
  rendering: '🎬',
  complete: '✅',
  error: '❌',
}

export const JobTracker: React.FC = () => {
  const { projects, currentProject, setCurrentProject } = useStore()
  const navigate = useNavigate()

  // show jobs that are actively doing something or recently completed
  const activeJobs = projects.filter(
    (p) => p.status !== 'idle' || p.transcript || p.manifest
  )

  if (activeJobs.length === 0) {
    return (
      <div className="p-3 border-t border-hits-border">
        <div className="text-xs text-gray-500 mb-2">ACTIVE JOBS</div>
        <div className="text-xs text-gray-600 italic">No jobs running</div>
      </div>
    )
  }

  const handleJobClick = (project: Project) => {
    setCurrentProject(project)
    navigate('/project')
  }

  return (
    <div className="p-3 border-t border-hits-border">
      <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
        ACTIVE JOBS
        {activeJobs.some((j) => ['transcribing', 'generating', 'rendering'].includes(j.status)) && (
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {activeJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => handleJobClick(job)}
            className={`w-full text-left p-2 rounded-lg transition-all hover:bg-hits-hover ${
              currentProject?.id === job.id ? 'bg-hits-hover ring-1 ring-hits-accent' : 'bg-hits-card'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{statusEmoji[job.status]}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{job.name || 'Untitled'}</div>
                <div className="text-xs text-gray-500 truncate">{job.mode}</div>
              </div>
              <span className={`w-2 h-2 rounded-full ${statusColors[job.status]}`} />
            </div>
            
            {/* progress bar for active jobs */}
            {['transcribing', 'generating', 'rendering'].includes(job.status) && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{statusText[job.status]}</span>
                  <span>{Math.round(job.progress)}%</span>
                </div>
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      job.status === 'transcribing'
                        ? 'bg-blue-500'
                        : job.status === 'generating'
                        ? 'bg-purple-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* show error if any */}
            {job.status === 'error' && job.error && (
              <div className="mt-1 text-xs text-red-400 truncate">{job.error}</div>
            )}

            {/* show completion for done jobs */}
            {job.status === 'complete' && (
              <div className="mt-1 text-xs text-green-400">Ready to export!</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}


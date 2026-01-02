// HITS APP - main app component with routing
// this is the shell that wraps everything

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { HomePage } from './pages/HomePage'
import { ProjectPage } from './pages/ProjectPage'
import { EditsPage } from './pages/EditsPage'
import { SettingsPage } from './pages/SettingsPage'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen flex flex-col bg-hits-bg text-hits-text overflow-hidden">
        {/* custom title bar - draggable with window controls */}
        <TitleBar />

        <div className="flex flex-1 overflow-hidden">
          {/* sidebar navigation */}
          <Sidebar />

          {/* main content area */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/project" element={<ProjectPage />} />
              <Route path="/edits" element={<EditsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App


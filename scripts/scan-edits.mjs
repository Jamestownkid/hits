#!/usr/bin/env node
// SCAN EDITS - shows what edit plugins are loaded
// run with: npm run edits:scan

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

const editsDir = path.join(process.cwd(), 'edits')

console.log('\\n🧠 HITS BRAIN - Edit Scanner\\n')
console.log('Scanning:', editsDir)
console.log('=' .repeat(50))

if (!fs.existsSync(editsDir)) {
  console.log('\\n❌ No edits folder found!')
  console.log('   Create /edits folder and add some plugins')
  process.exit(1)
}

const metaFiles = await glob('**/*.meta.json', { cwd: editsDir })

if (metaFiles.length === 0) {
  console.log('\\n❌ No edit plugins found!')
  console.log('   Add .tsx + .meta.json files to /edits')
  process.exit(1)
}

// group by category
const categories = {}

for (const metaFile of metaFiles) {
  try {
    const fullPath = path.join(editsDir, metaFile)
    const meta = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
    
    const componentPath = fullPath.replace('.meta.json', '.tsx')
    const hasComponent = fs.existsSync(componentPath)
    
    if (!categories[meta.category]) {
      categories[meta.category] = []
    }
    
    categories[meta.category].push({
      ...meta,
      hasComponent,
      file: metaFile
    })
  } catch (err) {
    console.log(`\\n⚠️  Error loading ${metaFile}:`, err.message)
  }
}

// print results
let total = 0

for (const [category, edits] of Object.entries(categories)) {
  console.log(`\\n📦 ${category.toUpperCase()} (${edits.length})`)
  
  for (const edit of edits) {
    const status = edit.hasComponent ? '✅' : '❌'
    console.log(`   ${status} ${edit.id} - ${edit.name}`)
    if (edit.triggers?.length) {
      console.log(`      triggers: ${edit.triggers.slice(0, 5).join(', ')}`)
    }
    total++
  }
}

console.log('\\n' + '='.repeat(50))
console.log(`\\n🎬 Total: ${total} edits loaded`)
console.log('\\n')


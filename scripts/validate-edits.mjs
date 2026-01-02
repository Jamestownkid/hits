#!/usr/bin/env node
// VALIDATE EDITS - checks for issues with edit plugins
// run with: npm run edits:validate

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

const editsDir = path.join(process.cwd(), 'edits')

console.log('\\n🔍 HITS BRAIN - Edit Validator\\n')
console.log('Validating:', editsDir)
console.log('=' .repeat(50))

const metaFiles = await glob('**/*.meta.json', { cwd: editsDir })

let errors = 0
let warnings = 0

for (const metaFile of metaFiles) {
  const fullPath = path.join(editsDir, metaFile)
  const componentPath = fullPath.replace('.meta.json', '.tsx')
  
  console.log(`\\n📄 ${metaFile}`)
  
  // check component exists
  if (!fs.existsSync(componentPath)) {
    console.log('   ❌ ERROR: Missing component file')
    console.log(`      Expected: ${componentPath}`)
    errors++
    continue
  }
  
  try {
    const meta = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
    
    // required fields
    const required = ['id', 'name', 'category', 'description', 'props']
    for (const field of required) {
      if (!meta[field]) {
        console.log(`   ❌ ERROR: Missing required field: ${field}`)
        errors++
      }
    }
    
    // valid category
    const validCategories = ['motion', 'text', 'audio', 'transition', 'effect', 'overlay', 'background']
    if (!validCategories.includes(meta.category)) {
      console.log(`   ⚠️  WARNING: Unknown category: ${meta.category}`)
      warnings++
    }
    
    // props validation
    if (Array.isArray(meta.props)) {
      for (const prop of meta.props) {
        if (!prop.name || !prop.type) {
          console.log(`   ⚠️  WARNING: Prop missing name or type`)
          warnings++
        }
        
        const validTypes = ['number', 'string', 'boolean', 'color', 'file', 'select']
        if (prop.type && !validTypes.includes(prop.type)) {
          console.log(`   ⚠️  WARNING: Unknown prop type: ${prop.type}`)
          warnings++
        }
        
        if (prop.type === 'select' && (!prop.options || !Array.isArray(prop.options))) {
          console.log(`   ❌ ERROR: Select prop ${prop.name} missing options array`)
          errors++
        }
      }
    }
    
    // recommendations
    if (!meta.triggers || meta.triggers.length === 0) {
      console.log('   💡 TIP: Add triggers so Claude knows when to use this edit')
    }
    
    if (!meta.modes || meta.modes.length === 0) {
      console.log('   💡 TIP: Add modes to specify which video styles use this edit')
    }
    
    if (errors === 0) {
      console.log('   ✅ Valid')
    }
    
  } catch (err) {
    console.log(`   ❌ ERROR: Invalid JSON: ${err.message}`)
    errors++
  }
}

console.log('\\n' + '='.repeat(50))
console.log(`\\n📊 Results: ${errors} errors, ${warnings} warnings`)

if (errors > 0) {
  console.log('\\n❌ Validation failed - fix errors before running')
  process.exit(1)
} else {
  console.log('\\n✅ All edits valid!')
}
console.log('\\n')


#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Run with: npm run analyze-bundle
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Analyzing bundle performance...\n')

try {
  // Build the application
  console.log('📦 Building application...')
  execSync('npm run build', { stdio: 'inherit' })

  // Check if .next directory exists
  const nextDir = path.join(process.cwd(), '.next')
  if (!fs.existsSync(nextDir)) {
    console.error('❌ .next directory not found. Make sure the build completed successfully.')
    process.exit(1)
  }

  // Analyze static files
  console.log('\n📊 Bundle Analysis:')

  // Get all JS files in .next/static
  const staticDir = path.join(nextDir, 'static')
  if (fs.existsSync(staticDir)) {
    const getFileSize = (filePath) => {
      try {
        return fs.statSync(filePath).size
      } catch {
        return 0
      }
    }

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Analyze chunks
    const chunksDir = path.join(staticDir, 'chunks')
    let chunkFiles = []

    if (fs.existsSync(chunksDir)) {
      chunkFiles = fs.readdirSync(chunksDir)
        .filter(file => file.endsWith('.js'))
        .map(file => ({
          name: file,
          size: getFileSize(path.join(chunksDir, file))
        }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 10) // Top 10 largest chunks

      console.log('\n📦 Largest JavaScript Chunks:')
      chunkFiles.forEach((chunk, index) => {
        console.log(`  ${index + 1}. ${chunk.name}: ${formatBytes(chunk.size)}`)
      })
    }

    // Analyze total bundle size
    const walkDir = (dir) => {
      let totalSize = 0
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          totalSize += walkDir(filePath)
        } else if (file.endsWith('.js') || file.endsWith('.css')) {
          totalSize += stat.size
        }
      }

      return totalSize
    }

    const totalBundleSize = walkDir(staticDir)
    console.log(`\n💾 Total Bundle Size: ${formatBytes(totalBundleSize)}`)

    // Performance recommendations
    console.log('\n💡 Performance Recommendations:')

    if (totalBundleSize > 1024 * 1024) { // > 1MB
      console.log('⚠️  Bundle size is large. Consider code splitting and lazy loading.')
    }

    if (chunkFiles && chunkFiles[0]?.size > 512 * 1024) { // > 512KB
      console.log('⚠️  Largest chunk is very big. Consider breaking it into smaller chunks.')
    }

    console.log('✅ Consider using dynamic imports for heavy components')
    console.log('✅ Enable gzip/brotli compression on your hosting platform')
    console.log('✅ Use next/image for image optimization')
    console.log('✅ Consider implementing service worker for caching')
  }

} catch (error) {
  console.error('❌ Error during analysis:', error.message)
  process.exit(1)
}

console.log('\n✨ Analysis complete!')
#!/usr/bin/env node

/**
 * Development server with file watching and auto-rebuild
 */

import http from 'http'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'
import mimeTypes from 'mime-types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.join(__dirname, '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')

class DevServer {
  constructor(port = 3002) {
    this.port = port
    this.isBuilding = false
  }

  async start() {
    // Initial build
    await this.rebuild()
    
    // Start file watcher
    this.setupWatcher()
    
    // Start HTTP server
    this.server = http.createServer(this.handleRequest.bind(this))
    
    this.server.listen(this.port, () => {
      console.log(`🚀 Dev server running at http://localhost:${this.port}`)
      console.log(`📁 Serving files from: ${DIST_DIR}`)
      console.log(`👀 Watching for changes...`)
    })
  }

  setupWatcher() {
    const watcher = chokidar.watch([
      path.join(ROOT_DIR, 'content'),
      path.join(ROOT_DIR, 'templates'),
      path.join(ROOT_DIR, 'assets'),
      path.join(ROOT_DIR, 'build')
    ], {
      ignored: /node_modules/,
      persistent: true
    })

    watcher.on('change', async (filePath) => {
      console.log(`📝 File changed: ${path.relative(ROOT_DIR, filePath)}`)
      await this.rebuild()
    })

    watcher.on('add', async (filePath) => {
      console.log(`➕ File added: ${path.relative(ROOT_DIR, filePath)}`)
      await this.rebuild()
    })

    watcher.on('unlink', async (filePath) => {
      console.log(`🗑️  File deleted: ${path.relative(ROOT_DIR, filePath)}`)
      await this.rebuild()
    })
  }

  async rebuild() {
    if (this.isBuilding) return
    
    this.isBuilding = true
    try {
      console.log('🔄 Rebuilding...')
      
      // Import and run the build script
      const { BlogBuilder } = await import(`./index.js?${Date.now()}`)
      const builder = new BlogBuilder()
      await builder.build()
      
      console.log('✅ Rebuild complete')
    } catch (error) {
      console.error('❌ Build failed:', error.message)
    } finally {
      this.isBuilding = false
    }
  }

  async handleRequest(req, res) {
    try {
      let filePath = req.url === '/' ? '/index.html' : req.url
      
      // Remove query parameters
      filePath = filePath.split('?')[0]
      
      // Security: prevent directory traversal
      if (filePath.includes('..')) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }
      
      const fullPath = path.join(DIST_DIR, filePath)
      
      try {
        const content = await fs.readFile(fullPath)
        const mimeType = mimeTypes.lookup(fullPath) || 'text/plain'
        
        res.writeHead(200, {
          'Content-Type': mimeType,
          'Cache-Control': 'no-cache'
        })
        res.end(content)
      } catch (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404)
          res.end('Not Found')
        } else {
          res.writeHead(500)
          res.end('Internal Server Error')
        }
      }
    } catch (error) {
      res.writeHead(500)
      res.end('Internal Server Error')
    }
  }

  stop() {
    if (this.server) {
      this.server.close()
    }
  }
}

// Start dev server if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DevServer()
  await server.start()
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down dev server...')
    server.stop()
    process.exit(0)
  })
}
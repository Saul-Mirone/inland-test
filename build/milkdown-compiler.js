#!/usr/bin/env node

/**
 * Milkdown Compiler
 * Converts markdown files to HTML using the same Milkdown pipeline
 * as the Inland CMS editor, ensuring visual consistency between
 * editing and published output.
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import fm from 'front-matter'
import { JSDOM } from 'jsdom'

// Create a full browser-like DOM environment for Milkdown / ProseMirror
const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="app"></div></body></html>',
  {
    url: 'http://localhost',
    pretendToBeVisual: true,
  }
)

// Polyfill globals that Milkdown and ProseMirror expect
// Proxy globalThis to fall back to dom.window for missing browser APIs
const originalGlobalThis = { ...globalThis }
const handler = {
  get(target, prop) {
    if (prop in target) return target[prop]
    if (prop in dom.window) return dom.window[prop]
    return undefined
  },
}

// Set key DOM globals explicitly (ProseMirror and Milkdown check these)
const domGlobals = [
  'document',
  'Node',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLTextAreaElement',
  'DOMParser',
  'MutationObserver',
  'customElements',
  'Element',
  'DocumentFragment',
  'Text',
  'Comment',
  'Range',
  'getSelection',
  'getComputedStyle',
  'ResizeObserver',
  'IntersectionObserver',
  'Event',
  'CustomEvent',
  'KeyboardEvent',
  'MouseEvent',
  'ClipboardEvent',
  'InputEvent',
  'FocusEvent',
  'DragEvent',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]

for (const key of domGlobals) {
  const value = dom.window[key]
  if (value !== undefined) {
    try {
      Object.defineProperty(globalThis, key, {
        value,
        writable: true,
        configurable: true,
      })
    } catch {
      // skip read-only
    }
  }
}

// navigator and window need special handling
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    writable: true,
    configurable: true,
  })
} catch {
  // already defined
}

// window must reference dom.window, not globalThis (avoids circular ref)
try {
  Object.defineProperty(globalThis, 'window', {
    value: dom.window,
    writable: true,
    configurable: true,
  })
} catch {
  // already defined
}

// Bare function calls that delegate to window
globalThis.addEventListener = dom.window.addEventListener.bind(dom.window)
globalThis.removeEventListener =
  dom.window.removeEventListener.bind(dom.window)
globalThis.dispatchEvent = dom.window.dispatchEvent.bind(dom.window)

// Now import Milkdown after DOM is set up
const { Editor, defaultValueCtx, rootCtx } = await import(
  '@milkdown/kit/core'
)
const { commonmark } = await import('@milkdown/kit/preset/commonmark')
const { gfm } = await import('@milkdown/kit/preset/gfm')
const { getHTML } = await import('@milkdown/kit/utils')
const { imageBlockSchema, remarkImageBlockPlugin } = await import(
  '@milkdown/kit/component/image-block'
)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

/**
 * Renders markdown to HTML using Milkdown.
 * Uses the same commonmark + gfm plugins as the CMS Crepe editor.
 */
async function renderMarkdown(markdown) {
  const root = document.getElementById('app')
  root.innerHTML = ''

  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, markdown)
    })
    .use(commonmark)
    .use(gfm)
    .use(remarkImageBlockPlugin)
    .use(imageBlockSchema)

  await editor.create()

  const html = editor.action(getHTML())

  await editor.destroy()

  return html
}

class MilkdownCompiler {
  constructor(inputDir = 'content', outputDir = '.compiled') {
    this.inputDir = inputDir
    this.outputDir = outputDir
  }

  async compile() {
    console.log('🥛 Starting milkdown compilation...')

    try {
      await ensureDir(this.outputDir)

      const files = await fs.readdir(this.inputDir)
      const markdownFiles = files.filter((file) => file.endsWith('.md'))

      if (markdownFiles.length === 0) {
        console.log('📝 No markdown files found to compile')
        return
      }

      console.log(`📁 Found ${markdownFiles.length} markdown files`)

      for (const file of markdownFiles) {
        await this.compileFile(file)
      }

      console.log('✅ Milkdown compilation completed successfully!')
    } catch (error) {
      console.error('❌ Compilation failed:', error.message)
      process.exit(1)
    }
  }

  async compileFile(filename) {
    try {
      const inputPath = path.join(this.inputDir, filename)
      const content = await fs.readFile(inputPath, 'utf-8')

      const parsed = fm(content)
      const frontmatter = parsed.attributes
      const markdownBody = parsed.body

      console.log(`🔄 Compiling ${filename}...`)

      const htmlContent = await renderMarkdown(markdownBody)

      const compiledContent = this.createCompiledContent(
        frontmatter,
        htmlContent
      )

      const outputFilename = filename.replace(/\.md$/, '.html')
      const outputPath = path.join(this.outputDir, outputFilename)

      await fs.writeFile(outputPath, compiledContent, 'utf-8')

      console.log(`✅ Compiled ${filename} → ${outputFilename}`)
    } catch (error) {
      console.error(`❌ Failed to compile ${filename}:`, error.message)
      throw error
    }
  }

  createCompiledContent(frontmatter, htmlContent) {
    const frontmatterLines = Object.entries(frontmatter).map(
      ([key, value]) => {
        if (value instanceof Date) {
          return `${key}: ${value.toISOString().split('T')[0]}`
        }
        return `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`
      }
    )

    const frontmatterSection = frontmatterLines.join('\n')

    return `---
${frontmatterSection}
---
<!-- CONTENT_START -->
${htmlContent}`
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)

  let inputDir = 'content'
  let outputDir = '.compiled'

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      inputDir = args[i + 1]
      i++
    } else if (args[i] === '--output' && args[i + 1]) {
      outputDir = args[i + 1]
      i++
    } else if (args[i] === '--help') {
      console.log(`
Milkdown Compiler

Usage:
  node milkdown-compiler.js [options]

Options:
  --input <dir>   Input directory containing .md files (default: content)
  --output <dir>  Output directory for compiled .html files (default: content)
  --help          Show this help message
`)
      process.exit(0)
    }
  }

  const compiler = new MilkdownCompiler(inputDir, outputDir)
  await compiler.compile()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}

export { MilkdownCompiler, renderMarkdown }

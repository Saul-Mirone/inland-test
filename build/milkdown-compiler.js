#!/usr/bin/env node

/**
 * Milkdown Compiler
 * Processes markdown files and converts them to HTML
 * 
 * TODO: Replace the renderMarkdown function with your actual milkdown implementation
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import fm from 'front-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Core rendering function - REPLACE THIS WITH YOUR MILKDOWN IMPLEMENTATION
 * @param {string} markdown - Raw markdown content
 * @returns {string} - Compiled HTML content
 */
function renderMarkdown(markdown) {
    // TODO: Replace this with your actual milkdown rendering logic
    // For now, just return the markdown as escaped HTML for safety
    return `<pre style="white-space: pre-wrap; font-family: inherit; background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e9ecef;">${escapeHtml(markdown)}</pre>`
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
}

async function ensureDir(dirPath) {
    try {
        await fs.access(dirPath)
    } catch {
        await fs.mkdir(dirPath, { recursive: true })
    }
}

class MilkdownCompiler {
    constructor(inputDir = 'content', outputDir = 'content') {
        this.inputDir = inputDir
        this.outputDir = outputDir
    }

    async compile() {
        console.log('🥛 Starting milkdown compilation...')
        
        try {
            await ensureDir(this.outputDir)
            
            const files = await fs.readdir(this.inputDir)
            const markdownFiles = files.filter(file => file.endsWith('.md'))
            
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
            
            // Parse frontmatter
            const parsed = fm(content)
            const frontmatter = parsed.attributes
            const markdownBody = parsed.body
            
            // All files pushed to GitHub should be compiled
            // (draft management is handled in the CMS, not in the repository)
            
            console.log(`🔄 Compiling ${filename}...`)
            
            // Render markdown to HTML using your milkdown implementation
            const htmlContent = renderMarkdown(markdownBody)
            
            // Create the compiled file content
            const compiledContent = this.createCompiledContent(frontmatter, htmlContent)
            
            // Write to output file (change extension to .html)
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
        // Create frontmatter section
        const frontmatterLines = Object.entries(frontmatter).map(([key, value]) => {
            return `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`
        })
        
        const frontmatterSection = frontmatterLines.join('\n')
        
        // Combine frontmatter and content with the expected format
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
    let outputDir = 'content'
    
    // Simple argument parsing
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

Examples:
  node milkdown-compiler.js
  node milkdown-compiler.js --input content --output dist/content
`)
            process.exit(0)
        }
    }
    
    const compiler = new MilkdownCompiler(inputDir, outputDir)
    await compiler.compile()
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    await main()
}

export { MilkdownCompiler, renderMarkdown }
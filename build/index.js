#!/usr/bin/env node

/**
 * Main build script for the blog
 * Processes markdown files that have been pre-compiled to HTML by milkdown compiler
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { TemplateEngine } from './template-engine.js'
import { copyAssets, ensureDir, formatDate } from './utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.join(__dirname, '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')
const CONTENT_DIR = path.join(ROOT_DIR, 'content')

class BlogBuilder {
  constructor() {
    this.templateEngine = new TemplateEngine()
    this.siteConfig = {
      name: '{{SITE_NAME}}',
      description: '{{SITE_DESCRIPTION}}',
      url: 'https://{{GITHUB_USERNAME}}.github.io/{{SITE_NAME_SLUG}}',
      author: '{{SITE_AUTHOR}}'
    }
  }

  async build() {
    console.log('🚀 Building blog...')
    
    try {
      // 1. Clean and create dist directory
      await this.cleanDist()
      
      // 2. Copy static assets
      await this.copyAssets()
      
      // 3. Load articles (either HTML or markdown)
      const articles = await this.loadArticles()
      
      // 4. Generate article pages
      await this.generateArticlePages(articles)
      
      // 5. Generate index page
      await this.generateIndexPage(articles)
      
      // 6. Generate RSS feed
      await this.generateRSSFeed(articles)
      
      console.log('✅ Build completed successfully!')
      console.log(`📁 Generated ${articles.length} articles`)
      console.log(`📍 Output directory: ${DIST_DIR}`)
      
    } catch (error) {
      console.error('❌ Build failed:', error)
      process.exit(1)
    }
  }

  async cleanDist() {
    await fs.rm(DIST_DIR, { recursive: true, force: true })
    await ensureDir(DIST_DIR)
    await ensureDir(path.join(DIST_DIR, 'articles'))
  }

  async copyAssets() {
    console.log('📋 Copying assets...')
    await copyAssets(
      path.join(ROOT_DIR, 'assets'),
      DIST_DIR
    )
  }

  async loadArticles() {
    console.log('📚 Loading articles...')
    
    try {
      const contentExists = await fs.access(CONTENT_DIR).then(() => true).catch(() => false)
      if (!contentExists) {
        console.log('📝 No content directory found, creating sample articles...')
        await this.createSampleContent()
      }

      const files = await fs.readdir(CONTENT_DIR)
      const contentFiles = files.filter(file => file.endsWith('.html'))
      
      const articles = []
      
      for (const file of contentFiles) {
        try {
          const filePath = path.join(CONTENT_DIR, file)
          const content = await fs.readFile(filePath, 'utf-8')
          
          // All content files should be pre-compiled HTML from milkdown compiler
          const article = await this.parseCompiledArticle(content, file)
          
          // All files pushed to GitHub should be included in the build
          // (draft management is handled in the CMS, not in the repository)
          articles.push(article)
        } catch (error) {
          console.warn(`⚠️ Failed to process ${file}:`, error.message)
        }
      }
      
      // Sort by date (newest first)
      articles.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
      
      return articles
    } catch (error) {
      console.warn('⚠️ Error loading articles:', error.message)
      return []
    }
  }

  async parseCompiledArticle(content, filename) {
    // HTML files compiled by milkdown should have frontmatter at the top
    // followed by <!-- CONTENT_START --> and the HTML content
    const lines = content.split('\n')
    let frontmatterEnd = -1
    let contentStart = -1
    
    // Find frontmatter boundaries
    if (lines[0] === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '---') {
          frontmatterEnd = i
          break
        }
      }
    }
    
    // Find content start marker
    for (let i = frontmatterEnd + 1; i < lines.length; i++) {
      if (lines[i].includes('<!-- CONTENT_START -->')) {
        contentStart = i + 1
        break
      }
    }
    
    if (frontmatterEnd === -1 || contentStart === -1) {
      throw new Error(`Invalid compiled article format: ${filename}`)
    }
    
    // Parse frontmatter
    const frontmatterText = lines.slice(1, frontmatterEnd).join('\n')
    const frontmatter = this.parseFrontmatter(frontmatterText)
    
    // Extract HTML content
    const htmlContent = lines.slice(contentStart).join('\n')
    
    const slug = filename.replace(/\.(html|md)$/, '')
    
    return {
      slug,
      frontmatter,
      html: htmlContent,
      isCompiled: true
    }
  }

  parseFrontmatter(text) {
    const frontmatter = {}
    const lines = text.split('\n')
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/)
      if (match) {
        const [, key, value] = match
        frontmatter[key] = value.replace(/^["']|["']$/g, '') // Remove quotes
      }
    }
    
    return frontmatter
  }

  async createSampleContent() {
    await ensureDir(CONTENT_DIR)
    
    const sampleArticles = [
      {
        filename: 'welcome.md',
        content: `---
title: Welcome to Your New Blog
date: ${new Date().toISOString().split('T')[0]}
status: published
excerpt: Welcome to your new blog powered by Inland! This is your first article.
---

# Welcome to Your New Blog

Congratulations! You've successfully created your new blog using **Inland**.

This template is designed to work with your custom milkdown compiler. When you publish articles through Inland:

1. **Markdown is stored** in your CMS database
2. **Content is pushed** to this GitHub repository
3. **GitHub Actions runs** your milkdown compiler
4. **Static HTML is generated** for maximum performance
5. **Your blog is deployed** to GitHub Pages

## Key Features

- ✅ **Custom markdown rendering** with milkdown
- ✅ **GitHub Actions automation** for compilation
- ✅ **Static file performance** 
- ✅ **Theme customization** with simple templates

## Template Structure

\`\`\`
template/
├── content/           # Article content (markdown/HTML)
├── templates/         # Page templates
├── assets/           # Styles, scripts, images
├── build/            # Build scripts
└── .github/workflows/ # Compilation automation
\`\`\`

**Happy blogging!** 🎉`
      }
    ]

    for (const article of sampleArticles) {
      const filePath = path.join(CONTENT_DIR, article.filename)
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false)
      
      if (!fileExists) {
        await fs.writeFile(
          filePath,
          article.content,
          'utf-8'
        )
      }
    }
    
    console.log('📝 Created sample articles')
  }

  async generateArticlePages(articles) {
    console.log('📄 Generating article pages...')
    
    for (const article of articles) {
      const html = await this.templateEngine.render('article', {
        ...this.siteConfig,
        article: {
          ...article.frontmatter,
          content: article.html,
          formattedDate: formatDate(article.frontmatter.date),
          isCompiled: article.isCompiled || false
        }
      })
      
      const outputPath = path.join(DIST_DIR, 'articles', `${article.slug}.html`)
      await fs.writeFile(outputPath, html, 'utf-8')
    }
  }

  async generateIndexPage(articles) {
    console.log('🏠 Generating index page...')
    
    const recentArticles = articles.slice(0, 10).map(article => ({
      ...article.frontmatter,
      slug: article.slug,
      formattedDate: formatDate(article.frontmatter.date)
    }))
    
    const html = await this.templateEngine.render('index', {
      ...this.siteConfig,
      articles: recentArticles
    })
    
    await fs.writeFile(path.join(DIST_DIR, 'index.html'), html, 'utf-8')
  }

  async generateRSSFeed(articles) {
    console.log('📡 Generating RSS feed...')
    
    const rssItems = articles.slice(0, 20).map(article => {
      const pubDate = new Date(article.frontmatter.date).toUTCString()
      const link = `${this.siteConfig.url}/articles/${article.slug}.html`
      
      return `
    <item>
      <title><![CDATA[${article.frontmatter.title}]]></title>
      <description><![CDATA[${article.frontmatter.excerpt || ''}]]></description>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`
    }).join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${this.siteConfig.name}</title>
    <description>${this.siteConfig.description}</description>
    <link>${this.siteConfig.url}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en-US</language>${rssItems}
  </channel>
</rss>`

    await fs.writeFile(path.join(DIST_DIR, 'rss.xml'), rss, 'utf-8')
  }
}

// Export the BlogBuilder class
export { BlogBuilder }

// Run the build if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new BlogBuilder()
  await builder.build()
}
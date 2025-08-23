/**
 * Simple template engine using Mustache
 * Handles rendering of HTML templates with data
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import Mustache from 'mustache'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates')

export class TemplateEngine {
  constructor() {
    this.templates = new Map()
    this.partials = new Map()
  }

  async loadTemplate(name) {
    if (this.templates.has(name)) {
      return this.templates.get(name)
    }

    try {
      const templatePath = path.join(TEMPLATES_DIR, `${name}.html`)
      const content = await fs.readFile(templatePath, 'utf-8')
      this.templates.set(name, content)
      return content
    } catch (error) {
      throw new Error(`Template not found: ${name}.html`)
    }
  }

  async loadPartial(name) {
    if (this.partials.has(name)) {
      return this.partials.get(name)
    }

    try {
      const partialPath = path.join(TEMPLATES_DIR, 'partials', `${name}.html`)
      const content = await fs.readFile(partialPath, 'utf-8')
      this.partials.set(name, content)
      return content
    } catch (error) {
      // Partials are optional
      return ''
    }
  }

  async render(templateName, data) {
    const template = await this.loadTemplate(templateName)
    
    // Load all partials
    const partials = {}
    try {
      const partialsDir = path.join(TEMPLATES_DIR, 'partials')
      const partialFiles = await fs.readdir(partialsDir)
      
      for (const file of partialFiles) {
        if (file.endsWith('.html')) {
          const name = file.replace('.html', '')
          partials[name] = await this.loadPartial(name)
        }
      }
    } catch (error) {
      // No partials directory
    }

    return Mustache.render(template, data, partials)
  }

  clearCache() {
    this.templates.clear()
    this.partials.clear()
  }
}
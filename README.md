# Basic Blog Template for Inland CMS

A clean, modern, and performant blog template designed for Inland CMS with custom milkdown rendering support.

## 🚀 Features

- ✅ **Custom Markdown Rendering** - Designed to work with your milkdown compiler
- ✅ **GitHub Actions Integration** - Automatic compilation and deployment
- ✅ **Static Performance** - Pre-compiled HTML for maximum speed
- ✅ **Modern Design** - Clean, responsive layout with Inter font
- ✅ **Developer Friendly** - Simple, extensible template system
- ✅ **SEO Ready** - Proper meta tags, structured data, and RSS feed

## 📁 Template Structure

```
template-basic-blog/
├── package.json              # Dependencies and scripts
├── build/                    # Build system
│   ├── index.js             # Main build script
│   ├── template-engine.js   # Mustache template renderer
│   ├── utils.js             # Utility functions
│   └── dev-server.js        # Development server
├── templates/                # HTML templates
│   ├── layout.html          # Base layout
│   ├── index.html           # Homepage template
│   └── article.html         # Article page template
├── assets/                   # Static assets
│   ├── styles.css           # All styles
│   └── script.js            # JavaScript enhancements
├── content/                  # Article content (auto-generated)
│   └── *.md or *.html       # Markdown or compiled HTML files
├── .github/workflows/        # GitHub Actions
│   └── deploy.yml           # Build and deploy workflow
└── dist/                     # Generated static site (auto-generated)
```

## 🔄 Workflow Integration

### Development Workflow
1. **Local Development**: `npm run dev` - Starts dev server with file watching
2. **Build**: `npm run build` - Generates static site in `dist/`
3. **Preview**: `npm run preview` - Build and serve locally

### Production Workflow (GitHub Actions)
1. **Content Push**: Inland CMS pushes content to repository
2. **Milkdown Compilation**: Your custom compiler processes markdown → HTML
3. **Static Generation**: Build system creates final HTML pages
4. **Deployment**: GitHub Pages serves the static site

## 🎨 Template Variables

The template uses Mustache syntax for variable replacement:

### Site-level Variables
- `Test Inland` - Site name
- `Test inland features....` - Site description  
- `Mirone` - Author name
- `inland-test` - URL-safe site name
- `Saul-Mirone` - GitHub username

### Article-level Variables
- `{{article.title}}` - Article title
- `{{article.content}}` - Article HTML content
- `{{article.date}}` - ISO date
- `{{article.formattedDate}}` - Human-readable date
- `{{article.status}}` - published/draft
- `{{article.excerpt}}` - Article excerpt
- `{{article.isCompiled}}` - Whether compiled with milkdown

## 🛠️ Customization

### Styling
Modify `assets/styles.css` to customize the appearance:
```css
:root {
    --color-primary: #your-color;
    --font-family: 'Your-Font', sans-serif;
    /* ... other variables */
}
```

### Templates
Edit files in `templates/` to change the HTML structure:
- `layout.html` - Base page structure
- `index.html` - Homepage layout
- `article.html` - Article page layout

### Build Process
Extend `build/index.js` to add custom functionality:
```javascript
// Add custom processing steps
async generateCustomPages() {
    // Your custom logic here
}
```

## 📝 Content Format

### Compiled Articles (Preferred)
```html
---
title: My Article Title
date: 2024-01-15
status: published
excerpt: A brief description
---
<!-- CONTENT_START -->
<h1>My Article</h1>
<p>HTML content compiled by milkdown...</p>
```

### Markdown Fallback
```markdown
---
title: My Article Title
date: 2024-01-15
status: published
excerpt: A brief description
---

# My Article

Raw markdown content (will be displayed as plain text)
```

## 🚀 GitHub Actions Setup

The template includes a GitHub Actions workflow that:

1. **Compiles** markdown with your milkdown compiler (placeholder included)
2. **Builds** the static site using the build system
3. **Deploys** to GitHub Pages automatically

To integrate your milkdown compiler, modify the "Compile markdown with milkdown" step in `.github/workflows/deploy.yml`.

## 🔧 Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding Features
1. **New page types**: Add templates in `templates/`
2. **Styling**: Modify `assets/styles.css`
3. **JavaScript**: Extend `assets/script.js`
4. **Build logic**: Update `build/index.js`

## 🎯 Performance Features

- **Pre-compiled HTML** - No runtime markdown processing
- **Optimized CSS** - Modern CSS with custom properties
- **Minimal JavaScript** - Only essential enhancements
- **Static assets** - Perfect for CDN caching
- **RSS feed** - Automatic generation
- **SEO optimized** - Proper meta tags and structure

## 🌟 Template Features

### Built-in Components
- **Article cards** with hover effects
- **Responsive navigation**
- **Code block copy buttons**
- **Smooth scroll anchors**
- **Loading animations**
- **Dark mode toggle** (optional)

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Optimized typography scaling
- Touch-friendly interactions

## 📄 License

MIT License - Feel free to customize and extend for your needs.

## 🔗 Links

- [Inland CMS](https://github.com/your-org/inland)
- [Milkdown Editor](https://milkdown.dev/)
- [GitHub Pages](https://pages.github.com/)

---

**Happy blogging!** This template provides a solid foundation for your Inland CMS blog while maintaining the flexibility to customize and extend as needed.
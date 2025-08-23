/**
 * Blog Template JavaScript
 * Provides basic interactivity and enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]')
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault()
            const targetId = this.getAttribute('href').substring(1)
            const targetElement = document.getElementById(targetId)
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
        })
    })
    
    // Add loading animation for external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]')
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            this.style.opacity = '0.7'
            setTimeout(() => {
                this.style.opacity = '1'
            }, 200)
        })
    })
    
    // Simple fade-in animation for article cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    }
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1'
                entry.target.style.transform = 'translateY(0)'
            }
        })
    }, observerOptions)
    
    // Observe article cards for animation
    const articleCards = document.querySelectorAll('.article-card')
    articleCards.forEach(card => {
        card.style.opacity = '0'
        card.style.transform = 'translateY(20px)'
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
        observer.observe(card)
    })
    
    // Add copy button to code blocks
    const codeBlocks = document.querySelectorAll('pre code')
    codeBlocks.forEach(block => {
        const pre = block.parentElement
        const button = document.createElement('button')
        button.className = 'copy-button'
        button.textContent = 'Copy'
        button.setAttribute('aria-label', 'Copy code to clipboard')
        
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent)
                button.textContent = 'Copied!'
                button.classList.add('copied')
                
                setTimeout(() => {
                    button.textContent = 'Copy'
                    button.classList.remove('copied')
                }, 2000)
            } catch (err) {
                console.error('Failed to copy code:', err)
                button.textContent = 'Failed'
                setTimeout(() => {
                    button.textContent = 'Copy'
                }, 2000)
            }
        })
        
        pre.style.position = 'relative'
        pre.appendChild(button)
    })
    
    // Add basic dark mode toggle (optional enhancement)
    const darkModeToggle = document.createElement('button')
    darkModeToggle.className = 'dark-mode-toggle'
    darkModeToggle.innerHTML = '🌙'
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode')
    
    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    if (isDarkMode) {
        document.body.classList.add('dark-mode')
        darkModeToggle.innerHTML = '☀️'
    }
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode')
        const isDark = document.body.classList.contains('dark-mode')
        darkModeToggle.innerHTML = isDark ? '☀️' : '🌙'
        localStorage.setItem('darkMode', isDark)
    })
    
    // Add dark mode toggle to header
    const siteNav = document.querySelector('.site-nav')
    if (siteNav) {
        siteNav.appendChild(darkModeToggle)
    }
})

// Add styles for copy button and dark mode toggle
const styles = `
.copy-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
}

pre:hover .copy-button {
    opacity: 1;
}

.copy-button:hover {
    background: var(--color-primary-dark);
}

.copy-button.copied {
    background: var(--color-success);
}

.dark-mode-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.dark-mode-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Basic dark mode styles */
.dark-mode {
    --color-bg: #1f2937;
    --color-bg-alt: #374151;
    --color-text: #f9fafb;
    --color-text-light: #d1d5db;
    --color-text-lighter: #9ca3af;
    --color-border: #4b5563;
    --color-border-light: #374151;
}
`

// Inject styles
const styleSheet = document.createElement('style')
styleSheet.textContent = styles
document.head.appendChild(styleSheet)
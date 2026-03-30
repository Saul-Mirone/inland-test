/**
 * Blog Template JavaScript
 * Theme toggle and code block enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    var toggle = document.getElementById('theme-toggle')
    if (toggle) {
        updateToggleIcon()
        toggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark')
            var isDark = document.documentElement.classList.contains('dark')
            localStorage.setItem('theme', isDark ? 'dark' : 'light')
            updateToggleIcon()
        })
    }

    function updateToggleIcon() {
        var isDark = document.documentElement.classList.contains('dark')
        var sun = document.querySelector('.icon-sun')
        var moon = document.querySelector('.icon-moon')
        if (sun && moon) {
            sun.style.display = isDark ? 'none' : 'block'
            moon.style.display = isDark ? 'block' : 'none'
        }
    }

    // Apply ratio and caption to image blocks
    document.querySelectorAll('img[data-type="image-block"]').forEach(function(img) {
        var ratio = parseFloat(img.getAttribute('ratio'))
        var caption = img.getAttribute('caption')

        var figure = document.createElement('figure')
        figure.className = 'image-block-figure'
        if (ratio && ratio > 0 && ratio <= 1) {
            figure.style.width = (ratio * 100) + '%'
        }

        img.parentNode.insertBefore(figure, img)
        figure.appendChild(img)

        if (caption) {
            var figcaption = document.createElement('figcaption')
            figcaption.textContent = caption
            figure.appendChild(figcaption)
        }
    })

    // Copy button for code blocks
    var codeBlocks = document.querySelectorAll('pre code')
    codeBlocks.forEach(function(block) {
        var pre = block.parentElement
        var button = document.createElement('button')
        button.className = 'copy-button'
        button.textContent = 'Copy'
        button.setAttribute('aria-label', 'Copy code to clipboard')

        button.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(block.textContent)
                button.textContent = 'Copied!'
                button.classList.add('copied')
                setTimeout(function() {
                    button.textContent = 'Copy'
                    button.classList.remove('copied')
                }, 2000)
            } catch (err) {
                button.textContent = 'Failed'
                setTimeout(function() {
                    button.textContent = 'Copy'
                }, 2000)
            }
        })

        pre.style.position = 'relative'
        pre.appendChild(button)
    })
})

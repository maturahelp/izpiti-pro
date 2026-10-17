import katex from 'katex'

/**
 * Renders all \(...\) and \[...\] LaTeX delimiters in an HTML string
 * using KaTeX, returning the processed HTML ready for dangerouslySetInnerHTML.
 */
export function renderMathInHtml(html: string): string {
  if (!html) return html

  // Replace \(...\) inline math — use [^]* instead of . with /s flag for TS compat
  let result = html.replace(/\\\(([^]*?)\\\)/g, (_, latex) => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
      })
    } catch {
      return _
    }
  })

  // Replace \[...\] display math
  result = result.replace(/\\\[([^]*?)\\\]/g, (_, latex) => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
      })
    } catch {
      return _
    }
  })

  return result
}

const MATH_SEGMENT_RE = /(\\\([^]*?\\\)|\\\[[^]*?\\\])/

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** True when the text carries \(…\) or \[…\] delimiters that need KaTeX. */
export function hasTexDelimiters(text: string | undefined): boolean {
  return Boolean(text && /\\[([]/.test(text))
}

/**
 * Like renderMathInHtml, but for PLAIN TEXT (mock exam stems and options):
 * everything outside the math delimiters is HTML-escaped first, so a "<" in
 * "x < 2" can never open a tag.
 */
export function renderMathTextToHtml(text: string): string {
  if (!text) return ''
  return text
    .split(MATH_SEGMENT_RE)
    .map((part) => {
      const inline = part.startsWith('\\(') && part.endsWith('\\)')
      const display = part.startsWith('\\[') && part.endsWith('\\]')
      if (!inline && !display) return escapeHtml(part)
      try {
        return katex.renderToString(part.slice(2, -2), {
          throwOnError: false,
          displayMode: display,
          output: 'html',
        })
      } catch {
        return escapeHtml(part)
      }
    })
    .join('')
}

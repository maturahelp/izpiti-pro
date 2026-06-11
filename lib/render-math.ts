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

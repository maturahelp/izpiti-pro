export function normalizeInlineMathDelimiters(text: string): string {
  return text.replace(/\$([^$\n]+)\$/g, '\\($1\\)')
}

export function formatMathFallbackText(text: string): string {
  let formatted = text
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$1')
    .replace(/\\\[([\s\S]*?)\\\]/g, '$1')

  let previous = ''
  while (previous !== formatted) {
    previous = formatted
    formatted = formatted.replace(/\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
  }

  formatted = formatted
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\times/g, ' × ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\%/g, '%')
    .replace(/\\leq?/g, '≤')
    .replace(/\\geq?/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\pm/g, '±')
    .replace(/\\infty/g, '∞')
    .replace(/\\circ/g, '°')
    .replace(/\\lvert/g, '|')
    .replace(/\\rvert/g, '|')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\,/g, ' ')
    .replace(/\{,\}/g, ',')
    .replace(/[{}]/g, '')
    .replace(/([0-9)\]}])\s*-\s*([0-9A-Za-z([{])/g, '$1 − $2')
    .replace(/([A-Za-z])\s*-\s*([0-9([{])/g, '$1 − $2')
    .replace(/(^|[\s([{=<>:])-\s*/g, '$1−')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  return formatted
}

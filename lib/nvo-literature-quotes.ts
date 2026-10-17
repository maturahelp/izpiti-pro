/**
 * Helpers for checking that a quote attributed to an NVO literature work
 * really appears in the work's text (public/nvo-texts/*.txt).
 *
 * Quotes in the summaries may use „…“ / «…» / "…" quote marks, "/" as a verse
 * separator and „…“ (or "...") as an ellipsis for skipped words. The text
 * files use "й" where modern editions print "ѝ", and OCR'd files may differ
 * in dash and whitespace characters, so matching is done on a normalised
 * form of both sides.
 */

const QUOTE_MARKS = /[„“”"«»‘’'`]/g
const DASHES = /[‐‑‒–—―]/g

/** Normalise text for loose substring matching. */
export function normalizeForMatch(input: string): string {
  return input
    .replace(QUOTE_MARKS, '')
    .replace(/_/g, '') // italic markers left in some text files (_свобода и смърт_)
    .replace(DASHES, '-')
    .replace(/ѝ/g, 'й')
    .replace(/Ѝ/g, 'Й')
    .replace(/̀/g, '') // combining grave accent (Остàви → Остави)
    .replace(/à/g, 'а')
    .replace(/è/g, 'е')
    .replace(/ù/g, 'у')
    .replace(/[\s ]+/g, ' ')
    .toLowerCase()
    .trim()
}

/**
 * Split a quote into the fragments that must each appear in the text:
 * ellipses („…“ or "...") mark skipped words, "/" marks a verse break.
 */
export function quoteFragments(quote: string): string[] {
  return quote
    .replace(/\.{3}|…/g, '\u0000')
    .split('\u0000')
    .flatMap((part) => part.split(/\s\/\s|\s\/|\/\s/))
    .map((part) => normalizeForMatch(part).replace(/^[\s,.;:!?()\-]+|[\s,.;:!?()\-]+$/g, ''))
    .filter((part) => part.length > 0)
}

/** Returns the fragments of `quote` that are NOT found in `text`. */
export function missingQuoteFragments(quote: string, text: string): string[] {
  const haystack = normalizeForMatch(text)
  return quoteFragments(quote).filter((fragment) => !haystack.includes(fragment))
}

/**
 * Pseudo-quotes that are not meant to be found verbatim, e.g. a label such
 * as "(песента на жътварката)" or a bare title. Anything wrapped in
 * parentheses is treated as a description, not a quote.
 */
export function isDescriptiveQuote(quote: string): boolean {
  const trimmed = quote.trim()
  return trimmed.startsWith('(') && trimmed.endsWith(')')
}

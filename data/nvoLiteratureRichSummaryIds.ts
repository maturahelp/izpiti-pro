/**
 * Lightweight companion to nvoLiteratureRichSummaries.ts — just the work
 * IDs that have a rich summary, used by materials/page.tsx to decide
 * whether "Резюме" routes to /dashboard/materials/nvo-summary/[id] or
 * falls back to the inline summary panel, WITHOUT importing (and
 * shipping to every visitor's browser) the full ~2000-line dataset just
 * to answer that yes/no question.
 *
 * Keep in sync with the keys of nvoLiteratureRichSummaries — if you add
 * a new work there, add its id here too.
 */
export const NVO_LITERATURE_RICH_SUMMARY_IDS = new Set([
  'nvo-lit-01',
  'nvo-lit-02',
  'nvo-lit-03',
  'nvo-lit-04',
  'nvo-lit-05',
  'nvo-lit-06',
  'nvo-lit-07',
  'nvo-lit-08',
  'nvo-lit-09',
  'nvo-lit-10',
  'nvo-lit-11',
  'nvo-lit-12',
  'nvo-lit-13',
  'nvo-lit-14',
  'nvo-lit-15',
  'nvo-lit-16',
  'nvo-lit-17',
  'nvo-lit-18',
  'nvo-lit-19',
  'nvo-lit-20',
  'nvo-lit-21',
  'nvo-lit-22',
])

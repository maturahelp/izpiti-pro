/**
 * Build the RAG index for the AI помощник.
 *
 *   npm run index:rag           # incremental upsert (skip existing source/source_id/section)
 *   npm run index:rag -- --full # truncate content_chunks and rebuild from scratch
 *
 * Required env vars:
 *   GOOGLE_GENERATIVE_AI_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { google } from '@ai-sdk/google'
import { embedMany } from 'ai'
import { createClient } from '@supabase/supabase-js'

// Minimal .env.local loader — avoids adding `dotenv` as a dep.
;(() => {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const rawLine of readFileSync(envPath, 'utf-8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    if (process.env[key] !== undefined) continue
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
})()

import { literatureSummaries } from '../data/literatureSummaries'
import { nvoLiteratureSummaries } from '../data/nvoLiteratureSummaries'
import { literatureWorks } from '../data/literatureWorks'
import { belTheory } from '../data/bel-theory'
import { lessons } from '../data/lessons'

const EMBEDDING_MODEL = 'text-embedding-004'
const EMBEDDING_BATCH = 50
const MAX_CHARS_PER_CHUNK = 2000

type ChunkRow = {
  source: string
  source_id: string
  section: string
  grade: number | null
  exam_type: string | null
  title: string | null
  content: string
}

const FULL = process.argv.includes('--full')

function truncate(text: string): string {
  if (text.length <= MAX_CHARS_PER_CHUNK) return text
  const head = text.slice(0, MAX_CHARS_PER_CHUNK)
  const lastBreak = Math.max(head.lastIndexOf('\n\n'), head.lastIndexOf('. '))
  return lastBreak > MAX_CHARS_PER_CHUNK * 0.6 ? head.slice(0, lastBreak) : head
}

function isSectionHeading(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length === 0 || trimmed.length > 60) return false
  // Headings са изцяло главни букви (с интервали и кирилица)
  return /^[А-ЯA-Z\s,.\-„“"’':;!?]+$/.test(trimmed) && /[А-ЯA-Z]/.test(trimmed)
}

function chunksFromLiteratureSummary(
  workId: string,
  paragraphs: string[],
  workTitle: string,
  grade: 7 | 12,
  source: 'lit-summary' | 'nvo-lit-summary'
): ChunkRow[] {
  const out: ChunkRow[] = []
  let currentSection = 'Общо'
  let buffer: string[] = []

  const flush = () => {
    if (buffer.length === 0) return
    const content = `${workTitle} — ${currentSection}\n\n${buffer.join('\n\n')}`
    out.push({
      source,
      source_id: workId,
      section: currentSection,
      grade,
      exam_type: grade === 7 ? 'nvo7' : 'dzi',
      title: workTitle,
      content: truncate(content),
    })
    buffer = []
  }

  for (const para of paragraphs) {
    if (isSectionHeading(para)) {
      flush()
      currentSection = para.trim()
    } else {
      buffer.push(para)
    }
  }
  flush()

  return out
}

function buildLiteratureSummaryChunks(): ChunkRow[] {
  const titleById = new Map(literatureWorks.map((w) => [w.id, `${w.title} (${w.author})`]))
  const out: ChunkRow[] = []
  for (const [workId, paragraphs] of Object.entries(literatureSummaries)) {
    const title = titleById.get(workId) ?? workId
    out.push(...chunksFromLiteratureSummary(workId, paragraphs, title, 12, 'lit-summary'))
  }
  for (const [workId, paragraphs] of Object.entries(nvoLiteratureSummaries)) {
    const title = titleById.get(workId) ?? workId
    out.push(...chunksFromLiteratureSummary(workId, paragraphs, title, 7, 'nvo-lit-summary'))
  }
  return out
}

function buildBelTheoryChunks(): ChunkRow[] {
  return belTheory.map((rule, i) => ({
    source: 'bel-theory',
    source_id: `rule-${i + 1}`,
    section: '',
    grade: null,
    exam_type: null,
    title: rule.title,
    content: truncate(
      `${rule.title}\n\nПравило: ${rule.rule}\n\nПример: ${rule.example}\n\nЧеста грешка: ${rule.commonMistake}`
    ),
  }))
}

function buildLessonChunks(): ChunkRow[] {
  return lessons.map((lesson) => {
    const grade = lesson.examType === 'nvo7' ? 7 : 12
    return {
      source: 'lesson',
      source_id: lesson.id,
      section: '',
      grade,
      exam_type: lesson.examType,
      title: lesson.title,
      content: truncate(
        `${lesson.title}\n\nКратко: ${lesson.summary}\n\nОбяснение: ${lesson.transcript}`
      ),
    }
  })
}

type CurriculumTopic = {
  number: number
  title: string
  subtitle?: string
  definition?: string
  key_points?: string[]
  exercises?: Array<{
    number: number
    question: string
    correct_answer?: string
    explanation?: string
  }>
}

async function buildCurriculumChunks(): Promise<ChunkRow[]> {
  const path = resolve(process.cwd(), 'data/bel_curriculum_topics_content.json')
  const raw = await readFile(path, 'utf-8')
  const json = JSON.parse(raw) as { topics: CurriculumTopic[] }
  const out: ChunkRow[] = []

  for (const topic of json.topics) {
    const keyPoints = (topic.key_points ?? []).map((p) => `• ${p}`).join('\n')
    out.push({
      source: 'curriculum',
      source_id: `topic-${topic.number}`,
      section: 'Теория',
      grade: null,
      exam_type: null,
      title: topic.title,
      content: truncate(
        `${topic.title}${topic.subtitle ? `\n${topic.subtitle}` : ''}\n\n${topic.definition ?? ''}${
          keyPoints ? `\n\nКлючови точки:\n${keyPoints}` : ''
        }`
      ),
    })

    for (const ex of topic.exercises ?? []) {
      if (!ex.explanation) continue
      out.push({
        source: 'curriculum',
        source_id: `topic-${topic.number}-ex-${ex.number}`,
        section: 'Упражнение',
        grade: null,
        exam_type: null,
        title: topic.title,
        content: truncate(
          `Тема: ${topic.title}\n\nВъпрос: ${ex.question}\n\nОтговор: ${ex.correct_answer ?? ''}\n\nОбяснение: ${ex.explanation}`
        ),
      })
    }
  }

  return out
}

type LitQbankEntry = {
  grade?: number
  unit?: string
  author?: string
  title?: string
  questions?: Array<{
    question: string
    options?: Record<string, string>
    correct_answer?: string
    explanation?: string
  }>
}

async function buildLitQbankChunks(
  jsonPath: string,
  source: 'dzi-qbank' | 'nvo-qbank',
  grade: 7 | 12
): Promise<ChunkRow[]> {
  const raw = await readFile(resolve(process.cwd(), jsonPath), 'utf-8')
  const data = JSON.parse(raw) as LitQbankEntry[]
  const out: ChunkRow[] = []

  for (const entry of data) {
    const titleParts = [entry.title, entry.author].filter(Boolean) as string[]
    const heading = titleParts.length ? titleParts.join(' — ') : 'Литература'
    const questions = entry.questions ?? []
    questions.forEach((q, qIdx) => {
      if (!q.explanation) return
      const optionsBlock = q.options
        ? Object.entries(q.options).map(([k, v]) => `${k}) ${v}`).join('\n')
        : ''
      out.push({
        source,
        source_id: `${(entry.title ?? 'work').replace(/\s+/g, '-').toLowerCase()}-q${qIdx + 1}`,
        section: entry.unit ?? '',
        grade,
        exam_type: grade === 7 ? 'nvo7' : 'dzi',
        title: heading,
        content: truncate(
          `${heading}\n\nВъпрос: ${q.question}${optionsBlock ? `\n${optionsBlock}` : ''}\n\nПравилен отговор: ${q.correct_answer ?? ''}\n\nОбяснение: ${q.explanation}`
        ),
      })
    })
  }

  return out
}

type BelTopicsQbank = {
  sections: Array<{
    title: string
    topics: Array<{
      title: string
      questions?: Array<{
        number: number
        text: string
        options?: string[]
        correct_answer?: string
        explanation?: string
      }>
    }>
  }>
}

async function buildBelTopicsQbankChunks(): Promise<ChunkRow[]> {
  const raw = await readFile(
    resolve(process.cwd(), 'data/bel_topics_question_bank.json'),
    'utf-8'
  )
  const data = JSON.parse(raw) as BelTopicsQbank
  const out: ChunkRow[] = []

  for (const section of data.sections) {
    for (const topic of section.topics) {
      for (const q of topic.questions ?? []) {
        if (!q.explanation) continue
        const optionsBlock = (q.options ?? []).map((opt, i) => `${i + 1}) ${opt}`).join('\n')
        out.push({
          source: 'bel-topics-qbank',
          source_id: `${topic.title.replace(/\s+/g, '-').toLowerCase()}-q${q.number}`,
          section: section.title,
          grade: null,
          exam_type: null,
          title: topic.title,
          content: truncate(
            `${topic.title}\n\nВъпрос: ${q.text}${optionsBlock ? `\n${optionsBlock}` : ''}\n\nПравилен отговор: ${q.correct_answer ?? ''}\n\nОбяснение: ${q.explanation}`
          ),
        })
      }
    }
  }

  return out
}

async function embedAndUpsert(rows: ChunkRow[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY')
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  if (FULL) {
    console.log('[indexer] --full: truncating content_chunks…')
    const { error } = await supabase.from('content_chunks').delete().not('id', 'is', null)
    if (error) throw error
  } else {
    const { data: existing, error } = await supabase
      .from('content_chunks')
      .select('source, source_id, section')
    if (error) throw error
    const existingKeys = new Set(
      (existing ?? []).map((r) => `${r.source}::${r.source_id}::${r.section ?? ''}`)
    )
    const before = rows.length
    rows = rows.filter(
      (r) => !existingKeys.has(`${r.source}::${r.source_id}::${r.section ?? ''}`)
    )
    console.log(`[indexer] incremental: ${rows.length} new of ${before} candidate rows`)
  }

  let written = 0
  for (let i = 0; i < rows.length; i += EMBEDDING_BATCH) {
    const batch = rows.slice(i, i + EMBEDDING_BATCH)
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel(EMBEDDING_MODEL),
      values: batch.map((r) => r.content),
    })

    const records = batch.map((row, j) => ({
      ...row,
      embedding: embeddings[j],
    }))

    const { error } = await supabase
      .from('content_chunks')
      .upsert(records, { onConflict: 'source,source_id,section' })

    if (error) {
      console.error('[indexer] upsert error', error)
      throw error
    }

    written += batch.length
    console.log(`[indexer] embedded + upserted ${written}/${rows.length}`)
  }
}

async function main() {
  console.log('[indexer] gathering chunks…')
  const all: ChunkRow[] = [
    ...buildLiteratureSummaryChunks(),
    ...buildBelTheoryChunks(),
    ...buildLessonChunks(),
    ...(await buildCurriculumChunks()),
    ...(await buildLitQbankChunks('data/dziLiteratureQuestionBank.json', 'dzi-qbank', 12)),
    ...(await buildLitQbankChunks('data/nvoLiteratureQuestionBank.json', 'nvo-qbank', 7)),
    ...(await buildBelTopicsQbankChunks()),
  ]

  console.log(`[indexer] total chunks: ${all.length}`)
  const bySource = all.reduce<Record<string, number>>((acc, r) => {
    acc[r.source] = (acc[r.source] ?? 0) + 1
    return acc
  }, {})
  console.log('[indexer] by source:', bySource)

  await embedAndUpsert(all)
  console.log('[indexer] done.')
}

main().catch((err) => {
  console.error('[indexer] fatal', err)
  process.exit(1)
})

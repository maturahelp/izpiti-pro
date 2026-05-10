import { google } from '@ai-sdk/google'
import { embed } from 'ai'
import type { SupabaseClient } from '@supabase/supabase-js'

export const EMBEDDING_MODEL = 'gemini-embedding-001'
export const EMBEDDING_DIMS = 768

export type RetrievedChunk = {
  id: string
  source: string
  source_id: string
  section: string
  grade: number | null
  exam_type: string | null
  title: string | null
  content: string
  similarity: number
}

export type RetrieveOptions = {
  grade?: 7 | 12
  source?: string
  k?: number
}

const SOURCE_LABEL: Record<string, string> = {
  'lit-summary': 'Обобщение (ДЗИ)',
  'nvo-lit-summary': 'Обобщение (НВО)',
  'bel-theory': 'Правило по БЕЛ',
  'lesson': 'Урок',
  'curriculum': 'Учебна програма по БЕЛ',
  'dzi-qbank': 'Въпрос от ДЗИ банка',
  'nvo-qbank': 'Въпрос от НВО банка',
  'bel-topics-qbank': 'Въпрос по БЕЛ темa',
}

export function labelForSource(source: string): string {
  return SOURCE_LABEL[source] ?? source
}

export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.textEmbeddingModel(EMBEDDING_MODEL, {
      outputDimensionality: EMBEDDING_DIMS,
      taskType: 'RETRIEVAL_QUERY',
    }),
    value: text,
  })
  return embedding
}

export async function retrieveChunks(
  supabase: SupabaseClient,
  queryText: string,
  opts: RetrieveOptions = {}
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedQuery(queryText)

  const { data, error } = await supabase.rpc('match_content_chunks', {
    query_embedding: queryEmbedding,
    match_count: opts.k ?? 6,
    grade_filter: opts.grade ?? null,
    source_filter: opts.source ?? null,
  })

  if (error) {
    console.error('[ai/retrieve] match_content_chunks error', error)
    return []
  }

  return (data ?? []) as RetrievedChunk[]
}

export function formatContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return 'НЯМА ИЗВЛЕЧЕН КОНТЕКСТ. Отговори от обща теория и ясно посочи това на ученика.'
  }

  const sections = chunks.map((chunk, i) => {
    const label = labelForSource(chunk.source)
    const titleParts = [label]
    if (chunk.title) titleParts.push(chunk.title)
    if (chunk.section) titleParts.push(chunk.section)
    const heading = titleParts.join(' — ')
    return `[${i + 1}] ${heading}\n${chunk.content}`
  })

  return [
    'КОНТЕКСТ ОТ ПЛАТФОРМАТА (използвай го за отговора, цитирай заглавията когато е уместно):',
    sections.join('\n\n'),
  ].join('\n\n')
}

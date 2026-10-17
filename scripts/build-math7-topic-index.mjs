// Generates data/nvo_7_math_topic_index.json — a lightweight list of topics
// and subtopics (id, title, problem count) derived from the full problem bank.
//
// The materials page (a Client Component) only needs titles and counts for
// the subtopic grid; importing the whole bank there shipped all 540 problems
// with answers to every visitor. Re-run after editing the bank:
//   node scripts/build-math7-topic-index.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const bankPath = resolve(root, 'data/nvo_7_math_generated_problem_bank.json')
const indexPath = resolve(root, 'data/nvo_7_math_topic_index.json')

const bank = JSON.parse(readFileSync(bankPath, 'utf-8'))
const index = {
  generatedFrom: 'data/nvo_7_math_generated_problem_bank.json',
  topics: bank.topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    subtopics: topic.subtopics.map((sub) => ({
      id: sub.id,
      title: sub.title,
      problemCount: sub.problems.length,
    })),
  })),
}

writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`)
console.log(`Wrote ${indexPath}: ${index.topics.length} topics, ${index.topics.reduce((n, t) => n + t.subtopics.length, 0)} subtopics`)

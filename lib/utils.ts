import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'лесен': return 'text-success bg-success-light'
    case 'среден': return 'text-amber bg-amber-light'
    case 'труден': return 'text-danger bg-danger-light'
    default: return 'text-text-muted bg-gray-100'
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-amber'
  return 'text-danger'
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-success-light text-success'
  if (score >= 60) return 'bg-amber-light text-amber'
  return 'bg-danger-light text-danger'
}

export function getProgressWidth(value: number, max: number): string {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return `${pct}%`
}

export function pluralize(n: number, one: string, few: string, many: string): string {
  if (n === 1) return `${n} ${one}`
  if (n >= 2 && n <= 4) return `${n} ${few}`
  return `${n} ${many}`
}

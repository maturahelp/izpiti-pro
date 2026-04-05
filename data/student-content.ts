import { tests, type Test } from './tests'
import { lessons, type Lesson } from './lessons'
import { materials, type Material } from './materials'
import { subjects, type Subject } from './subjects'

export function filterStudentTests(items: Test[]): Test[] {
  return items
}

export function filterStudentLessons(items: Lesson[]): Lesson[] {
  return items
}

export function filterStudentMaterials(items: Material[]): Material[] {
  return items
}

export function filterStudentSubjects(items: Subject[]): Subject[] {
  return items
}

export const studentTests = tests
export const studentLessons = lessons
export const studentMaterials = materials
export const studentSubjects = subjects

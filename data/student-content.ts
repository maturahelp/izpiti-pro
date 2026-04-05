import { currentUser } from './users'
import { tests, type Test } from './tests'
import { lessons, type Lesson } from './lessons'
import { materials, type Material } from './materials'
import { subjects, type Subject } from './subjects'

const isPremiumGradeScoped = currentUser.plan === 'premium'
const allowedExamType = currentUser.class === '7' ? 'nvo7' : 'dzi12'

function isAllowedExamType(examType: 'nvo7' | 'dzi12'): boolean {
  if (!isPremiumGradeScoped) return true
  return examType === allowedExamType
}

export function canAccessStudentContent(examType: 'nvo7' | 'dzi12'): boolean {
  return isAllowedExamType(examType)
}

export function filterStudentTests(items: Test[]): Test[] {
  return items.filter((item) => isAllowedExamType(item.examType))
}

export function filterStudentLessons(items: Lesson[]): Lesson[] {
  return items.filter((item) => isAllowedExamType(item.examType))
}

export function filterStudentMaterials(items: Material[]): Material[] {
  return items.filter((item) => isAllowedExamType(item.examType))
}

export function filterStudentSubjects(items: Subject[]): Subject[] {
  return items.filter((item) => isAllowedExamType(item.examType))
}

export const studentTests = filterStudentTests(tests)
export const studentLessons = filterStudentLessons(lessons)
export const studentMaterials = filterStudentMaterials(materials)
export const studentSubjects = filterStudentSubjects(subjects)

export const studentContentScope = {
  isPremiumGradeScoped,
  allowedExamType,
  allowedClass: currentUser.class,
}

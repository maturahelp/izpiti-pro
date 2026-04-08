export type MaterialType = 'notes' | 'pdf' | 'summary' | 'scheme'
export type MaterialAccess = 'free' | 'premium'

export interface Material {
  id: string
  title: string
  description: string
  type: MaterialType
  subjectId: string
  subjectName: string
  topicId: string
  topicName: string
  examType: 'nvo7' | 'dzi12'
  access: MaterialAccess
  pages?: number
  downloadCount: number
  createdAt: string
}

export const materials: Material[] = []

export const materialTypeLabels: Record<MaterialType, string> = {
  notes: 'Бележки',
  pdf: 'PDF документ',
  summary: 'Резюме',
  scheme: 'Схема',
}

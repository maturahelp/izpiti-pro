'use client'

import { TopBar } from '@/components/dashboard/TopBar'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type VideoSection = 'bulgarian' | 'literature' | 'math' | 'english'

const sectionLabels: Record<VideoSection, string> = {
  bulgarian: 'Български',
  literature: 'Литература',
  math: 'Математика',
  english: 'Английски',
}

export default function VideoLessonsPage() {
  const [selectedSection, setSelectedSection] = useState<VideoSection>('bulgarian')

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Видео уроци" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        <div className="mb-2">
          <div className="flex flex-wrap justify-center gap-3">
            {(Object.keys(sectionLabels) as VideoSection[]).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setSelectedSection(section)}
                className={cn(
                  'inline-flex min-w-[190px] justify-center items-center rounded-xl px-8 py-3.5 text-base font-semibold transition-colors',
                  selectedSection === section
                    ? 'bg-primary text-white'
                    : 'bg-primary-light text-primary hover:bg-primary-light/70'
                )}
              >
                {sectionLabels[section]}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-text mb-2">Секция „Видео уроци“</h2>
          <p className="text-sm text-text-muted">
            Кажи ми как искаш да изглеждат картите с видео уроците и ги изграждам веднага.
          </p>
        </div>
      </div>
    </div>
  )
}

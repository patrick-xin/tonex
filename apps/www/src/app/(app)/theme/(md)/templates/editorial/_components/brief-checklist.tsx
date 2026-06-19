'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

export default function BriefChecklist() {
  const [checklist, setChecklist] = useState([
    { id: 'c1', title: 'EDITORIAL LOGIC', status: 'included', checked: true },
    { id: 'c2', title: 'HANDSET TYPE', status: 'included', checked: true },
    { id: 'c3', title: 'QUIET MOTION', status: 'included', checked: true },
    { id: 'c4', title: 'PRINT TWIN', status: 'on request', checked: false },
  ])

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    )
  }

  return (
    <div className="space-y-3.5">
      {checklist.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => toggleCheck(item.id)}
          className={cn(
            'w-full flex items-center justify-between p-2 rounded-sm border border-outline-variant hover:border-primary/50 hover:bg-surface-container transition-all cursor-pointer text-left',
            focusVisiblePrimaryRing,
          )}
          title={`Toggle ${item.title}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                item.checked
                  ? 'bg-primary border-primary text-on-primary'
                  : 'bg-surface border-outline-variant text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono text-xs font-semibold text-on-surface select-none">
              {item.title}
            </span>
          </div>
          <span className="font-mono text-[9px] text-primary uppercase select-none">
            {item.status}
          </span>
        </button>
      ))}
    </div>
  )
}

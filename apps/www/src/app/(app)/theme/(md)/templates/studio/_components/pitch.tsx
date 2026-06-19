'use client'

import { Clock, FileText, LocateIcon, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItemContent,
  SelectTriggerGroup,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function Pitch() {
  const [formType, setFormType] = useState<string[]>(['IDENTITY'])

  const toggleEngagementType = (type: string) => {
    if (formType.includes(type)) {
      setFormType(formType.filter((t) => t !== type))
    } else {
      setFormType([...formType, type])
    }
  }

  return (
    <section id="pitch-section" className="border-t border-outline-variant pt-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-10">
        <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-wider text-on-surface-variant block">
              INQUIRY / FORM
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-tight">
              Tell us what you're building.
            </h2>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Describe the project, the constraint, and the timeline. We reply within two business
              days with a direct assessment of whether this is a good fit — and if not, why.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs text-on-surface-variant/90 border-t border-outline-variant/60 pt-6">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-tertiary" />
              <a href="#" className="hover:underline hover:text-on-surface">
                STUDIO@FIELDSET.CO
              </a>
            </div>
            <div className="flex items-center gap-2">
              <LocateIcon className="w-3.5 h-3.5 text-tertiary" />
              <span>BERLIN · TORONTO · REMOTE</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-tertiary" />
              <span>09:00 — 18:00 CET, MON-THU</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="block text-xs font-mono font-bold text-on-surface-variant">
                NAME
              </Label>
              <Input required type="text" placeholder="Lena Voss" />
            </div>

            <div className="space-y-2">
              <Label className="block text-xs font-mono font-bold text-on-surface-variant">
                STUDIO • BRAND
              </Label>
              <Input type="text" placeholder="Kern & Co." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="block text-xs font-mono font-bold text-on-surface-variant">
                WORK EMAIL
              </Label>
              <Input required type="email" placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label className="block text-xs font-mono font-bold text-on-surface-variant">
                BUDGET • USD
              </Label>
              <Select items={budgets}>
                <SelectTriggerGroup className="w-48" placeholder="Budget" />
                <SelectContent>
                  {budgets.map((fruit) => (
                    <SelectItemContent key={fruit.value} value={fruit.value}>
                      {fruit.label}
                    </SelectItemContent>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="block text-xs font-mono font-bold text-on-surface-variant mb-2">
              TYPE OF ENGAGEMENT
            </Label>
            <div className="flex flex-wrap gap-2">
              {['IDENTITY', 'DESIGN SYSTEM', 'PRODUCT UI', 'DOCUMENTATION', 'PRODUCT SITE'].map(
                (type) => {
                  const isSelected = formType.includes(type)
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleEngagementType(type)}
                      className={`px-3 py-1.5 font-mono text-xs font-black transition-all rounded-sm border cursor-pointer ${
                        isSelected
                          ? 'bg-tertiary text-on-tertiary border-transparent'
                          : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline'
                      }`}
                    >
                      {type}
                    </button>
                  )
                },
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="block text-xs font-mono font-bold text-on-surface-variant">
              BRIEF, IN YOUR OWN WORDS
            </Label>
            <Textarea
              required
              rows={6}
              placeholder="We're rebuilding our configurator UI and need a proper design system behind it — currently everything is ad-hoc. Timeline is Q4, team is 3 engineers."
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg">
              Send brief <Send className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

const budgets = [
  { label: '$20k — $40k', value: '$20k — $40k' },
  { label: '$40k — $80k', value: '$40k — $80k' },
  { label: '$80k — $150k', value: '$80k — $150k' },
  { label: '$150k+', value: '$150k+' },
]

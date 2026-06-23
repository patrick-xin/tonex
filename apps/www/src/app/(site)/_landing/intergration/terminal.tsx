'use client'

import { useInView } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { ShimmerBorder } from '../../../../components/shared/shimmer-border'
import type { ResultLine, Step } from './transcript'

interface TerminalProps {
  transcript: Step[]
  className?: string
  typingSpeed?: number
  initialDelay?: number
}

function UserLine({ text, cursor }: { text: string; cursor?: boolean }) {
  return (
    <div className="flex gap-2 rounded-md border border-outline-variant/40 bg-surface-container px-3 py-2">
      <span className="select-none text-primary">{'>'}</span>
      <span className="whitespace-pre-wrap text-primary">
        {text}
        {cursor && (
          <span className="ml-1 inline-block h-4 w-1 bg-primary translate-y-0.5 animate-pulse ease-spring duration-[100]" />
        )}
      </span>
    </div>
  )
}

function AssistantLine({ text }: { text: string }) {
  return (
    <div className="my-2 flex gap-2">
      <span className="select-none text-on-surface-variant">●</span>
      <span className="whitespace-pre-wrap text-on-surface">{text}</span>
    </div>
  )
}

const resultTone: Record<NonNullable<ResultLine['tone']>, string> = {
  ok: 'text-',
  dim: 'text-on-surface-variant',
  code: 'text-on-surface',
  comment: 'text-on-surface-variant',
}

function ToolBlock({
  step,
  running,
  revealedResults,
}: {
  step: Extract<Step, { kind: 'tool' }>
  running: boolean
  revealedResults: number
}) {
  return (
    <div className="my-2">
      <div className="flex gap-2">
        <span
          className={cn(
            'select-none transition-colors',
            running ? 'text-amber-400' : 'text-green-400',
          )}
        >
          ●
        </span>
        <span className="text-on-surface">
          <span className="font-semibold">{step.tool}</span>
          <span className="text-on-surface-variant">({step.call})</span>
        </span>
      </div>

      <div className="mt-0.5 pl-4.5">
        {running ? (
          <div className="flex gap-2 text-on-surface-variant">
            <span className="select-none">⎿</span>
            <span className="animate-pulse">running…</span>
          </div>
        ) : (
          step.result.slice(0, revealedResults).map((line, i) => (
            <div key={String(i)} className="flex gap-2">
              <span className="select-none text-on-surface-variant">{i === 0 ? '⎿' : ' '}</span>
              <span className={cn('whitespace-pre-wrap', resultTone[line.tone ?? 'code'])}>
                {line.text}
              </span>
            </div>
          ))
        )}
        {!running && step.collapsed && revealedResults >= step.result.length && (
          <div className="flex gap-2">
            <span className="select-none"> </span>
            <span className="text-on-surface-variant italic">… {step.collapsed}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function Terminal({
  transcript,
  className,
  typingSpeed = 38,
  initialDelay = 500,
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef)

  // how many steps are visible
  const [stepIdx, setStepIdx] = useState(0)
  // chars typed for the active user step
  const [typed, setTyped] = useState(0)
  // tool step: is the call still "running"; how many result lines shown
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(0)
  const [started, setStarted] = useState(false)

  const done = stepIdx >= transcript.length

  useEffect(() => {
    if (!inView || started) return
    const t = setTimeout(() => setStarted(true), initialDelay)
    return () => clearTimeout(t)
  }, [inView, started, initialDelay])

  // Drive the active step as a fixed timeline keyed ONLY to stepIdx. We never
  // depend on the intermediate state we set here (typed/running/results), so a
  // re-render can't tear down the timers it just scheduled — the bug that left
  // a tool stuck on "running" forever.
  useEffect(() => {
    if (!started) return
    const step = transcript[stepIdx]
    if (!step) return

    const timers: ReturnType<typeof setTimeout>[] = []
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms))
    }
    const next = () => {
      setTyped(0)
      setRunning(false)
      setResults(0)
      setStepIdx((i) => i + 1)
    }

    if (step.kind === 'user') {
      const len = step.text.length
      for (let c = 1; c <= len; c++) at(c * typingSpeed, () => setTyped(c))
      at(len * typingSpeed + 500, next)
    } else if (step.kind === 'assistant') {
      at(750, next)
    } else {
      const runMs = step.runMs ?? 700
      setRunning(true)
      setResults(0)
      at(runMs, () => setRunning(false))
      step.result.forEach((_, idx) => {
        at(runMs + (idx + 1) * 140, () => setResults(idx + 1))
      })
      at(runMs + step.result.length * 140 + 650, next)
    }

    return () => {
      for (const t of timers) clearTimeout(t)
    }
  }, [started, stepIdx, transcript, typingSpeed])

  // autoscroll
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on any progress
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [stepIdx, typed, results, running])

  const replay = useCallback(() => {
    setTyped(0)
    setRunning(false)
    setResults(0)
    setStepIdx(0)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('mx-auto w-full max-w-4xl px-4 font-mono text-sm', className)}
    >
      <div className="overflow-hidden rounded-xl border border-outline-variant/40 border-t-0 shadow-sm">
        {/* Title Bar */}
        <div className="flex gap-2 py-2 px-4 relative">
          <div className="bg-red-400 size-3 rounded-full" />
          <div className="bg-yellow-400 size-3 rounded-full" />
          <div className="bg-green-400 size-3 rounded-full" />
          <ShimmerBorder className="h-px" />
        </div>

        {/* Session transcript */}
        <div
          ref={contentRef}
          className="no-scrollbar h-120 overflow-y-auto p-4 leading-relaxed bg-surface-container-low rounded-t-2xl"
        >
          {transcript.slice(0, stepIdx + 1).map((s, i) => {
            const active = i === stepIdx
            if (s.kind === 'user') {
              return (
                <UserLine
                  key={String(i)}
                  text={active ? s.text.slice(0, typed) : s.text}
                  cursor={active && typed < s.text.length}
                />
              )
            }
            if (s.kind === 'assistant') {
              return <AssistantLine key={String(i)} text={s.text} />
            }
            return (
              <ToolBlock
                key={String(i)}
                step={s}
                running={active && running}
                revealedResults={active ? results : s.result.length}
              />
            )
          })}

          {done && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-outline-variant/40 bg-surface-container px-3 py-1">
              <span className="select-none text-primary">{'>'}</span>
              <span className="ml-0.5 inline-block h-4 w-1 bg-primary animate-pulse ease-spring duration-0" />
              <Button size="sm" variant="ghost" onClick={replay} className="ml-auto h-7">
                Replay
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

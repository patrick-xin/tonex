'use client'

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useRef,
} from 'react'
import { cn } from 'tailwind-variants'
import { clamp } from './color-utils'
import { useEventCallback } from './use-event-callback'

export interface Interaction {
  left: number
  top: number
}

const isTouch = (event: MouseEvent | TouchEvent): event is TouchEvent => 'touches' in event

const getTouchPoint = (touches: TouchList, touchId: number | null): Touch => {
  for (let i = 0; i < touches.length; i++) {
    if (touches[i].identifier === touchId) return touches[i]
  }
  return touches[0]
}

const getParentWindow = (node?: HTMLDivElement | null): Window => {
  return node?.ownerDocument.defaultView || self
}

const getRelativePosition = (
  node: HTMLDivElement,
  event: MouseEvent | TouchEvent,
  touchId: number | null,
): Interaction => {
  const rect = node.getBoundingClientRect()
  const pointer = isTouch(event) ? getTouchPoint(event.touches, touchId) : (event as MouseEvent)
  return {
    left: clamp((pointer.pageX - (rect.left + getParentWindow(node).pageXOffset)) / rect.width),
    top: clamp((pointer.pageY - (rect.top + getParentWindow(node).pageYOffset)) / rect.height),
  }
}

const preventDefaultMove = (event: MouseEvent | TouchEvent): void => {
  if (!isTouch(event)) event.preventDefault()
}

// If we've seen a touch interaction we ignore subsequent mouse events
// because some mobile browsers fire both for a single tap.
const isInvalid = (event: MouseEvent | TouchEvent, hasTouch: boolean): boolean => {
  return hasTouch && !isTouch(event)
}

interface Props {
  onMove: (interaction: Interaction) => void
  onKey: (offset: Interaction) => void
  className?: string
  children: ReactNode
  'aria-label'?: string
  'aria-valuetext'?: string
  'aria-valuenow'?: number
  'aria-valuemin'?: number
  'aria-valuemax'?: number
}

export function Interactive({ onMove, onKey, className, children, ...rest }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const onMoveCallback = useEventCallback<Interaction>(onMove)
  const onKeyCallback = useEventCallback<Interaction>(onKey)
  const touchId = useRef<number | null>(null)
  const hasTouch = useRef(false)
  // Cleanup for the in-flight drag's window listeners. Replaced on each drag
  // start; called on drag end and on unmount.
  const detach = useRef<() => void>(() => {})

  const handleMoveStart = ({ nativeEvent }: ReactMouseEvent | ReactTouchEvent) => {
    const el = container.current
    if (!el) return
    preventDefaultMove(nativeEvent)
    if (isInvalid(nativeEvent, hasTouch.current)) return
    if (isTouch(nativeEvent)) {
      hasTouch.current = true
      const changedTouches = nativeEvent.changedTouches || []
      if (changedTouches.length) touchId.current = changedTouches[0].identifier
    }
    el.focus()
    onMoveCallback(getRelativePosition(el, nativeEvent, touchId.current))

    const touch = hasTouch.current
    const win = getParentWindow(el)
    const moveType = touch ? 'touchmove' : 'mousemove'
    const endType = touch ? 'touchend' : 'mouseup'

    const handleMove = (event: MouseEvent | TouchEvent) => {
      preventDefaultMove(event)
      // If the user dragged outside the window and released, mouseup/touchend
      // never fired — check `buttons`/`touches.length` so we don't keep
      // tracking the cursor when no button is pressed.
      const isDown = isTouch(event) ? event.touches.length > 0 : event.buttons > 0
      if (isDown && container.current) {
        onMoveCallback(getRelativePosition(container.current, event, touchId.current))
      } else {
        detach.current()
      }
    }

    const handleMoveEnd = () => detach.current()

    win.addEventListener(moveType, handleMove)
    win.addEventListener(endType, handleMoveEnd)

    detach.current = () => {
      win.removeEventListener(moveType, handleMove)
      win.removeEventListener(endType, handleMoveEnd)
    }
  }

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    const keyCode = event.which || event.keyCode
    if (keyCode < 37 || keyCode > 40) return
    event.preventDefault()
    onKeyCallback({
      left: keyCode === 39 ? 0.05 : keyCode === 37 ? -0.05 : 0,
      top: keyCode === 40 ? 0.05 : keyCode === 38 ? -0.05 : 0,
    })
  }

  useEffect(() => () => detach.current(), [])

  return (
    <div
      {...rest}
      ref={container}
      onTouchStart={handleMoveStart}
      onMouseDown={handleMoveStart}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      // aria-valuenow is supplied by the consumer via {...rest}
      // biome-ignore lint/a11y/useAriaPropsForRole: see comment above
      role="slider"
      className={cn('outline-none touch-none select-none', className)}
    >
      {children}
    </div>
  )
}

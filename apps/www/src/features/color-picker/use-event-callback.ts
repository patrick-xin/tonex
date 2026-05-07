import { useRef } from 'react'

// Saves the latest handler to a ref so consumers don't have to re-memo it
// on every render. Adapted from react-colorful (MIT).
export function useEventCallback<T>(handler?: (value: T) => void): (value: T) => void {
  const callbackRef = useRef(handler)
  const fn = useRef((value: T) => {
    if (callbackRef.current) callbackRef.current(value)
  })
  callbackRef.current = handler
  return fn.current
}

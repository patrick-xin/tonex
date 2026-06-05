import { Testbed } from '@/features/testbed'

// why: server-component route shell. Testbed itself is a server component;
// each leaf carries its own 'use client'. The route stays prerender-safe
// even though every interactive piece is client-side. Open-item #2 closes
// here — 'use client' lives at the leaves, not the route.
export default function SinkPage() {
  return (
    <div className="p-6">
      <Testbed />
    </div>
  )
}

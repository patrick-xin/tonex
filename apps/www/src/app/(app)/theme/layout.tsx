import { EditorRail } from '@/features/editor-rail'

export default function ThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 size-full gap-2 overflow-hidden relative">
      <EditorRail />
      <div className="flex-1 flex flex-col h-[calc(100dvh-80px)] xl:h-[calc(100dvh-16px)] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

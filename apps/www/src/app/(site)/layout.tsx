export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-on-surface">
      <main className="flex-1">{children}</main>
    </div>
  )
}

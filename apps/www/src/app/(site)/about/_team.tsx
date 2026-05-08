const TEAM = [{ name: 'Patrick', role: 'Maker' }] as const

export function Team() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20">
      <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((member) => (
          <li
            key={member.name}
            className="rounded-lg border border-outline-variant/80 bg-surface-container p-4"
          >
            <p className="font-medium text-on-surface">{member.name}</p>
            <p className="text-sm text-on-surface-variant">{member.role}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

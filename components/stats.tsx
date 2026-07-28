import { Activity, Languages, Server, Users } from 'lucide-react'

const stats = [
  { icon: Users, value: '10,000+', label: 'Membres protégés', accent: false },
  { icon: Server, value: '50+', label: 'Serveurs Discord', accent: true },
  { icon: Activity, value: '< 15 ms', label: 'Latence passerelle', accent: false },
  { icon: Languages, value: '8+ Langues', label: 'Traduction instantanée', accent: true },
]

export function Stats() {
  return (
    <section id="statistiques" className="border-b border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 px-4 py-16 md:grid-cols-4">
        {stats.map(({ icon: Icon, value, label, accent }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon
              className={accent ? 'size-6 text-accent' : 'size-6 text-primary'}
              aria-hidden="true"
            />
            <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

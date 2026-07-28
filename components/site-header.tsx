import Image from 'next/image'
import { Zap } from 'lucide-react'
import { INVITE_URL } from '@/lib/constants'

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#top" className="group flex items-center gap-3">
          <span className="relative flex size-10 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/40 blur-md transition-opacity group-hover:opacity-100 md:opacity-70" />
            <Image
              src="/komorebi-avatar.png"
              alt="Avatar du bot Komorebi"
              width={80}
              height={80}
              priority
              className="relative size-10 rounded-full ring-1 ring-primary/50 transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-accent ring-2 ring-background">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/70" />
            </span>
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Komorebi Bot</span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              Gestion, Protection &amp; Animation de serveur
            </span>
          </span>
        </a>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex"
        >
          {[
            { href: '#fonctionnalites', label: 'Fonctionnalités' },
            { href: '#commandes', label: 'Commandes' },
            { href: '#statistiques', label: 'Statistiques' },
            { href: '#actus', label: 'Actus' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative transition-colors hover:text-foreground"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <a
          href={INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
        >
          <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,oklch(1_0_0/0.35),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
          <Zap className="relative size-4" aria-hidden="true" />
          <span className="relative">Inviter le Bot</span>
        </a>
      </div>
    </header>
  )
}

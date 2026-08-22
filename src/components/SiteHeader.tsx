import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="neon text-2xl font-black tracking-tight text-neon">TABELA</span>
          <span className="hidden text-[11px] font-medium uppercase tracking-widest text-muted sm:inline">
            .lol
          </span>
        </Link>

        <p className="ml-auto hidden text-sm text-muted md:block">
          İyi olan değil, <span className="text-text">iddialı</span> olan üstte.
        </p>

        <Link
          href="/ilan-ver"
          className="ml-auto rounded-full bg-neon px-4 py-2 text-sm font-bold text-ink transition hover:brightness-110 md:ml-4"
        >
          İlan Ver
        </Link>
      </div>
    </header>
  )
}

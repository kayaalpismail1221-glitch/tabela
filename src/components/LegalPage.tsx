import Link from 'next/link'
import { YURURLUK, SATICI_EKSIK } from '@/lib/legal'

/** Yasal metinlerin ortak kabugu — tipografi tek yerde. */
export function LegalPage({
  title,
  intro,
  children,
  kunyeUyarisi = false,
}: {
  title: string
  intro?: string
  children: React.ReactNode
  /** Satici kunyesi gerektiren metinlerde eksikligi gorunur kilar. */
  kunyeUyarisi?: boolean
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-text">
          Tabela
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">{title}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-black sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Yürürlük tarihi: {YURURLUK}</p>

      {intro && <p className="mt-5 text-text/80">{intro}</p>}

      {kunyeUyarisi && SATICI_EKSIK && (
        <p className="mt-6 rounded-xl border border-hot/40 bg-hot/5 px-4 py-3 text-sm text-hot">
          <strong>Taslak.</strong> Satıcı künyesi (unvan, adres, vergi dairesi ve numarası)
          henüz doldurulmamıştır. Bu metin, künye tamamlanana kadar bağlayıcı hâlini almamıştır.
        </p>
      )}

      <div className="mt-8 space-y-7">{children}</div>

      <p className="mt-12 border-t border-line pt-6 text-xs text-muted">
        Bu metinler bilgilendirme amacıyla hazırlanmıştır; nihai hâli için hukuki danışmanlık
        alınması önerilir.
      </p>
    </div>
  )
}

export function Madde({ no, baslik, children }: { no: number; baslik: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex gap-3 text-lg font-bold">
        <span className="shrink-0 tabular-nums text-neon">{no}.</span>
        <span>{baslik}</span>
      </h2>
      <div className="mt-2 space-y-3 pl-8 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  )
}

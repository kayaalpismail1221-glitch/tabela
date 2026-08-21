import type { Rakamlar } from '@/lib/stats'
import { yasSozu } from '@/lib/stats'
import { tl } from '@/lib/format'

/**
 * Sayfanin en alti: tek bir rakam, buyuk. outbid.lol'un durustlugu —
 * saklamak yerine one koymak. 0 ₺ ise 0 ₺ yazar; saklandigi an tahtanin
 * butun iddiasi coker.
 */
export function TotalRaised({ r }: { r: Rakamlar }) {
  return (
    <section className="mt-20 text-center">
      <p className="text-sm text-muted">Bu tahta şu ana kadar</p>

      <div className="mx-auto mt-3 w-fit rounded-2xl border border-line bg-surface/60 px-6 py-5 sm:px-12 sm:py-7">
        <span className="neon block text-4xl font-black tabular-nums tracking-tight text-neon sm:text-6xl">
          {tl(r.hacim)}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted">topladı — {yasSozu(r)} açıldı</p>
    </section>
  )
}

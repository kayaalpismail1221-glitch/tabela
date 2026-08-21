import Link from 'next/link'
import { SATICI } from '@/lib/legal'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface/40 sm:mt-24">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted">
        {/* Reklam Kurulu sarti: parali siralama acikca beyan edilmeli. */}
        <p className="rounded-lg border border-line bg-surface px-4 py-3 text-text">
          <strong className="text-neon">Sponsorlu sıralama.</strong> Bu listede sıra, verilen
          teklife göre belirlenir. Kalite, hijyen veya lezzet değerlendirmesi değildir.
        </p>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/kurallar" className="hover:text-text">
            Kurallar
          </Link>
          <Link href="/mesafeli-satis" className="hover:text-text">
            Mesafeli Satış Sözleşmesi
          </Link>
          <Link href="/iptal-iade" className="hover:text-text">
            İptal ve İade Koşulları
          </Link>
          <Link href="/gizlilik" className="hover:text-text">
            Gizlilik ve KVKK
          </Link>
          <Link href="/ilan-ver" className="hover:text-text">
            İlan Ver
          </Link>
          <a href={`mailto:${SATICI.eposta}`} className="hover:text-text">
            İletişim
          </a>
        </div>

        <p className="mt-6 text-xs text-muted/70">
          Tabela — Türkiye’nin restoran tahtası. Instagram, Meta Platforms’a aittir; bu site
          Instagram ile ilişkili değildir.
        </p>
      </div>
    </footer>
  )
}

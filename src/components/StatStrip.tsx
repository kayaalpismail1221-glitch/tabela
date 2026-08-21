import type { Rakamlar } from '@/lib/stats'
import { yasSozu } from '@/lib/stats'
import { tl } from '@/lib/format'

function Kutu({
  etiket,
  deger,
  alt,
  vurgu = false,
}: {
  etiket: string
  deger: string
  alt?: string
  vurgu?: boolean
}) {
  return (
    <div
      className={
        vurgu
          ? 'rounded-xl border border-neon/40 bg-neon/5 px-3 py-2.5'
          : 'rounded-xl border border-line bg-surface/50 px-3 py-2.5'
      }
    >
      <div className="text-[10px] uppercase tracking-wider text-muted">{etiket}</div>
      <div
        className={`font-black tabular-nums leading-tight ${vurgu ? 'text-lg text-neon sm:text-xl' : 'text-base sm:text-lg'}`}
      >
        {deger}
      </div>
      {alt && <div className="mt-0.5 text-[10px] text-muted">{alt}</div>}
    </div>
  )
}

export function StatStrip({ r }: { r: Rakamlar }) {
  const sayi = (n: number) => n.toLocaleString('tr-TR')

  return (
    <dl className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
      <Kutu etiket="toplanan" deger={tl(r.hacim)} alt={`${sayi(r.teklif)} teklif`} vurgu />
      <Kutu
        etiket="açık kaldığı süre"
        deger={yasSozu(r)}
        alt={r.sonGun > 0 ? `son 24 saatte ${sayi(r.sonGun)} teklif` : 'son 24 saat sessiz'}
      />
      <Kutu etiket="zirve" deger={r.zirve > 0 ? tl(r.zirve) : '—'} alt="en yüksek teklif" />
      <Kutu etiket="ilan" deger={sayi(r.ilan)} alt={`${sayi(r.tiklama)} tıklama`} />
      <Kutu etiket="şehir" deger={`${r.sehir} / 81`} alt={`${81 - r.sehir} il boş`} />
      <Kutu
        etiket="taht el değiştirdi"
        deger={sayi(r.elDegistirme)}
        alt={r.elDegistirme === 0 ? 'henüz kimse zirveye oturmadı' : 'kez'}
      />
    </dl>
  )
}

/**
 * outbid.lol'un durustlugu: rakami saklamak yerine one koymak.
 * 0 ₺ yaziyorsa 0 ₺ yazar — saklandigi an tahtanin butun iddiasi coker.
 */
export function StatSentence({ r }: { r: Rakamlar }) {
  return (
    <p className="mt-16 text-center text-sm text-muted">
      Bu tahta <span className="text-text">{yasSozu(r)}</span> açık ve şu ana kadar{' '}
      <span className="font-bold text-neon">{tl(r.hacim)}</span> topladı.
      {r.ilan > 0 && (
        <>
          {' '}
          {r.ilan.toLocaleString('tr-TR')} ilan, {r.sehir} şehir,{' '}
          {r.tiklama.toLocaleString('tr-TR')} tıklama.
        </>
      )}
    </p>
  )
}

import type { Champion } from '@/lib/board'
import { HARITA_VIEWBOX, IL_YOLLARI, IL_MERKEZLERI } from '@/lib/turkeyMap'
import { tl } from '@/lib/format'

/**
 * CANLI HARITA — sehir secmenin gorsel yolu.
 *
 * Tamamen SUNUCUDA ciziliyor: her il duz bir baglanti, vurgu ve il adi CSS
 * :hover. 81 ile tiklama dinleyicisi baglayan bir harita, tahtanin en ucuz
 * olmasi gereken yerinde en pahali seyi olurdu.
 *
 * IKI KATMAN, sebebi onemli: SVG'de z-index yok, boyama sirasi belge sirasi.
 * Amblem ve il adi ILLERLE ayni katmanda olsaydi, plakasi kucuk bir ilin
 * rozeti kendisinden sonra cizilen komsusunun altinda kalirdi (Bilecik'in
 * adi Bursa'nin altina girerdi). Bu yuzden once butun iller, sonra butun
 * rozetler ciziliyor; rozet katmani tiklamayi gecirmiyor.
 *
 * Renk = o ilin 1 numarasinin teklifi. Bos il karanlik durur; karanlik il
 * "burasi bos" demenin en kisa yolu ve tahtanin sattigi sey o boslugun
 * kendisi.
 */

/** Amblem yaricapi; ilin ic dairesine sigacak sekilde kirpiliyor. */
const AMBLEM_MIN = 8
const AMBLEM_MAX = 13

/** Cizim alaninin sol/sag kenarlari — il adinin kirpilmamasi icin gerekli. */
const SOL_KENAR = 8
const SAG_KENAR = 1043
/** Kenara bu kadar yaklasan ilin adi ortalanmaz, ile yapisik yazilir. */
const KENAR_PAYI = 110

export function TurkeyMap({
  champions,
  hacim,
  tahtDegisimi,
}: {
  champions: Champion[]
  hacim: number
  /** Tahtin kac kez el degistirdigi — paranin yaninda duran tek drama rakami. */
  tahtDegisimi: number
}) {
  const enYuksek = champions.reduce((m, c) => Math.max(m, c.listing?.currentBid ?? 0), 0)
  const dolu = champions.filter((c) => c.listing).length

  // Uzerine gelinen ilin adini gosteren kural. Tek satirla yazilamiyor: ad
  // baska bir katmanda durdugu icin CSS'in iki ogeyi eslestirmesi gerekiyor
  // ve bunun tek yolu il basina bir :has() kurali.
  const adKurallari = champions
    .map((c) => `.harita:has(a[href="/${c.citySlug}"]:hover) .ad-${c.citySlug}{opacity:1}`)
    .join('')

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-black">Canlı harita</h2>

        {/* Toplanan para haritanin kosesinde. Sayfanin dibinde dev bir rakam
            olarak duruyordu; orada 0 ₺ yazdiginda tahtanin butun iddiasi
            cokuyordu. Kosede, olcusunde. */}
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-sm font-black tabular-nums text-neon">
            <span aria-hidden>👑</span> Toplam {tl(hacim)}
          </span>
          <p className="mt-1 text-xs text-muted">
            {dolu > 0 ? (
              <>
                <span className="text-neon">{dolu}</span> şehirde taht kuruldu,{' '}
                <span className="text-text">{81 - dolu}</span> il boş
              </>
            ) : (
              <>81 il de boş. Haritadan seç, ilk sen tut.</>
            )}
          </p>
        </div>
      </div>

      <div className="harita mt-4 rounded-2xl border border-line bg-surface/40 p-3 sm:p-5">
        <svg
          viewBox={HARITA_VIEWBOX}
          className="h-auto w-full"
          role="img"
          aria-label="Türkiye haritası — şehir seçmek için ile tıkla"
        >
          <style>{adKurallari}</style>

          {/* 1) Iller — tiklanabilir katman */}
          <g className="iller">
            {champions.map((c) => {
              const yol = IL_YOLLARI[c.plaka]
              if (!yol) return null

              const teklif = c.listing?.currentBid ?? 0
              const oran = enYuksek > 0 ? teklif / enYuksek : 0
              // Dolu ilin en ucuzu bile gorunur olsun diye %30'dan basliyor.
              const dolgu = teklif
                ? `color-mix(in srgb, var(--color-neon) ${Math.round(30 + oran * 70)}%, var(--color-surface-2))`
                : 'var(--color-surface-2)'

              return (
                <a key={c.citySlug} href={`/${c.citySlug}`} aria-label={etiket(c)}>
                  <path d={yol} style={{ fill: dolgu }} />
                </a>
              )
            })}
          </g>

          {/* 2) Rozetler — hep ustte, tiklamayi gecirmez */}
          <g className="rozetler">
            {champions.map((c) => {
              const merkez = IL_MERKEZLERI[c.plaka]
              if (!merkez) return null
              const [x, y, ic] = merkez
              const r = Math.min(AMBLEM_MAX, Math.max(AMBLEM_MIN, ic))

              return (
                <g key={c.citySlug}>
                  {c.listing && <Amblem plaka={c.plaka} x={x} y={y} r={r} listing={c.listing} />}
                  <text
                    className={`ad ad-${c.citySlug}`}
                    /* Ortalanan uzun bir ad kenardaki illerde cizim alanindan
                       tasip kirpiliyordu (Canakkale, Hakkari). Kenara yakinsa
                       ad ortalanmiyor, ilden ice dogru yaziliyor. */
                    x={x}
                    y={y - (c.listing ? r : 0) - 7}
                    textAnchor={
                      x < SOL_KENAR + KENAR_PAYI
                        ? 'start'
                        : x > SAG_KENAR - KENAR_PAYI
                          ? 'end'
                          : 'middle'
                    }
                  >
                    {etiket(c)}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <p className="mt-2 text-xs text-muted">
        İl ne kadar parlaksa oradaki 1 numaranın teklifi o kadar yüksek. Karanlık iller boş.
        {tahtDegisimi > 0 && (
          <>
            {' '}
            Taht bugüne kadar{' '}
            <span className="text-text">{tahtDegisimi.toLocaleString('tr-TR')}</span> kez el
            değiştirdi.
          </>
        )}
      </p>
    </section>
  )
}

/** Uzerine gelince cikan tek satir. Bos ilde davet, dolu ilde rakam. */
function etiket(c: Champion): string {
  return c.listing ? `${c.cityName} · ${tl(c.listing.currentBid)}` : `${c.cityName} · boş`
}

/**
 * Ilin 1 numarasinin amblemi. Gorsel varsa daire icine kirpiliyor; Instagram
 * ilanlarinin herkese acik profil fotografi olmadigi icin cogunda harf kalir
 * (bkz. src/lib/logo.ts).
 */
function Amblem({
  plaka,
  x,
  y,
  r,
  listing,
}: {
  plaka: number
  x: number
  y: number
  r: number
  listing: NonNullable<Champion['listing']>
}) {
  const kirpma = `amblem-${plaka}`

  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--color-ink)" stroke="var(--color-neon)" strokeWidth={1.4} />
      {listing.imageUrl ? (
        <>
          <clipPath id={kirpma}>
            <circle cx={x} cy={y} r={r - 1.4} />
          </clipPath>
          <image
            href={listing.imageUrl}
            x={x - r + 1.4}
            y={y - r + 1.4}
            width={(r - 1.4) * 2}
            height={(r - 1.4) * 2}
            clipPath={`url(#${kirpma})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <text className="harf" x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={r}>
          {listing.name.trim().charAt(0).toLocaleUpperCase('tr-TR')}
        </text>
      )}
    </g>
  )
}

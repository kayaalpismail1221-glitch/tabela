'use client'

/**
 * Sunucu hatasinda Vercel'in ham ingilizce ekrani yerine bu cikar.
 * Hatayi GIZLEMIYOR — gercek sebep sunucu logunda duruyor, burada sadece
 * ziyaretciye anlamli bir sey gosteriyoruz.
 *
 * Anasayfaya donerken bilerek TAM SAYFA yenileme yapiyoruz (next/link degil):
 * uygulama bozuk durumdayken istemci tarafi gecis de bozuk olabilir.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
      <h1 className="neon text-5xl font-black text-neon">Tahta düştü</h1>
      <p className="mt-4 text-lg font-bold">Bir şeyler ters gitti.</p>
      <p className="mt-1 text-sm text-muted">
        Sunucuya ulaşılamadı. Birazdan tekrar dene; sorun sürerse bize yaz.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-neon px-6 py-3 font-bold text-ink transition hover:brightness-110"
        >
          Tekrar dene
        </button>
        <button
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- kasitli: bozuk durumda istemci tarafi gecise guvenmiyoruz
          onClick={() => window.location.assign('/')}
          className="rounded-full border border-line px-6 py-3 font-bold transition hover:border-neon/60"
        >
          Anasayfa
        </button>
      </div>
    </div>
  )
}

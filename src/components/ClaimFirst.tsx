'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Anasayfanin girisi.
 *
 * Basligin altinda bir zamanlar "1 numarayi 450 ₺'ye al" diye bir fiyat
 * sayaci vardi. Kaldirildi (2026-08-22 kullanici karari): ziyaretcinin ilk
 * gordugu sey etiket fiyati olunca tahta bir urun rafina donuyordu. Fiyat
 * artik ait oldugu yerde — ilan formunda.
 *
 * Yerini 1 NUMARANIN DURUMU aldi: bos mu, kimde, ne kadardir. Rakip gormek
 * fiyat gormekten daha iyi bir davet.
 *
 * Ekran metninde "taht" kelimesi kullanilmiyor (2026-08-22 kullanici karari) —
 * memleket.lol'un dili, calinti duruyor. Bizim dilimiz isletme dili: "1 numara".
 *
 * ⚠️ `soz` (ne kadardir 1 numara oldugu) `null` olabilir — `Listing.topSince`
 * yalnizca GERCEK odeme akisindan gecen tekliflerde dolduruluyor
 * (`tahtiGuncelle`, bkz. bids.ts). Eski/elle olusturulmus bir kayit hala
 * 1 numaraysa ama topSince bos kaldiysa "1 numara YOK" demek YANLIS olur —
 * bir kere gercekten yasandi (2026-08-22). `zirve` var oldugu surece ismi
 * her zaman gosterilir, sure bilgisi varsa eklenir.
 */
export function ClaimFirst({
  zirve,
}: {
  /** 1 numarayi su an kim tutuyor. `soz` sunucuda hesaplandi (hidrasyon icin);
   *  ne kadardir tuttugu bilinmiyorsa null. */
  zirve?: { id: string; name: string; soz: string | null } | null
}) {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-3xl font-black leading-[1.1] sm:text-5xl">
        Türkiye&apos;nin ve şehrinin
        <br />
        <span className="neon text-neon">en popüler</span> işletmesi ol
      </h1>

      {zirve ? (
        <p className="mt-5 text-base text-muted sm:text-lg">
          Şu an Türkiye’nin 1 numarası:{' '}
          <Link href={`/ilan/${zirve.id}`} className="font-bold text-text hover:text-neon">
            {zirve.name}
          </Link>
          {zirve.soz && (
            <>
              <br />
              <span className="text-sm">{zirve.soz}</span>
            </>
          )}
        </p>
      ) : (
        <p className="mt-5 text-base text-muted sm:text-lg">
          Henüz 1 numara yok. İlk ilanı veren alır.
        </p>
      )}

      <p className="mx-auto mt-3 max-w-lg text-balance text-sm text-muted">
        Hem şehrinin hem de Türkiye&apos;nin tahtasında görünürsün.
      </p>

      <button
        onClick={() => router.push('/ilan-ver')}
        className="mt-6 rounded-full bg-neon px-8 py-3 font-black text-ink transition hover:brightness-110"
      >
        Tahtaya çık
      </button>
    </div>
  )
}

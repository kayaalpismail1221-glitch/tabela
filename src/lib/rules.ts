// Teklif kurallari — TEK KAYNAK.
// Tutarlarin tamami KURUS cinsinden tutulur (float yok, yuvarlama hatasi yok).
//
// NOT: Asagidaki uc rakam su an yer tutucu. Gercek deger, restoranlarla
// yapilacak fiyat gorusmesinden cikacak. Degistirmek icin sadece burasi.

/** Listeye ilk giris icin taban teklif. */
export const TABAN_TEKLIF = 10_000 // 100 TL

/** Kendi ilanini yukseltirken zorunlu en kucuk artis. */
export const MIN_ARTIS = 5_000 // 50 TL

/** 1 numarayi almak icin mevcut liderin en az bu kadar ustune cikmak gerekir.
 *  Ufak artislarla zirveyi taciz etmeyi engeller. */
export const ZIRVE_FARKI = 10_000 // 100 TL

export type BidCheck =
  | { ok: true; paid: number }
  | { ok: false; reason: string; minimum: number }

/**
 * Bir teklifin gecerli olup olmadigini soyler ve tahsil edilecek farki dondurur.
 *
 * @param amount        teklifin ulasmak istedigi TOPLAM tutar (kurus)
 * @param listingCurrent ilanin su anki teklifi (yeni ilan icin 0)
 * @param topBid        tahtadaki en yuksek teklif (bos tahtada 0)
 */
export function checkBid(amount: number, listingCurrent: number, topBid: number): BidCheck {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, reason: 'Gecersiz tutar.', minimum: TABAN_TEKLIF }
  }

  // 1) Taban: listeye girmenin bedeli
  if (amount < TABAN_TEKLIF) {
    return { ok: false, reason: 'Taban teklifin altinda.', minimum: TABAN_TEKLIF }
  }

  // 2) Kendi ilanini yukseltiyorsan en az MIN_ARTIS kadar artirmalisin
  if (listingCurrent > 0 && amount < listingCurrent + MIN_ARTIS) {
    return {
      ok: false,
      reason: 'Kendi teklifini en az bu kadar artirmalisin.',
      minimum: listingCurrent + MIN_ARTIS,
    }
  }

  // 3) Zirveyi hedefliyorsan liderin ZIRVE_FARKI kadar ustune cikmalisin.
  //    Zirvenin altinda kalan teklifler bu kuraldan muaf.
  const zirveEsigi = topBid + ZIRVE_FARKI
  if (amount > topBid && topBid > 0 && amount < zirveEsigi) {
    return {
      ok: false,
      reason: '1 numarayi almak icin liderin bu kadar ustune cikmalisin.',
      minimum: zirveEsigi,
    }
  }

  // Kendi ilanini yukseltirken sadece farki odersin.
  return { ok: true, paid: amount - listingCurrent }
}

/** Kullaniciya "en az su kadar" demek icin hazir rakam. */
export function suggestedMinimum(listingCurrent: number): number {
  if (listingCurrent === 0) return Math.max(TABAN_TEKLIF, 0)
  return listingCurrent + MIN_ARTIS
}

/** Zirveyi almanin bedeli. */
export function priceOfFirstPlace(topBid: number): number {
  return topBid === 0 ? TABAN_TEKLIF : topBid + ZIRVE_FARKI
}

/**
 * Belirli bir rakibi gecmenin bedeli — "uste cikildin" mailinin ve ilan
 * sayfasindaki "geri al" onerisinin ayni rakami soylemesi icin TEK KAYNAK.
 *
 * Uc kurali birden saglayan en kucuk tutari dondurur: rakibin ustune cikmak,
 * kendi teklifini MIN_ARTIS kadar artirmak, zirveyi hedefliyorsa ZIRVE_FARKI.
 * Sonuc her zaman checkBid'den gecer.
 *
 * @param hedefBid rakibin su anki teklifi
 * @param kendiBid bizim su anki teklifimiz (yeni ilan icin 0)
 * @param topBid   tahtadaki en yuksek teklif
 */
export function priceToPass(hedefBid: number, kendiBid: number, topBid: number): number {
  let tutar = Math.max(hedefBid + MIN_ARTIS, TABAN_TEKLIF)
  if (kendiBid > 0) tutar = Math.max(tutar, kendiBid + MIN_ARTIS)
  // Zirveyi asiyorsak zirve kuralina da uymak zorunda.
  if (topBid > 0 && tutar > topBid) tutar = Math.max(tutar, topBid + ZIRVE_FARKI)
  return tutar
}

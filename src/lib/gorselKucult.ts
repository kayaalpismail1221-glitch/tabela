import { AMBLEM_EN_BUYUK } from './amblem'

/**
 * Secilen fotografi dosyadan tarayici Image'ina yukler. Kirpma araci
 * (`LogoKirp.tsx`) bunu once cagirir, kullanici kareyi secer, sonra
 * `kareyeSikistir` cagrilir.
 */
export async function gorselYukle(dosya: File): Promise<HTMLImageElement> {
  const veriUrl = await new Promise<string>((coz, hata) => {
    const okuyucu = new FileReader()
    okuyucu.onload = () => coz(String(okuyucu.result))
    okuyucu.onerror = () => hata(new Error('DOSYA_OKUNAMADI'))
    okuyucu.readAsDataURL(dosya)
  })

  return new Promise<HTMLImageElement>((coz, hata) => {
    const g = new Image()
    g.onload = () => coz(g)
    g.onerror = () => hata(new Error('GORSEL_ACILAMADI'))
    g.src = veriUrl
  })
}

/** Amblem tahtada en fazla 72px gorunuyor; retina (2x) icin fazlasiyla yeterli. */
const KENAR = 144

/** Sirayla denenen kalite degerleri; ilki cogu fotografta yeterli. */
const KALITE_ADIMLARI = [0.82, 0.65, 0.5, 0.35, 0.2]

/** Sunucu sinirindan pay birak — tam kenardan kesmesin. */
const HEDEF_BOYUT = AMBLEM_EN_BUYUK - 4_000

/** Yuklu bir gorselin, KENDI piksellerinde tarif edilen bir kare parcasi. */
export type KareKirpma = { sx: number; sy: number; s: number }

/**
 * Verilen kare bolgeyi amblem boyutuna indirir — TARAYICIDA.
 *
 * Sebep: telefondan secilen bir fotograf 2-5 MB. Ham hâliyle data URI'ye
 * cevrilirse hem istek sismis olur hem de sunucu tarafindaki amblem siniri
 * (`AMBLEM_EN_BUYUK`, bkz. `src/lib/amblem.ts`) onu reddeder.
 *
 * Kucultmeyi istemci yapiyor: sunucuda `sharp` ile yapmak Vercel'de ayri bir
 * tuzak (bkz. Culinora'daki sharp notu) ve buradaki is zaten tek bir kare.
 *
 * ⚠️ Sabit kalitede tek gecis YETMEDI: gercek fotograflar (ozellikle yemek
 * fotograflari — dokulu, gurultulu) webp'de sanildigindan buyuk cikiyor ve
 * 80 KB siniri kolayca asiliyordu. Sunucu sessizce reddedince kullanici
 * formda logoyu goruyor, gonderiyor, ilan logosuz cikiyordu — hic hata
 * gormeden. Simdi kalite kademeli dusuruluyor, sunucunun kabul edecegi
 * boyuta oturana kadar.
 */
export function kareyeSikistir(gorsel: HTMLImageElement, kirpma: KareKirpma): string {
  const tuval = document.createElement('canvas')
  tuval.width = KENAR
  tuval.height = KENAR
  const ctx = tuval.getContext('2d')
  if (!ctx) return gorsel.src

  ctx.drawImage(gorsel, kirpma.sx, kirpma.sy, kirpma.s, kirpma.s, 0, 0, KENAR, KENAR)

  // Ilk kalite cogu fotografta yeterli; sigmazsa kademeli dusur. Son adimda
  // bile sigmasa yine de en dusuk kaliteyi dondur — bos donmekten iyi, sunucu
  // gerekirse reddeder ama bu artik cok nadir bir durum.
  let sonuc = tuval.toDataURL('image/webp', KALITE_ADIMLARI[0])
  for (let i = 1; i < KALITE_ADIMLARI.length && sonuc.length > HEDEF_BOYUT; i++) {
    sonuc = tuval.toDataURL('image/webp', KALITE_ADIMLARI[i])
  }

  return sonuc
}

/**
 * Eski tek-adimli yol: dosyayi otomatik ORTADAN kare kirpar. Kirpma araci
 * acilamadigi bir durum icin (ör. JS hatasi) yedek olarak birakildi;
 * normal akista `gorselYukle` + `LogoKirp` + `kareyeSikistir` kullanilir.
 */
export async function gorselKucult(dosya: File): Promise<string> {
  const gorsel = await gorselYukle(dosya)
  const kenar = Math.min(gorsel.width, gorsel.height)
  return kareyeSikistir(gorsel, {
    sx: (gorsel.width - kenar) / 2,
    sy: (gorsel.height - kenar) / 2,
    s: kenar,
  })
}

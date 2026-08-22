/**
 * Galeriden secilen fotografi amblem boyuna indirir — TARAYICIDA.
 *
 * Sebep: telefondan secilen bir fotograf 2-5 MB. Ham hâliyle data URI'ye
 * cevrilirse hem istek sismis olur hem de sunucu tarafindaki amblem siniri
 * (80 KB) onu reddeder ve kullanici NEDEN oldugunu anlamadan logosuz kalir.
 *
 * Kucultmeyi istemci yapiyor: sunucuda `sharp` ile yapmak Vercel'de ayri bir
 * tuzak (bkz. Culinora'daki sharp notu) ve buradaki is zaten tek bir kare.
 */

/** Amblem tahtada 40px gorunuyor; 192 retina icin fazlasiyla yeterli. */
const KENAR = 192

export async function gorselKucult(dosya: File): Promise<string> {
  const veriUrl = await new Promise<string>((coz, hata) => {
    const okuyucu = new FileReader()
    okuyucu.onload = () => coz(String(okuyucu.result))
    okuyucu.onerror = () => hata(new Error('DOSYA_OKUNAMADI'))
    okuyucu.readAsDataURL(dosya)
  })

  const gorsel = await new Promise<HTMLImageElement>((coz, hata) => {
    const g = new Image()
    g.onload = () => coz(g)
    g.onerror = () => hata(new Error('GORSEL_ACILAMADI'))
    g.src = veriUrl
  })

  const tuval = document.createElement('canvas')
  tuval.width = KENAR
  tuval.height = KENAR
  const ctx = tuval.getContext('2d')
  if (!ctx) return veriUrl

  // Kare kirp (cover): logolar genelde kare, dikdortgen olan da ortasindan
  // kirpilinca amblem olarak dogru duruyor.
  const kenar = Math.min(gorsel.width, gorsel.height)
  const sx = (gorsel.width - kenar) / 2
  const sy = (gorsel.height - kenar) / 2
  ctx.drawImage(gorsel, sx, sy, kenar, kenar, 0, 0, KENAR, KENAR)

  // webp desteklenmezse tarayici sessizce png dondurur; ikisi de kabul edilen tur.
  return tuval.toDataURL('image/webp', 0.82)
}

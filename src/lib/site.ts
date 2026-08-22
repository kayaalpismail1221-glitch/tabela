/**
 * Sitenin kendi adresi — TEK KAYNAK.
 *
 * Mail icindeki baglantilar mutlak olmak zorunda; istek baglami olmayan
 * yerlerden (arka plan gorevi, callback sonrasi) de cagriliyor. Bu yuzden
 * adres istekten degil ortamdan cozuluyor.
 */

/** Kanonik alan adi. Alan adi degisirse degisecek TEK satir. */
export const ALAN_ADI = 'https://tabela.lol'

export function siteUrl(): string {
  // Elle verilen her zaman kazanir (ozel bir ortam, gecici bir alan adi...).
  const acik = process.env.SITE_URL?.trim()
  if (acik) return acik.replace(/\/+$/, '')

  // Production dagitimi HER ZAMAN kendi alan adimizdan konusur. Vercel'in
  // kendi degiskenine birakmiyoruz: mailden gelen kullanici *.vercel.app
  // adresine dusmesin, paylasilan baglanti markayi tasisin.
  if (process.env.VERCEL_ENV === 'production') return ALAN_ADI

  // Onizleme dagitimlari kendi adreslerinde kalsin.
  const deploy = process.env.VERCEL_URL?.trim()
  if (deploy) return `https://${deploy}`

  return 'http://localhost:3000'
}

/** Mutlak baglanti: `mutlak('/ilan/abc')` */
export function mutlak(yol: string): string {
  return siteUrl() + (yol.startsWith('/') ? yol : `/${yol}`)
}

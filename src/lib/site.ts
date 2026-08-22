/**
 * Sitenin kendi adresi — TEK KAYNAK.
 *
 * Mail icindeki baglantilar mutlak olmak zorunda; istek baglami olmayan
 * yerlerden (arka plan gorevi, callback sonrasi) de cagriliyor. Bu yuzden
 * adres istekten degil ortamdan cozuluyor.
 *
 * Sira: elle verilen SITE_URL > Vercel'in production adresi > o anki deploy
 * adresi > lokal. Alan adi degisince yalnizca SITE_URL degisir.
 */
export function siteUrl(): string {
  const acik = process.env.SITE_URL?.trim()
  if (acik) return acik.replace(/\/+$/, '')

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (prod) return `https://${prod}`

  const deploy = process.env.VERCEL_URL?.trim()
  if (deploy) return `https://${deploy}`

  return 'http://localhost:3000'
}

/** Mutlak baglanti: `mutlak('/ilan/abc')` */
export function mutlak(yol: string): string {
  return siteUrl() + (yol.startsWith('/') ? yol : `/${yol}`)
}

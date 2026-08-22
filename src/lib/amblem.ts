/**
 * Istemciden gelen amblem data URI'sinin kurallari — TEK KAYNAK.
 *
 * Istemci (`gorselKucult.ts`) kucultme hedefini buradan okur, sunucu
 * (`api/listings`) dogrulamayi buradan yapar. Iki taraf ayni sayiyi
 * AYRI AYRI tutuyordu ve bu tam da sessiz kaybolan logo hatasinin sebebiydi:
 * istemci 192px'e kucultuyordu ama gercek fotograflar (ozellikle yemek
 * fotograflari, dokulu/gurultulu) webp'de sanildigindan buyuk cikiyor,
 * sunucunun 80 KB siniri asilinca amblem SESSIZCE reddediliyordu —
 * kullanici formda goruyor, gonderiyor, ilan logosuz cikiyordu.
 *
 * SVG bilerek DISARIDA: SVG bir belge formati, script tasiyabiliyor ve
 * amblem hicbir yerde bunu gerektirmiyor.
 */
export const AMBLEM_TURU =
  /^data:image\/(webp|png|jpeg|jpg|gif|x-icon|vnd\.microsoft\.icon);base64,[A-Za-z0-9+/=]+$/
export const AMBLEM_EN_BUYUK = 80_000

export function gecerliAmblem(v: unknown): string | null {
  if (typeof v !== 'string' || v.length > AMBLEM_EN_BUYUK) return null
  return AMBLEM_TURU.test(v) ? v : null
}

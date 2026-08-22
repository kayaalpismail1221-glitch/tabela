import { createHmac, randomInt, timingSafeEqual } from 'crypto'
import { cityName } from './cities'

/**
 * SHOPIER — barindirilan odeme sayfasi.
 *
 * Neden Shopier (2026-08-22 kullanici karari): **bireysel saticiya acik**.
 * Tuzel kisilik beklemeden tahsilata baslanabiliyor ve Culinora'nin Iyzico
 * uye isyerini paylasma riski ortadan kalkiyor (o hesap dondurulursa
 * Culinora'nin tahsilati da dururdu).
 *
 * Akis Iyzico'dakinin aynisi degil: Shopier bize gidilecek bir adres
 * DONDURMUYOR, imzalanmis bir FORM POST'u bekliyor. Bu yuzden kullaniciyi
 * once kendi `/odeme/[token]` sayfamiza yolluyoruz, form orada kurulup
 * Shopier'e gonderiliyor.
 *
 * Kart bilgisi hicbir asamada bizim sunucumuza dokunmuyor (PCI SAQ-A).
 *
 * ⚠️ Callback adresi istekle GONDERILMIYOR — Shopier panelinden tanimlaniyor.
 * Panelde `/api/shopier/callback` adresi tanimli degilse odeme alinir ama
 * teklif uygulanmaz.
 */

export const SHOPIER_UC = 'https://www.shopier.com/ShowProduct/api_pay4.php'

export const SHOPIER_HAZIR = Boolean(
  process.env.SHOPIER_API_KEY && process.env.SHOPIER_API_SECRET
)

/** Shopier hesabindaki site sirasi (1-5). Tek siten varsa 1. */
const SITE_SIRASI = process.env.SHOPIER_WEBSITE_INDEX?.trim() || '1'

/** Shopier sabitleri — sayi olarak gidiyor, degistirmeden once dogrula. */
const TL = '0'
const TURKCE = '0'
const SANAL_URUN = '1' // indirilebilir/sanal: kargo yok
const CERCEVE_YOK = '0'
const PLATFORM = '0'
const MODUL = 'tabela-1.0'

function secret(): string {
  return process.env.SHOPIER_API_SECRET ?? ''
}

/**
 * Imza — hem giden formda hem donen bildirimde AYNI formul:
 * base64( HMAC-SHA256( random_nr + platform_order_id + total_order_value + currency ) )
 */
function imzala(randomNr: string, siparisId: string, tutar: string, paraBirimi: string): string {
  return createHmac('sha256', secret())
    .update(randomNr + siparisId + tutar + paraBirimi)
    .digest('base64')
}

/** Kurus -> Shopier'in bekledigi ondalikli dize ("125.00") */
function fiyat(kurus: number): string {
  return (kurus / 100).toFixed(2)
}

/** "Ismail Kayaalp" -> ["Ismail", "Kayaalp"]; tek kelimeyse soyad "-". */
function adSoyad(tam: string): [string, string] {
  const parcalar = tam.trim().split(/\s+/)
  if (parcalar.length < 2) return [tam.trim() || '-', '-']
  return [parcalar.slice(0, -1).join(' '), parcalar[parcalar.length - 1]]
}

export type OdemeFormu = { url: string; alanlar: Record<string, string> }

/**
 * Shopier'e gonderilecek formu kurar. Hicbir ag istegi yapmaz — imza yerel.
 *
 * @param bidId  kendi teklif kaydimiz; Shopier'e `platform_order_id` olarak
 *               gidiyor ve donusteki tek baglantimiz o
 * @param kurus  tahsil edilecek tutar (teklifin FARKI)
 */
export function odemeFormu(params: {
  bidId: string
  kurus: number
  urunAdi: string
  alici: { ad: string; email: string; telefon?: string | null; sehir: string }
}): OdemeFormu {
  const { bidId, kurus, urunAdi, alici } = params

  const tutar = fiyat(kurus)
  const randomNr = String(randomInt(1_000_000, 9_999_999))
  const [ad, soyad] = adSoyad(alici.ad)
  const sehir = cityName(alici.sehir)

  // Adres toplamiyoruz (dijital hizmet, kargo yok). Sehir disinda alan yok;
  // ⚠️ sabit posta kodu Iyzico'daki uydurma TCKN'nin esdegeri — fraud
  // skorlamasini etkileyebilir, uye isyeri acilisinda sorulmali.
  const adres = {
    address: sehir,
    city: sehir,
    country: 'Türkiye',
    postcode: '34000',
  }

  const alanlar: Record<string, string> = {
    API_key: process.env.SHOPIER_API_KEY ?? '',
    website_index: SITE_SIRASI,
    platform_order_id: bidId,
    product_name: urunAdi.slice(0, 60),
    product_type: SANAL_URUN,

    buyer_name: ad,
    buyer_surname: soyad,
    buyer_email: alici.email,
    buyer_account_age: '0',
    buyer_id_nr: bidId,
    buyer_phone: alici.telefon || '',

    billing_address: adres.address,
    billing_city: adres.city,
    billing_country: adres.country,
    billing_postcode: adres.postcode,

    shipping_address: adres.address,
    shipping_city: adres.city,
    shipping_country: adres.country,
    shipping_postcode: adres.postcode,

    total_order_value: tutar,
    currency: TL,
    platform: PLATFORM,
    is_in_frame: CERCEVE_YOK,
    current_language: TURKCE,
    modul_version: MODUL,
    random_nr: randomNr,
    signature: imzala(randomNr, bidId, tutar, TL),
  }

  return { url: SHOPIER_UC, alanlar }
}

export type CallbackSonuc =
  | { ok: true; bidId: string; basarili: boolean; tutar: number; odemeId: string | null }
  | { ok: false; sebep: string }

/**
 * Shopier'in odeme sonunda POST ettigi bildirimi dogrular.
 *
 * ⚠️ Iyzico'dan farkli olarak "sunucudan geri sorma" adimi YOK; guvence
 * tamamen imzada. Bu yuzden uc kapi birden: imza dogru mu, durum basarili mi,
 * tutar bizim bekledigimiz mi (tutar kontrolu cagiran tarafta).
 *
 * Imza GELEN degerler uzerinden yeniden hesaplaniyor, bizim gonderdigimiz
 * uzerinden degil. Shopier tutari farkli bicimde geri yazarsa ("125.0")
 * dogrulama yine tutar — YETER Kİ imzayi da o bicim uzerinden atmis olsun.
 * Ters durumda ilk canli odemede `IMZA_GECERSIZ` olarak gorunur; tahmin
 * yurutmuyoruz, ilk gercek tahsilatta bakilacak.
 *
 * Tutarin DOGRULUGU imzadan ayri: cagiran taraf sayisal olarak karsilastiriyor.
 */
export function callbackDogrula(form: URLSearchParams | FormData): CallbackSonuc {
  const al = (k: string): string => {
    const v = form.get(k)
    return typeof v === 'string' ? v : ''
  }

  const bidId = al('platform_order_id')
  const randomNr = al('random_nr')
  const tutar = al('total_order_value')
  const paraBirimi = al('currency')
  const imza = al('signature')

  if (!bidId || !randomNr || !imza) return { ok: false, sebep: 'EKSIK_ALAN' }
  if (!SHOPIER_HAZIR) return { ok: false, sebep: 'ANAHTAR_YOK' }

  const beklenen = imzala(randomNr, bidId, tutar, paraBirimi)

  // Sabit sureli karsilastirma: imza dogrulamasinda erken cikis sizinti.
  const a = Buffer.from(imza)
  const b = Buffer.from(beklenen)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, sebep: 'IMZA_GECERSIZ' }
  }

  const sayisal = Number(tutar)

  return {
    ok: true,
    bidId,
    basarili: al('status').toLowerCase() === 'success',
    tutar: Number.isFinite(sayisal) ? Math.round(sayisal * 100) : 0,
    odemeId: al('payment_id') || null,
  }
}

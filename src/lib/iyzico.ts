import Iyzipay from 'iyzipay'

/**
 * IYZICO — HOSTED CHECKOUT FORM (3DS dahil).
 *
 * Bilincli karar: kendi kart formumuzu YAZMIYORUZ. Kart bilgisi hicbir zaman
 * bizim sunucumuza dokunmuyor, Iyzico'nun formunda kaliyor.
 *   - PCI yukumlulugu SAQ-D yerine SAQ-A
 *   - 3DS zorunlu oldugu icin chargeback sorumlulugu bankaya geciyor
 * (Culinora'da kendi form + non-3D kaldi cunku calisan bir akis vardi ve
 *  lansman oncesi degistirmek riskliydi. Burada oyle bir miras yok.)
 *
 * ⚠️ BU KOD HENUZ CANLI ANAHTARLA CALISTIRILMADI. Uye isyeri hesabi
 * acildiginda ilk kucuk tutarli odeme ile dogrulanmasi sart.
 */

export const IYZICO_HAZIR = Boolean(
  process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY && process.env.IYZICO_BASE_URL
)

function client() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY!,
    secretKey: process.env.IYZICO_SECRET_KEY!,
    uri: process.env.IYZICO_BASE_URL!, // https://api.iyzipay.com
  })
}

type CFInit = {
  status: string
  errorCode?: string
  errorMessage?: string
  token?: string
  checkoutFormContent?: string
  paymentPageUrl?: string
}

type CFResult = {
  status: string
  errorCode?: string
  errorMessage?: string
  paymentStatus?: string // SUCCESS | FAILURE | INIT_THREEDS | ...
  paymentId?: string
  token?: string
  price?: string
  paidPrice?: string
  basketId?: string
}

/** Kurus -> Iyzico'nun bekledigi ondalikli string ("1234.56") */
function fiyat(kurus: number): string {
  return (kurus / 100).toFixed(2)
}

/**
 * Odeme formunu baslatir. Donen `paymentPageUrl`e kullaniciyi yolluyoruz.
 *
 * @param bidId       kendi teklif kaydimiz — basketId olarak gidiyor
 * @param kurus       tahsil edilecek tutar (teklifin FARKI)
 * @param listingName sepette gorunecek ad
 * @param callbackUrl Iyzico'nun odeme sonunda POST edecegi adres
 */
export async function odemeBaslat(params: {
  bidId: string
  kurus: number
  listingName: string
  callbackUrl: string
  alici: { ad: string; email: string; telefon?: string | null; sehir: string; ip: string }
}): Promise<CFInit> {
  const { bidId, kurus, listingName, callbackUrl, alici } = params
  const tutar = fiyat(kurus)

  const istek = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: bidId,
    price: tutar,
    paidPrice: tutar,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: bidId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl,
    enabledInstallments: [1], // taksit yok — tek cekim
    buyer: {
      id: bidId,
      name: alici.ad,
      surname: '-',
      gsmNumber: alici.telefon || undefined,
      email: alici.email,
      // Iyzico bu alani zorunlu tutuyor ama TCKN toplamiyoruz — topladigimiz
      // anda KVKK acisindan ozel nitelikli veri sorumlulugu dogar. Sabit deger
      // gonderiyoruz; ⚠️ Iyzico fraud skorlamasini etkileyebilir, uye isyeri
      // acilisinda bu alan icin muafiyet/alternatif sorulmali.
      identityNumber: '11111111111',
      registrationAddress: alici.sehir,
      ip: alici.ip,
      city: alici.sehir,
      country: 'Turkey',
    },
    billingAddress: {
      contactName: alici.ad,
      city: alici.sehir,
      country: 'Turkey',
      address: alici.sehir,
    },
    basketItems: [
      {
        id: bidId,
        name: `Tabela ilan teklifi — ${listingName}`.slice(0, 60),
        category1: 'Reklam',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: tutar,
      },
    ],
  }

  return new Promise((resolve, reject) => {
    client().checkoutFormInitialize.create(istek, (err: unknown, res: CFInit) =>
      err ? reject(err) : resolve(res)
    )
  })
}

/** Callback'te gelen token ile odemenin gercekten gectigini dogrular. */
export async function odemeDogrula(token: string): Promise<CFResult> {
  return new Promise((resolve, reject) => {
    client().checkoutForm.retrieve(
      { locale: Iyzipay.LOCALE.TR, token },
      (err: unknown, res: CFResult) => (err ? reject(err) : resolve(res))
    )
  })
}

/**
 * Iyzico hata kodu siniflandirmasi.
 *
 * Culinora'da 5 ay kaybettiren tuzak: Iyzico'nun `1001` ("api bilgileri
 * bulunamadi") kodu musteriye "kart bilgileri hatali" diye gosterilmisti —
 * yapilandirma hatamiz kart hatasi gibi gorundu. Yalnizca 5 haneli 10xxx
 * kodlari gercek kart/banka hatasidir.
 */
export function kartHatasiMi(kod?: string): boolean {
  return Boolean(kod && /^10\d{3}$/.test(kod))
}

export function musteriyeMesaj(kod?: string, mesaj?: string): string {
  if (kartHatasiMi(kod)) return mesaj || 'Kart işlemi reddedildi.'
  return 'Ödeme alınamadı. Kısa süre sonra tekrar deneyin.'
}

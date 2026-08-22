/**
 * Ilan verilirken sitenin logosunu kendimiz cekiyoruz — kullaniciya gorsel
 * yukletmiyoruz, tahtanin dolu gorunmesi buna bagli.
 *
 * Sonuc data URI olarak `Listing.imageUrl` icinde saklaniyor:
 *   - uzak adrese baglanmiyoruz, karsi taraf hotlink engellerse kirilmiyor
 *   - site logosunu degistirse bile tahtadaki gorsel sabit kaliyor
 *   - blob deposu gerekmiyor
 *
 * ⚠️ Instagram profil fotografi CEKILEMIYOR: herkese acik bir API yok ve
 * sayfa giris duvarinin arkasinda. Instagram ilanlari harften uretilen
 * amblemle kaliyor (bkz. Avatar).
 */

import sharp from 'sharp'

const ZAMAN_ASIMI_MS = 4000

/** Indirilecek ham gorselin ust siniri (kucultmeden once). */
const EN_BUYUK_INDIRME = 500_000

/** Tahtada 40px'te gosteriliyor; 96px retina icin fazlasiyla yeterli. */
const AMBLEM_PX = 96

/** Tarayici gibi davran; bazi sunucular User-Agent'siz istegi reddediyor. */
const BASLIKLAR = {
  'User-Agent':
    'Mozilla/5.0 (compatible; TabelaBot/1.0; +https://tabela.lol)',
  Accept: 'text/html,application/xhtml+xml,image/*;q=0.8,*/*;q=0.5',
}

/**
 * Kullanicinin verdigi adrese SUNUCUDAN istek atiyoruz. Bu, ic aga acilan bir
 * kapi demek (SSRF): "http://localhost:5432" ya da bulut saglayicilarin
 * 169.254.169.254 kimlik ucu gibi adresler disaridan erisilemez ama bizim
 * sunucumuzdan erisilebilir. Onun icin yerel ve ozel adresler reddediliyor.
 *
 * DNS cozumlemesi yapmiyoruz — bu kontrol acik saldirilari keser, kararli bir
 * saldirgani degil. Hedef zaten dogrulama degil, kazayla ic aga cikmamak.
 */
function guvenliHost(u: URL): boolean {
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
  const h = u.hostname.toLowerCase()

  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local')) return false
  if (h === '0.0.0.0' || h === '::1' || h === '[::1]') return false

  // IPv4 literal ise ozel araliklari ele
  const ip = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h)
  if (ip) {
    const [a, b] = [Number(ip[1]), Number(ip[2])]
    if (a === 10 || a === 127 || a === 0) return false
    if (a === 172 && b >= 16 && b <= 31) return false
    if (a === 192 && b === 168) return false
    if (a === 169 && b === 254) return false // bulut kimlik ucu
  }

  return true
}

async function getir(url: string, signal: AbortSignal) {
  const u = new URL(url)
  if (!guvenliHost(u)) throw new Error('GUVENSIZ_ADRES')
  return fetch(url, { headers: BASLIKLAR, redirect: 'follow', signal })
}

/** Basliklarda gecen birkac HTML varligini cozer; tam bir cozucu degil. */
function metni(ham: string): string {
  return ham
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function meta(html: string, ad: string): string | null {
  const kalip = new RegExp(
    `<meta\b[^>]*(?:property|name)=["']${ad}["'][^>]*content=["']([^"']*)["']`,
    'i'
  )
  const ters = new RegExp(
    `<meta\b[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${ad}["']`,
    'i'
  )
  const d = kalip.exec(html)?.[1] ?? ters.exec(html)?.[1]
  return d ? metni(d) : null
}

/** HTML icindeki ikon adaylarini oncelik sirasiyla cikarir. */
function ikonAdaylari(html: string, taban: URL): string[] {
  const adaylar: { oncelik: number; href: string }[] = []

  const linkler = html.matchAll(/<link\b[^>]*>/gi)
  for (const m of linkler) {
    const etiket = m[0]
    const rel = /rel=["']([^"']+)["']/i.exec(etiket)?.[1]?.toLowerCase()
    const href = /href=["']([^"']+)["']/i.exec(etiket)?.[1]
    if (!rel || !href) continue

    if (rel.includes('apple-touch-icon')) adaylar.push({ oncelik: 1, href })
    else if (rel.includes('icon')) adaylar.push({ oncelik: 3, href })
  }

  // og:image genelde buyuk ve kaliteli ama logo degil kapak gorseli olabilir
  const og = /<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(html)?.[1]
  if (og) adaylar.push({ oncelik: 2, href: og })

  adaylar.sort((a, b) => a.oncelik - b.oncelik)

  const cozulmus: string[] = []
  for (const a of adaylar) {
    try {
      cozulmus.push(new URL(a.href, taban).toString())
    } catch {
      /* bozuk href — atla */
    }
  }
  cozulmus.push(new URL('/favicon.ico', taban).toString())

  return [...new Set(cozulmus)].slice(0, 5)
}

async function gorseliIndir(url: string, signal: AbortSignal): Promise<string | null> {
  const res = await getir(url, signal)
  if (!res.ok) return null

  const tur = res.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
  if (!tur.startsWith('image/')) return null

  const buf = Buffer.from(await res.arrayBuffer())
  if (!buf.length || buf.length > EN_BUYUK_INDIRME) return null

  // Ham logo 128 KB gelebiliyor; 50 ilanlik tahtada bu megabaytlar demek.
  // 96px webp'e indiriyoruz — tipik sonuc 2-4 KB.
  try {
    const kucuk = await sharp(buf)
      .resize(AMBLEM_PX, AMBLEM_PX, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 82 })
      .toBuffer()
    return `data:image/webp;base64,${kucuk.toString('base64')}`
  } catch {
    // sharp .ico cozemiyor. Kucukse oldugu gibi kabul et, degilse birak.
    if (buf.length <= 20_000) return `data:${tur};base64,${buf.toString('base64')}`
    return null
  }
}

export type SiteBilgisi = {
  /** Marka adi — og:site_name > og:title > <title> */
  ad: string | null
  /** Tek satir aciklama — og:description > meta description */
  aciklama: string | null
  /** Logo, data URI */
  logo: string | null
}

/** Baslikta siklikla bulunan kuyruklari atar: "Marka | Ana Sayfa" -> "Marka" */
function baslikTemizle(ham: string): string {
  const parcalar = ham.split(/\s[|–—-]\s/)
  const ilk = parcalar[0]?.trim()
  return (ilk && ilk.length >= 2 ? ilk : ham).slice(0, 60)
}

/**
 * Sitenin adini, aciklamasini ve logosunu tek gezisde cikarir.
 *
 * Ilan formundaki "Bilgileri çek" dugmesi ve ilan olusturma ayni yerden
 * besleniyor: kullanici formu elle doldurmasin, tahta bos gorunmesin.
 * Basarisiz olan her alan null doner — ilan yine olusur.
 */
export async function siteBilgisi(siteUrl: string): Promise<SiteBilgisi> {
  const bos: SiteBilgisi = { ad: null, aciklama: null, logo: null }

  const kontrol = new AbortController()
  const zamanlayici = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI_MS)

  try {
    const taban = new URL(siteUrl)

    const res = await getir(taban.toString(), kontrol.signal)
    // Yonlendirme sonrasi gercek adres taban olmali (ornek: example.com -> www)
    const gercekTaban = new URL(res.url || taban.toString())

    const html = res.ok ? (await res.text()).slice(0, 200_000) : ''

    const baslik =
      meta(html, 'og:site_name') ||
      meta(html, 'og:title') ||
      (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]
        ? metni(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)![1])
        : null)

    const aciklama = meta(html, 'og:description') || meta(html, 'description')

    let logo: string | null = null
    for (const aday of ikonAdaylari(html, gercekTaban)) {
      try {
        const veri = await gorseliIndir(aday, kontrol.signal)
        if (veri) {
          logo = veri
          break
        }
      } catch {
        /* bu aday olmadi, sirakine gec */
      }
    }

    return {
      ad: baslik ? baslikTemizle(baslik) : null,
      aciklama: aciklama ? aciklama.slice(0, 90) : null,
      logo,
    }
  } catch {
    return bos
  } finally {
    clearTimeout(zamanlayici)
  }
}

/**
 * Yalniz logo. Ilan olusturmada kullaniliyor; basarisiz olursa null ve ilan
 * harften amblemle kalir.
 */
export async function siteLogosu(siteUrl: string): Promise<string | null> {
  return (await siteBilgisi(siteUrl)).logo
}

/**
 * Kullanicinin ELLE verdigi bir logo adresini indirip data URI'ye cevirir.
 * Uzak adresi oldugu gibi saklamiyoruz: karsi taraf hotlink engellerse ya da
 * gorseli degistirirse tahtadaki amblem kirilir.
 */
export async function logoAdresinden(url: string): Promise<string | null> {
  const kontrol = new AbortController()
  const zamanlayici = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI_MS)
  try {
    return await gorseliIndir(new URL(url).toString(), kontrol.signal)
  } catch {
    return null
  } finally {
    clearTimeout(zamanlayici)
  }
}

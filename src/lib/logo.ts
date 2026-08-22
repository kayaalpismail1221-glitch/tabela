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

async function getir(url: string, signal: AbortSignal) {
  return fetch(url, { headers: BASLIKLAR, redirect: 'follow', signal })
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

/**
 * Sitenin logosunu data URI olarak dondurur. Basarisiz olursa null —
 * ilan yine olusur, sadece harften amblem gosterilir.
 */
export async function siteLogosu(siteUrl: string): Promise<string | null> {
  const kontrol = new AbortController()
  const zamanlayici = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI_MS)

  try {
    const taban = new URL(siteUrl)

    const res = await getir(taban.toString(), kontrol.signal)
    // Yonlendirme sonrasi gercek adres taban olmali (ornek: example.com -> www)
    const gercekTaban = new URL(res.url || taban.toString())

    const html = res.ok ? (await res.text()).slice(0, 200_000) : ''

    for (const aday of ikonAdaylari(html, gercekTaban)) {
      try {
        const veri = await gorseliIndir(aday, kontrol.signal)
        if (veri) return veri
      } catch {
        /* bu aday olmadi, sirakine gec */
      }
    }
    return null
  } catch {
    return null
  } finally {
    clearTimeout(zamanlayici)
  }
}

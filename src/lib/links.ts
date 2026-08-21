/**
 * Ilan bagimlisi tek bir baglanti tasir: Instagram profili VEYA kendi sitesi.
 * Ikisi de ayni alanda (`Listing.url`) duruyor, tur adresten cikariliyor —
 * boylece "hangi tur" diye ayri bir secim yaptirmiyoruz.
 *
 * Instagram baglantisi mobilde uygulamayi acar, acamazsa web'e duser; bu
 * tarayicinin isi, bizim tarafta ozel bir sey yapmiyoruz.
 */

export type LinkKind = 'INSTAGRAM' | 'WEB'

export type ParsedLink = {
  url: string // normalize edilmis, saklanacak ve yonlendirilecek adres
  kind: LinkKind
  label: string // ekranda gorunecek kisa ad: "@ocakbasivefa" ya da "ocakbasivefa.com"
  handle: string | null // yalniz Instagram ise dolu
}

const IG_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com'])

/** Instagram kullanici adi kurallari. */
const HANDLE = /^[A-Za-z0-9._]{2,30}$/

export function parseLink(input: string): ParsedLink | null {
  const raw = input.trim()
  if (!raw) return null

  // "@ocakbasivefa" ya da duz "ocakbasivefa" — Instagram varsayiyoruz.
  const bare = raw.replace(/^@/, '')
  if (!raw.includes('.') && !raw.includes('/') && HANDLE.test(bare)) {
    return instagram(bare)
  }

  let u: URL
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null

  const host = u.hostname.toLowerCase()

  if (IG_HOSTS.has(host)) {
    const seg = u.pathname.split('/').filter(Boolean)[0]
    if (!seg || !HANDLE.test(seg)) return null
    return instagram(seg)
  }

  // Kendi sitesi. Izleme parametrelerini ve son bolu isaretini temizle.
  u.protocol = 'https:'
  u.hash = ''
  u.search = ''
  const path = u.pathname.replace(/\/+$/, '')
  const gorunen = host.replace(/^www\./, '')

  return {
    url: `https://${host}${path}`,
    kind: 'WEB',
    label: gorunen + (path || ''),
    handle: null,
  }
}

function instagram(handle: string): ParsedLink {
  const h = handle.toLowerCase()
  return {
    url: `https://instagram.com/${h}`,
    kind: 'INSTAGRAM',
    label: `@${h}`,
    handle: h,
  }
}

/** Kayitli bir url'den ekranda gosterilecek kisa ad. */
export function linkLabel(url: string): string {
  return parseLink(url)?.label ?? url
}

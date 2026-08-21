/**
 * Baglanti dizesinin adi saglayiciya gore degisiyor — TEK KAYNAK burasi.
 *
 * Vercel'in Prisma Postgres entegrasyonu, projede zaten bir DATABASE_URL
 * oldugu icin kendi degiskenlerine "DATABASE_URL" prefix'i ekledi ve ortaya
 * DATABASE_URL_DATABASE_URL gibi isimler cikti. Kodu o tuhaf isme sabitlemek
 * yerine, bilinen adaylari sirayla deniyoruz: prefix kaldirilirsa ya da
 * baska bir saglayiciya gecilirse hicbir sey degistirmek gerekmiyor.
 */
const ADAYLAR = [
  'DATABASE_URL',
  'DATABASE_URL_DATABASE_URL',
  'POSTGRES_URL',
  'DATABASE_URL_POSTGRES_URL',
  'PRISMA_DATABASE_URL',
  'DATABASE_URL_PRISMA_DATABASE_URL',
] as const

export type DbUrlSonuc = { name: string; url: string } | null

/**
 * Sunucusuz ortamda her istek kendi baglantisini aciyor; saglayicinin
 * baglanti kotasi bir anda doluyor ("too many connections", P2037).
 * Her istemciyi TEK baglantiya sabitliyoruz — sunucusuz icin onerilen ayar.
 */
function havuzuSinirla(url: string): string {
  try {
    const u = new URL(url)
    if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '1')
    if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '15')
    return u.toString()
  } catch {
    return url // ayristirilamadiysa dokunma
  }
}

/** Ilk gecerli postgres dizesini ve HANGI degiskenden geldigini dondurur. */
export function resolveDbUrl(): DbUrlSonuc {
  for (const name of ADAYLAR) {
    const url = process.env[name]?.trim()
    // Bos ya da "postgres olmayan" degerler atlanir: projede eski/yanlis bir
    // DATABASE_URL kalmissa dogru olanin onunu tikamasin.
    if (url && /^postgres(ql)?:\/\//.test(url)) return { name, url: havuzuSinirla(url) }
  }
  return null
}

/** Teshis icin: hangi adaylar tanimli (DEGER donmez, yalnizca isim). */
export function dbUrlAdaylari(): string[] {
  return ADAYLAR.filter((n) => Boolean(process.env[n]))
}

import { prisma } from './prisma'

/**
 * Tahtanin rakamlari — TEK KAYNAK.
 *
 * Hicbiri ayri bir tabloda tutulmuyor; hepsi Listing/Bid/Click kayitlarindan
 * turetiliyor. Boylece sayac ile gercek arasinda fark olusamaz: rakam yanlissa
 * veri yanlistir, tersi olamaz.
 *
 * Tek istisna LANSMAN: "kac saattir acik" sorusunun cevabi veriden cikmiyor,
 * sabit olarak duruyor.
 */

/** Tahtanin acildigi an. Ilk gercek ilan gelince guncellenecek. */
export const LANSMAN = new Date('2026-08-21T12:00:00+03:00')

export type Rakamlar = {
  /** Yayindaki ilan sayisi */
  ilan: number
  /** Kac ilde en az bir ilan var */
  sehir: number
  /** Tahsil edilen toplam tutar (kurus) */
  hacim: number
  /** En yuksek teklif (kurus) */
  zirve: number
  /** Tum ilanlara yapilan toplam tiklama */
  tiklama: number
  /** Odemesi gecmis toplam teklif adedi */
  teklif: number
  /** Son 24 saatte verilen teklif adedi */
  sonGun: number
  /** Zirvenin kac kez el degistirdigi (rankAfter === 1 olan teklifler) */
  elDegistirme: number
  /** Lansmandan bu yana gecen saat */
  saat: number
  /** Lansmandan bu yana gecen gun (saat 48'i gecince kullaniliyor) */
  gun: number
}

export async function getRakamlar(): Promise<Rakamlar> {
  const yayinda = { currentBid: { gt: 0 } }
  const odenmis = { status: 'PAID' }
  const birGunOnce = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [ilan, sehirler, toplam, enYuksek, tiklamaToplam, sonGun, elDegistirme] =
    await Promise.all([
      prisma.listing.count({ where: yayinda }),
      prisma.listing.findMany({ where: yayinda, select: { city: true }, distinct: ['city'] }),
      prisma.bid.aggregate({ where: odenmis, _sum: { paid: true }, _count: true }),
      prisma.listing.findFirst({
        where: yayinda,
        orderBy: { currentBid: 'desc' },
        select: { currentBid: true },
      }),
      prisma.listing.aggregate({ _sum: { clickCount: true } }),
      prisma.bid.count({ where: { ...odenmis, createdAt: { gte: birGunOnce } } }),
      prisma.bid.count({ where: { ...odenmis, rankAfter: 1 } }),
    ])

  const gecen = Date.now() - LANSMAN.getTime()

  return {
    ilan,
    sehir: sehirler.length,
    hacim: toplam._sum.paid ?? 0,
    zirve: enYuksek?.currentBid ?? 0,
    tiklama: tiklamaToplam._sum.clickCount ?? 0,
    teklif: toplam._count,
    sonGun,
    elDegistirme,
    saat: Math.max(0, Math.floor(gecen / 3_600_000)),
    gun: Math.max(0, Math.floor(gecen / 86_400_000)),
  }
}

/** "41 saattir" / "6 gündür" — 48 saati gecince gune donuyor. */
export function yasSozu(r: Pick<Rakamlar, 'saat' | 'gun'>): string {
  if (r.saat < 1) return 'yeni'
  if (r.saat < 48) return `${r.saat} saattir`
  return `${r.gun} gündür`
}

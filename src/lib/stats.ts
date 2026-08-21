import { createHash } from 'crypto'
import { prisma } from './prisma'

/**
 * Tahtanin rakamlari — TEK KAYNAK.
 *
 * Ekranda yalnizca UC sayi var: su an kac kisi burada, acilistan beri kac
 * ziyaretci, toplam kac para toplandi. Gerisi bilerek gosterilmiyor —
 * kalabalik bir sayac panosu hicbir seyi anlatmiyor.
 *
 * Para ve ziyaretci veriden turetiliyor; tek sabit LANSMAN.
 */

/** Tahtanin acildigi an. */
export const LANSMAN = new Date('2026-08-21T12:00:00+03:00')

/** Bu sure icinde gorulen ziyaretci "su an burada" sayiliyor. */
const AKTIF_PENCERE_DK = 5

export type Rakamlar = {
  /** Son 5 dakikada goruleni */
  aktif: number
  /** Acilistan beri toplam tekil ziyaretci */
  ziyaretci: number
  /** Tahsil edilen toplam tutar (kurus) */
  hacim: number
  /** Lansmandan bu yana gecen saat */
  saat: number
  /** Lansmandan bu yana gecen gun */
  gun: number
}

export async function getRakamlar(): Promise<Rakamlar> {
  const esik = new Date(Date.now() - AKTIF_PENCERE_DK * 60_000)

  const [aktif, ziyaretci, toplam] = await Promise.all([
    prisma.visitor.count({ where: { lastSeen: { gte: esik } } }),
    prisma.visitor.count(),
    prisma.bid.aggregate({ where: { status: 'PAID' }, _sum: { paid: true } }),
  ])

  const gecen = Date.now() - LANSMAN.getTime()

  return {
    aktif,
    ziyaretci,
    hacim: toplam._sum.paid ?? 0,
    saat: Math.max(0, Math.floor(gecen / 3_600_000)),
    gun: Math.max(0, Math.floor(gecen / 86_400_000)),
  }
}

/**
 * Ziyaretciyi kaydeder ve guncel rakamlari dondurur.
 *
 * Cerez yok, oturum yok, ham IP saklanmiyor: anahtar IP + tarayici
 * bilgisinden turetilen geri dondurulemez bir ozet. Gizlilik metninde
 * anlatilan yontemin aynisi.
 */
export async function ziyaretKaydet(ip: string, ua: string, gorunur = true): Promise<Rakamlar> {
  const key = createHash('sha256').update(ip + '|' + ua).digest('hex').slice(0, 32)

  try {
    await prisma.visitor.upsert({
      where: { key },
      create: { key },
      // Arka plandaki sekme ziyaretci sayilir ama "su an burada" sayilmaz:
      // lastSeen yalnizca sekme gorunurken ilerliyor.
      update: gorunur ? { lastSeen: new Date() } : {},
    })
  } catch {
    // Sayac kritik yol degil; yazilamazsa sayfa yine acilir.
  }

  return getRakamlar()
}

/** "44 saattir" / "6 gündür" — 48 saati gecince gune donuyor. */
export function yasSozu(r: Pick<Rakamlar, 'saat' | 'gun'>): string {
  if (r.saat < 1) return 'yeni açıldı'
  if (r.saat < 48) return `${r.saat} saat önce`
  return `${r.gun} gün önce`
}

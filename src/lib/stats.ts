import { createHash } from 'crypto'
import { prisma } from './prisma'

/**
 * Tahtanin rakamlari — TEK KAYNAK.
 *
 * Ekranda yalnizca UC sayi var: su an kac kisi burada, acilistan beri kac
 * ziyaretci, toplam kac para toplandi. Gerisi bilerek gosterilmiyor —
 * kalabalik bir sayac panosu hicbir seyi anlatmiyor.
 *
 * Not: "tahta ne zaman acildi" sayaci 2026-08-22'de kaldirildi. Sayfanin
 * dibindeki dev "0 ₺ topladi — 28 saat once acildi" bloguyla birlikte gitti;
 * toplam para artik haritanin kosesinde duruyor.
 */

/** Bu sure icinde gorulen ziyaretci "su an burada" sayiliyor. */
const AKTIF_PENCERE_DK = 5

export type Rakamlar = {
  /** Son 5 dakikada goruleni */
  aktif: number
  /** Acilistan beri toplam tekil ziyaretci */
  ziyaretci: number
  /** Tahsil edilen toplam tutar (kurus) */
  hacim: number
  /** Tahtin kac kez el degistirdigi — 1 numaraya oturan teklif sayisi */
  tahtDegisimi: number
}

export async function getRakamlar(): Promise<Rakamlar> {
  const esik = new Date(Date.now() - AKTIF_PENCERE_DK * 60_000)

  const [aktif, ziyaretci, toplam, tahtDegisimi] = await Promise.all([
    prisma.visitor.count({ where: { lastSeen: { gte: esik } } }),
    prisma.visitor.count(),
    prisma.bid.aggregate({ where: { status: 'PAID' }, _sum: { paid: true } }),
    // rankAfter teklif anindaki siradir; 1 ise o teklif tahti almistir.
    prisma.bid.count({ where: { status: 'PAID', rankAfter: 1 } }),
  ])

  return {
    aktif,
    ziyaretci,
    hacim: toplam._sum.paid ?? 0,
    tahtDegisimi,
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

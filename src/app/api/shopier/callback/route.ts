import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callbackDogrula } from '@/lib/shopier'
import { applyPaidBid } from '@/lib/bids'

export const dynamic = 'force-dynamic'

/**
 * Shopier odeme sonunda buraya POST eder.
 *
 * ⚠️ Bu adres istekle GONDERILMIYOR — Shopier panelinden tanimlanmasi
 * gerekiyor. Tanimli degilse odeme alinir ama teklif uygulanmaz.
 *
 * Iyzico'daki gibi "sunucudan geri sorma" adimi yok; guvence imzada. Bu
 * yuzden UC kapi birden:
 *   1. Imza gecerli mi (HMAC-SHA256, gizli anahtarla)
 *   2. Durum basarili mi
 *   3. Tahsil edilen tutar bizim bekledigimiz mi
 * Ucu de gecmeden hicbir teklif uygulanmiyor — bu yol "fail-closed".
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const anasayfa = new URL('/', req.url)
  if (!form) return NextResponse.redirect(anasayfa, { status: 303 })

  const sonuc = callbackDogrula(form)
  if (!sonuc.ok) {
    // Imzasiz/bozuk bildirim: hicbir sey yazmiyoruz, sessizce anasayfaya.
    return NextResponse.redirect(anasayfa, { status: 303 })
  }

  const bid = await prisma.bid.findUnique({
    where: { id: sonuc.bidId },
    select: { id: true, listingId: true, paid: true, status: true },
  })
  if (!bid) return NextResponse.redirect(anasayfa, { status: 303 })

  const ilan = new URL(`/ilan/${bid.listingId}`, req.url)

  // Callback iki kez gelebilir; ilki islediyse ikincisi sessizce ayni yere doner.
  if (bid.status === 'PAID') {
    ilan.searchParams.set('zafer', bid.id)
    return NextResponse.redirect(ilan, { status: 303 })
  }

  if (!sonuc.basarili) {
    await prisma.bid.update({
      where: { id: bid.id },
      data: { status: 'FAILED', failureCode: 'SHOPIER_BASARISIZ', failureMsg: 'Odeme alinamadi' },
    })
    ilan.searchParams.set('odeme', 'basarisiz')
    return NextResponse.redirect(ilan, { status: 303 })
  }

  // Tahsil edilen tutar bizim bekledigimizle uyusuyor mu? Eksik tahsilatta
  // teklifi uygulamiyoruz.
  if (sonuc.tutar + 1 < bid.paid) {
    await prisma.bid.update({
      where: { id: bid.id },
      data: { status: 'FAILED', failureCode: 'TUTAR_UYUSMADI', failureMsg: 'Tutar uyusmadi' },
    })
    ilan.searchParams.set('odeme', 'basarisiz')
    return NextResponse.redirect(ilan, { status: 303 })
  }

  await prisma.bid.update({
    where: { id: bid.id },
    // Jeton tek kullanimlik: odendikten sonra o adres bir ise yaramasin.
    data: { paymentRef: sonuc.odemeId, paymentToken: null },
  })
  await applyPaidBid(bid.id)

  // Sirayi aldigi ani gormeden kimse paylasmiyor.
  ilan.searchParams.set('zafer', bid.id)
  return NextResponse.redirect(ilan, { status: 303 })
}

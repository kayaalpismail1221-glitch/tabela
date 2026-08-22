import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { odemeDogrula, musteriyeMesaj } from '@/lib/iyzico'
import { applyPaidBid } from '@/lib/bids'

export const dynamic = 'force-dynamic'

/**
 * Iyzico odeme sonunda buraya POST eder (form-urlencoded, tek alan: token).
 *
 * Kritik: gelen POST'a GUVENMIYORUZ. Token ile Iyzico'ya geri sorup
 * odemenin gercekten gectigini dogruluyoruz — bu yol "fail-closed".
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const token = form?.get('token')

  const anasayfa = new URL('/', req.url)
  if (typeof token !== 'string' || !token) {
    return NextResponse.redirect(anasayfa, { status: 303 })
  }

  const bid = await prisma.bid.findUnique({
    where: { paymentToken: token },
    include: { listing: { select: { id: true } } },
  })
  if (!bid) return NextResponse.redirect(anasayfa, { status: 303 })

  const ilan = new URL(`/ilan/${bid.listing.id}`, req.url)

  // Callback iki kez gelebilir; ilki islediyse ikincisi sessizce ayni yere doner.
  if (bid.status === 'PAID') return NextResponse.redirect(ilan, { status: 303 })

  let sonuc
  try {
    sonuc = await odemeDogrula(token)
  } catch {
    ilan.searchParams.set('odeme', 'hata')
    return NextResponse.redirect(ilan, { status: 303 })
  }

  const basarili = sonuc.status === 'success' && sonuc.paymentStatus === 'SUCCESS'

  if (!basarili) {
    await prisma.bid.update({
      where: { id: bid.id },
      data: {
        status: 'FAILED',
        failureCode: sonuc.errorCode,
        failureMsg: musteriyeMesaj(sonuc.errorCode, sonuc.errorMessage),
      },
    })
    ilan.searchParams.set('odeme', 'basarisiz')
    return NextResponse.redirect(ilan, { status: 303 })
  }

  // Tahsil edilen tutar bizim bekledigimizle uyusuyor mu?
  const beklenen = (bid.paid / 100).toFixed(2)
  if (sonuc.paidPrice && Number(sonuc.paidPrice) + 0.001 < Number(beklenen)) {
    await prisma.bid.update({
      where: { id: bid.id },
      data: { status: 'FAILED', failureCode: 'AMOUNT_MISMATCH', failureMsg: 'Tutar uyusmadi' },
    })
    ilan.searchParams.set('odeme', 'basarisiz')
    return NextResponse.redirect(ilan, { status: 303 })
  }

  await prisma.bid.update({ where: { id: bid.id }, data: { paymentRef: sonuc.paymentId } })
  await applyPaidBid(bid.id)

  // Odemeden donen kullanici duz ilan sayfasina degil ZAFER ekranina duser:
  // sirayi aldigi ani gormeden kimse paylasmiyor.
  ilan.searchParams.set('zafer', bid.id)
  return NextResponse.redirect(ilan, { status: 303 })
}

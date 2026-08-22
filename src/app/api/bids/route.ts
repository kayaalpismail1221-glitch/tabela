import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { placeBid } from '@/lib/bids'

export const dynamic = 'force-dynamic'

const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Mevcut bir ilanin teklifini yukseltir. Fark tahsil edilir, tutar degil. */
export async function POST(req: Request) {
  let body: {
    listingId?: string
    amount?: number
    ownerName?: string
    ownerEmail?: string
    ownerPhone?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const listingId = (body.listingId ?? '').trim()
  const amount = Number(body.amount)

  if (!listingId) return NextResponse.json({ error: 'İlan seçilmedi.' }, { status: 400 })
  if (!Number.isInteger(amount)) {
    return NextResponse.json({ error: 'Geçersiz tutar.' }, { status: 400 })
  }

  // Iletisimi olmayan ilan (eski kayit ya da yarim kalmis olusturma) teklif
  // yukseltirken bilgisini tamamliyor: odeme de bildirim de buna bagli.
  const ilan = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerName: true, ownerEmail: true },
  })
  if (!ilan) return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 })

  if (!ilan.ownerName || !ilan.ownerEmail) {
    const ad = (body.ownerName ?? '').trim()
    const eposta = (body.ownerEmail ?? '').trim().toLowerCase()
    const telefon = (body.ownerPhone ?? '').trim() || null

    if (ad.length < 2 || !EPOSTA.test(eposta)) {
      return NextResponse.json(
        { error: 'Ad soyad ve geçerli bir e-posta gerekiyor.', iletisimGerekli: true },
        { status: 400 }
      )
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { ownerName: ad, ownerEmail: eposta, ...(telefon ? { ownerPhone: telefon } : {}) },
    })
  }

  const result = await placeBid(listingId, amount, {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '85.34.78.112',
    origin: new URL(req.url).origin,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error, minimum: result.minimum }, { status: 400 })
  }

  return NextResponse.json(result)
}

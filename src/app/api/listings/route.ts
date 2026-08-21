import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cityBySlug } from '@/lib/cities'
import { placeBid, TEST_MODU } from '@/lib/bids'
import { TABAN_TEKLIF } from '@/lib/rules'

export const dynamic = 'force-dynamic'

const HANDLE = /^[a-z0-9._]{2,30}$/

type Body = {
  handle?: string
  name?: string
  city?: string
  district?: string
  description?: string
  amount?: number // kurus
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const handle = (body.handle ?? '').trim().replace(/^@/, '').toLowerCase()
  const name = (body.name ?? '').trim()
  const city = (body.city ?? '').trim()
  const district = (body.district ?? '').trim() || null
  const description = (body.description ?? '').trim()
  const amount = Number(body.amount)

  if (!HANDLE.test(handle)) {
    return NextResponse.json({ error: 'Instagram kullanıcı adı geçersiz.' }, { status: 400 })
  }
  if (name.length < 2 || name.length > 60) {
    return NextResponse.json({ error: 'İşletme adı 2-60 karakter olmalı.' }, { status: 400 })
  }
  if (!cityBySlug(city)) {
    return NextResponse.json({ error: 'Şehir seçilmedi.' }, { status: 400 })
  }
  if (description.length < 5 || description.length > 90) {
    return NextResponse.json({ error: 'Açıklama 5-90 karakter olmalı.' }, { status: 400 })
  }
  if (!Number.isInteger(amount) || amount < TABAN_TEKLIF) {
    return NextResponse.json({ error: 'Teklif taban tutarın altında.' }, { status: 400 })
  }

  const mevcut = await prisma.listing.findUnique({ where: { handle } })
  if (mevcut) {
    return NextResponse.json(
      { error: 'Bu hesap zaten tahtada. Teklifini ilan sayfasından yükseltebilirsin.', listingId: mevcut.id },
      { status: 409 }
    )
  }

  // Instagram sahiplik dogrulamasi: bio'ya bu kod konulacak.
  // (v0'da kod uretilip saklaniyor, zorunlu tutulmuyor — akisi kirmamak icin.)
  const verifyCode = 'TABELA-' + Math.random().toString(36).slice(2, 8).toUpperCase()

  const listing = await prisma.listing.create({
    data: {
      handle,
      name,
      city,
      district,
      description,
      verifyCode,
      verifiedAt: TEST_MODU ? new Date() : null,
    },
  })

  const result = await placeBid(listing.id, amount)
  if (!result.ok) {
    // Teklif gecersizse yarim ilan birakma.
    await prisma.listing.delete({ where: { id: listing.id } })
    return NextResponse.json({ error: result.error, minimum: result.minimum }, { status: 400 })
  }

  return NextResponse.json({
    listingId: listing.id,
    rank: result.rank,
    paid: result.paid,
    verifyCode,
    testMode: TEST_MODU,
  })
}

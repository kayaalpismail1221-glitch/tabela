import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cityBySlug } from '@/lib/cities'
import { parseLink } from '@/lib/links'
import { placeBid } from '@/lib/bids'
import { TABAN_TEKLIF } from '@/lib/rules'

export const dynamic = 'force-dynamic'

const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Body = {
  link?: string // instagram profili ya da kendi sitesi — tur adresten cikariliyor
  name?: string
  city?: string
  district?: string
  description?: string
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  amount?: number // kurus
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const link = parseLink(body.link ?? '')
  const name = (body.name ?? '').trim()
  const city = (body.city ?? '').trim()
  const district = (body.district ?? '').trim() || null
  const description = (body.description ?? '').trim()
  // Iletisim alanlari ilan formundan kaldirildi. Sema hala tasiyor: odeme
  // canliya alinirken Iyzico alici bilgisi istiyor ve "uste cikildin"
  // bildirimi bu e-postaya gidecek — o adimda tekrar toplanacak.
  const ownerName = (body.ownerName ?? '').trim() || null
  const ownerEmail = (body.ownerEmail ?? '').trim().toLowerCase() || null
  const ownerPhone = (body.ownerPhone ?? '').trim() || null
  const amount = Number(body.amount)

  if (!link) {
    return NextResponse.json(
      { error: 'Bağlantı geçersiz. Instagram profili ya da site adresi yaz.' },
      { status: 400 }
    )
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
  if (ownerEmail && !EPOSTA.test(ownerEmail)) {
    return NextResponse.json({ error: 'Geçerli bir e-posta yaz.' }, { status: 400 })
  }
  if (!Number.isInteger(amount) || amount < TABAN_TEKLIF) {
    return NextResponse.json({ error: 'Teklif taban tutarın altında.' }, { status: 400 })
  }

  const alanlar = { name, city, district, description, ownerName, ownerEmail, ownerPhone }
  const mevcut = await prisma.listing.findUnique({ where: { url: link.url } })

  let listing
  if (mevcut && mevcut.currentBid > 0) {
    // Yayindaki ilan — ayni baglanti ikinci kez tahtaya cikamaz.
    return NextResponse.json(
      {
        error: 'Bu bağlantı zaten tahtada. Teklifini ilan sayfasından yükseltebilirsin.',
        listingId: mevcut.id,
      },
      { status: 409 }
    )
  } else if (mevcut) {
    // Odemesi tamamlanmamis yarim kayit: tekrar denemeyi engellemesin.
    listing = await prisma.listing.update({ where: { id: mevcut.id }, data: alanlar })
  } else {
    listing = await prisma.listing.create({ data: { url: link.url, ...alanlar } })
  }

  const result = await placeBid(listing.id, amount, {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '85.34.78.112',
    origin: new URL(req.url).origin,
  })

  if (!result.ok) {
    // Odenmemis ilanı silme — kullanici tekrar deneyebilsin diye birakiyoruz
    // (yayinda gorunmuyor, currentBid hala 0).
    return NextResponse.json({ error: result.error, minimum: result.minimum }, { status: 400 })
  }

  if (!result.applied) {
    return NextResponse.json({ paymentUrl: result.paymentUrl, listingId: listing.id })
  }

  return NextResponse.json({ listingId: listing.id, rank: result.rank, paid: result.paid })
}

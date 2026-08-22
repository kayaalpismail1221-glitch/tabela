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

  const ilan = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerName: true, ownerEmail: true },
  })
  if (!ilan) return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 })

  const eposta = (body.ownerEmail ?? '').trim().toLowerCase()

  if (ilan.ownerEmail) {
    // SAHIPLIK KAPISI. Giris yok, o yuzden kanit ilani verirken kullanilan
    // e-posta. Onsuz bu uc "herkesin yerine odeme yapma" ucu olurdu: bir
    // yabanci baskasinin ilanini yukseltip parayi bosa verirdi.
    //
    // Yabanciyi engellemek amac degil — yabancinin YAPMASI GEREKEN sey bu
    // degil. O, kendi ilaniyla bu ilani geciyor (ilan sayfasindaki "Devral").
    if (eposta !== ilan.ownerEmail.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'Bu ilan sana ait değil. İlanı verirken kullandığın e-postayı yaz.',
          sahiplikGerekli: true,
        },
        { status: 403 }
      )
    }
  } else {
    // Iletisimi olmayan eski/yarim kayit: ilk yukseltmede tamamlaniyor.
    // ⚠️ Bu ayni zamanda bir sahiplenme deligi — e-postasi olmayan bir ilani
    // ilk yukselten kisi sahibi olur. Yeni ilanlar her zaman e-posta ile
    // olusuyor, delik yalnizca yarim kalmis kayitlar icin acik.
    const ad = (body.ownerName ?? '').trim()
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

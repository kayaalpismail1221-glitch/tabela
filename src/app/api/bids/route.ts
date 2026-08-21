import { NextResponse } from 'next/server'
import { placeBid } from '@/lib/bids'

export const dynamic = 'force-dynamic'

/** Mevcut bir ilanin teklifini yukseltir. Fark tahsil edilir, tutar degil. */
export async function POST(req: Request) {
  let body: { listingId?: string; amount?: number }
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

  const result = await placeBid(listingId, amount, {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '85.34.78.112',
    origin: new URL(req.url).origin,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error, minimum: result.minimum }, { status: 400 })
  }

  return NextResponse.json(result)
}

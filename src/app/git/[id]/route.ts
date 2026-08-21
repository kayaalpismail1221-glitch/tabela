import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Tiklama sayaci + ilanin baglantisina yonlendirme (Instagram profili ya da
 * kendi sitesi). Sayac ilanin "ne ise yaradigi"nin tek kaniti — teklifi
 * yukseltmenin gerekcesi.
 */
export async function GET(req: Request, ctx: RouteContext<'/git/[id]'>) {
  const { id } = await ctx.params

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, url: true },
  })
  if (!listing) return NextResponse.redirect(new URL('/', req.url))

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'yok'
  const ua = req.headers.get('user-agent') ?? 'yok'
  const visitorKey = createHash('sha256').update(ip + ua).digest('hex').slice(0, 32)

  // Sayac kritik yol degil; hata olursa yonlendirmeyi engelleme.
  try {
    await prisma.$transaction([
      prisma.click.create({ data: { listingId: listing.id, visitorKey } }),
      prisma.listing.update({
        where: { id: listing.id },
        data: { clickCount: { increment: 1 } },
      }),
    ])
  } catch {
    /* yut */
  }

  return NextResponse.redirect(listing.url)
}

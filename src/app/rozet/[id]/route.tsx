import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { prisma } from '@/lib/prisma'
import { cityName } from '@/lib/cities'
import { tl } from '@/lib/format'

export const dynamic = 'force-dynamic'

/**
 * Satori'nin gomulu fontu ne kalin agirlik ne de ₺ / ş / ğ / İ tasiyor.
 * Inter'in latin + latin-ext dilimlerini elle yukluyoruz; satori eksik glifi
 * listedeki diger dosyadan tamamliyor.
 */
async function loadFonts() {
  const dosya = async (ad: string) =>
    readFile(join(process.cwd(), 'public', 'fonts', ad))

  const [l900, e900, l400, e400] = await Promise.all([
    dosya('inter-latin-900-normal.woff'),
    dosya('inter-latin-ext-900-normal.woff'),
    dosya('inter-latin-400-normal.woff'),
    dosya('inter-latin-ext-400-normal.woff'),
  ])

  return [
    { name: 'Inter', data: l900, weight: 900 as const, style: 'normal' as const },
    { name: 'InterExt', data: e900, weight: 900 as const, style: 'normal' as const },
    { name: 'Inter', data: l400, weight: 400 as const, style: 'normal' as const },
    { name: 'InterExt', data: e400, weight: 400 as const, style: 'normal' as const },
  ]
}

/**
 * 1080x1920 story karti.
 *
 * Buyume motorunun tamami bu dosya: 500 restoran ilan verirse 500 hesap bu
 * gorseli kendi story'sinden paylasir. Bedava dagitim kanali.
 */
export async function GET(req: Request, ctx: RouteContext<'/rozet/[id]'>) {
  const { id } = await ctx.params

  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing) return new Response('Bulunamadı', { status: 404 })

  // Sehir sirasi ve genel sira
  const [cityAbove, nationalAbove] = await Promise.all([
    prisma.listing.count({
      where: { city: listing.city, currentBid: { gt: listing.currentBid } },
    }),
    prisma.listing.count({ where: { currentBid: { gt: listing.currentBid } } }),
  ])

  const cityRank = cityAbove + 1
  const nationalRank = nationalAbove + 1
  const sehir = cityName(listing.city)

  // Ust basligi en gurur verici gercege gore sec.
  const headline =
    nationalRank === 1
      ? 'TÜRKİYE 1 NUMARA'
      : cityRank === 1
        ? `${sehir.toLocaleUpperCase('tr-TR')} 1 NUMARA`
        : `${sehir.toLocaleUpperCase('tr-TR')} ${cityRank}.`

  const rakam = nationalRank === 1 ? '1' : cityRank === 1 ? '1' : String(cityRank)
  const fonts = await loadFonts()

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(160deg, #16110a 0%, #08080a 55%, #120d05 100%)',
          color: '#f4f4f5',
          padding: 90,
          fontFamily: 'Inter, InterExt',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              border: '4px solid #ffb020',
              color: '#ffb020',
              borderRadius: 999,
              padding: '18px 40px',
              fontSize: 40,
              fontWeight: 900,
              letterSpacing: 4,
            }}
          >
            {headline}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 420,
              lineHeight: 1,
              fontWeight: 900,
              color: '#ffb020',
            }}
          >
            {rakam}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: listing.name.length > 18 ? 84 : 110,
              fontWeight: 900,
              marginTop: 20,
              lineHeight: 1.05,
            }}
          >
            {listing.name}
          </div>

          <div style={{ display: 'flex', fontSize: 46, color: '#8e8e99', marginTop: 20 }}>
            @{listing.handle}
          </div>

          <div style={{ display: 'flex', fontSize: 40, color: '#f4f4f5', marginTop: 46 }}>
            {sehir}
            {listing.district ? `, ${listing.district}` : ''} · Türkiye {nationalRank}.
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 40,
              fontWeight: 900,
              color: '#ffb020',
            }}
          >
            {tl(listing.currentBid)} teklif
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '3px solid #2a2a31',
            paddingTop: 40,
          }}
        >
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, color: '#ffb020' }}>
            TABELA
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#8e8e99' }}>
            İyi olan değil, iddialı olan üstte.
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts }
  )
}

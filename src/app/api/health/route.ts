import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Kurulum teshisi. "Sayfa acilmiyor" dendiginde Vercel loglarini acmadan
 * hangi asamada takildigini soyler.
 *
 * GUVENLIK: buradan asla DEGER donmuyor — yalnizca "tanimli mi" bilgisi ve
 * Prisma'nin hata KODU. Baglanti dizesi, parola, anahtar sizmaz.
 */
export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    DIRECT_URL: Boolean(process.env.DIRECT_URL),
    PAYMENT_MODE: process.env.PAYMENT_MODE ?? '(tanimsiz — test sayilir)',
    IYZICO: Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY),
  }

  if (!env.DATABASE_URL) {
    return NextResponse.json(
      {
        durum: 'DB_YOK',
        aciklama: 'DATABASE_URL tanimli degil. Vercel > Storage > Neon baglanmali.',
        env,
      },
      { status: 503 }
    )
  }

  // 1) Baglanti kuruluyor mu?
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (e) {
    return NextResponse.json(
      {
        durum: 'BAGLANTI_YOK',
        kod: kodu(e), // P1001 = sunucuya ulasilamiyor, P1000 = kimlik hatasi
        aciklama: 'DATABASE_URL var ama veritabanina baglanilamiyor.',
        env,
      },
      { status: 503 }
    )
  }

  // 2) Tablolar basilmis mi?
  try {
    const ilan = await prisma.listing.count()
    return NextResponse.json({ durum: 'TAMAM', ilan, env })
  } catch (e) {
    return NextResponse.json(
      {
        durum: 'SEMA_YOK',
        kod: kodu(e), // P2021 = tablo yok
        aciklama: 'Baglanti var ama tablolar yok. Lokalden `npm run db:push` calistir.',
        env,
      },
      { status: 503 }
    )
  }
}

function kodu(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) return String((e as { code: unknown }).code)
  return 'BILINMIYOR'
}

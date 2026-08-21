import { NextResponse } from 'next/server'
import { ziyaretKaydet } from '@/lib/stats'

export const dynamic = 'force-dynamic'

/**
 * Ziyaretci nabzi. Istemci sayfayi actiginda ve dakikada bir cagiriyor;
 * "su an burada" sayisi bu yoklamayla canli kaliyor.
 */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'yok'
  const ua = req.headers.get('user-agent') ?? 'yok'

  const govde = await req.json().catch(() => ({}) as { gorunur?: boolean })
  const gorunur = govde?.gorunur !== false

  const r = await ziyaretKaydet(ip, ua, gorunur)

  return NextResponse.json(r, { headers: { 'Cache-Control': 'no-store' } })
}

import { NextResponse } from 'next/server'
import { parseLink } from '@/lib/links'
import { siteBilgisi } from '@/lib/logo'

export const dynamic = 'force-dynamic'

/**
 * "Bilgileri çek" — ilan formundaki tek tuslu doldurma.
 *
 * Formu elle doldurmak surtunmedir ve surtunme tahtayi bos birakir. Adresten
 * ne cikarabiliyorsak cikariyoruz; cikaramadigimizi kullanici yazar.
 *
 * Instagram bilerek denenmiyor: profil giris duvarinin arkasinda, herkese acik
 * bir API yok. Oradan yalnizca kullanici adini oneriyoruz.
 */
export async function POST(req: Request) {
  let body: { link?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const link = parseLink(body.link ?? '')
  if (!link) {
    return NextResponse.json(
      { error: 'Bağlantı geçersiz. Instagram profili ya da site adresi yaz.' },
      { status: 400 }
    )
  }

  if (link.kind === 'INSTAGRAM') {
    return NextResponse.json({
      kind: link.kind,
      ad: link.handle,
      aciklama: null,
      logo: null,
      not: 'Instagram profil bilgisi çekilemiyor; adı ve açıklamayı sen yaz.',
    })
  }

  const bilgi = await siteBilgisi(link.url)

  return NextResponse.json({ kind: link.kind, ...bilgi })
}

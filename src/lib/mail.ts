import { siteUrl } from './site'

/**
 * E-posta gonderimi — Resend REST.
 *
 * SDK eklemedik: tek bir POST istegi, bagimlilik tasimaya degmez.
 *
 * Anahtar yoksa gonderim SESSIZCE atlanir, hata firlatilmaz. Sebep: bildirim
 * hicbir zaman odeme yolunu kirmamali. Atlandigi Outbid kaydina `error` olarak
 * yazildigi icin kaybolmuyor.
 */

const UC = 'https://api.resend.com/emails'

/** Hem anahtar hem gonderen adres olmadan gonderim yapilamaz. */
export const POSTA_HAZIR = Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM)

export type PostaSonuc = { ok: true; id?: string } | { ok: false; hata: string }

export async function postaGonder(params: {
  to: string
  konu: string
  html: string
  text: string
}): Promise<PostaSonuc> {
  if (!POSTA_HAZIR) return { ok: false, hata: 'POSTA_KAPALI' }

  try {
    const res = await fetch(UC, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [params.to],
        subject: params.konu,
        html: params.html,
        text: params.text,
      }),
    })

    if (!res.ok) {
      const govde = await res.text().catch(() => '')
      return { ok: false, hata: `HTTP_${res.status} ${govde}`.slice(0, 300) }
    }

    const data = (await res.json().catch(() => null)) as { id?: string } | null
    return { ok: true, id: data?.id }
  } catch (e) {
    return { ok: false, hata: (e instanceof Error ? e.message : 'AG_HATASI').slice(0, 300) }
  }
}

/**
 * Ortak mail iskeleti. Tahtanin karanlik/neon dili, ama e-posta istemcilerinin
 * anladigi kadariyla: tablo yok, inline stil, web fontu yok.
 *
 * Koyu zemin destegi Gmail'de sinirli; bu yuzden metin kontrasti koyu zemine
 * DEGIL, kendi rengine dayaniyor (acik temada da okunur).
 */
export function mailIskelet(params: {
  ustBaslik: string
  baslik: string
  govde: string
  dugmeMetni: string
  dugmeUrl: string
  altNot: string
}): string {
  const { ustBaslik, baslik, govde, dugmeMetni, dugmeUrl, altNot } = params
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${kacir(baslik)}</title></head>
<body style="margin:0;padding:24px;background:#08080a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#121215;border:1px solid #2a2a31;border-radius:16px;padding:28px;">
    <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8e8e99;">${kacir(ustBaslik)}</div>
    <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;color:#f4f4f5;">${kacir(baslik)}</h1>
    <div style="margin-top:14px;font-size:15px;line-height:1.6;color:#c9c9d1;">${govde}</div>
    <a href="${kacir(dugmeUrl)}" style="display:inline-block;margin-top:22px;background:#ffb020;color:#08080a;font-weight:700;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:999px;">${kacir(dugmeMetni)}</a>
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #2a2a31;font-size:12px;line-height:1.6;color:#8e8e99;">${kacir(altNot)}</div>
    <div style="margin-top:10px;font-size:12px;color:#8e8e99;">
      <a href="${siteUrl()}" style="color:#8e8e99;">Tabela</a> — sıralama teklife göredir, kalite değerlendirmesi değildir.
    </div>
  </div>
</body></html>`
}

/** Mail govdesine giren her degisken buradan geciyor. */
export function kacir(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

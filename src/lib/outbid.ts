import { prisma } from './prisma'
import { getTopBid } from './board'
import { cityName } from './cities'
import { linkLabel } from './links'
import { tl } from './format'
import { mutlak } from './site'
import { priceToPass } from './rules'
import { mailIskelet, postaGonder, kacir } from './mail'

/**
 * "USTE CIKILDIN" — dongunun tekrar gelir ureten adimi.
 *
 * Tahta izlenir olmasiyla degil, tahtin ELDEN GITTIGININ haber verilmesiyle
 * calisiyor. Geri kalan her sey (canli akis, rozet, sehir sampiyonlari) bu
 * anin seyircisi. Bu dosya olmadan urun tek seferlik bir satis; bu dosyayla
 * tekrar eden bir bahis.
 *
 * Kurallar:
 *   - Bir teklif icin bir ilana bir kez yazilir (Outbid unique) — odeme
 *     callback'i iki kez gelse de ikinci mail gitmez.
 *   - Teklif basina en fazla DORT ilan uyarilir: gecilenlerin en yakin ucu
 *     (sirasini en ucuz geri alabilecekler) + varsa dusurulen sehir sampiyonu.
 *     Buyuk bir teklif tahtanin yarisina mail atmasin diye.
 *   - Gonderim ASLA odeme yolunu kirmaz: her hata Outbid.error'a yazilir.
 */

/** Teklif basina uyarilacak en fazla ilan sayisi. */
const EN_FAZLA = 3

type Sebep = 'TAHT' | 'SEHIR' | 'SIRA'

/**
 * Bir teklif uygulandiktan SONRA cagrilir.
 *
 * @param bidId      uygulanan teklif
 * @param listingId  teklifi veren ilan
 * @param onceki     ilanin teklif oncesi tutari (yeni ilanda 0)
 * @param yeni       ilanin yeni tutari
 */
export async function usteCikildiBildir(params: {
  bidId: string
  listingId: string
  onceki: number
  yeni: number
}): Promise<void> {
  const { bidId, listingId, onceki, yeni } = params
  if (yeni <= onceki) return

  const gecen = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, name: true, url: true, city: true, currentBid: true },
  })
  if (!gecen) return

  // Gecilenler: teklif oncesi bizim USTUMUZDE olup artik ALTIMIZDA kalanlar.
  const gecilenler = await prisma.listing.findMany({
    where: {
      id: { not: gecen.id },
      currentBid: { gt: onceki, lt: yeni },
    },
    orderBy: { currentBid: 'desc' },
    select: {
      id: true,
      name: true,
      city: true,
      currentBid: true,
      ownerName: true,
      ownerEmail: true,
    },
  })
  if (!gecilenler.length) return

  // En yakin ucu + ayni sehirden dusen en guclu rakip (listenin disinda kaldiysa).
  const secilen = gecilenler.slice(0, EN_FAZLA)
  const sehirli = gecilenler.find((l) => l.city === gecen.city)
  if (sehirli && !secilen.some((l) => l.id === sehirli.id)) secilen.push(sehirli)

  const topBid = await getTopBid()

  for (const kaybeden of secilen) {
    // Idempotency: kayit acilamiyorsa bu teklif icin zaten yazilmis demektir.
    let kayit
    try {
      kayit = await prisma.outbid.create({
        data: { listingId: kaybeden.id, byBidId: bidId, reason: 'SIRA' },
        select: { id: true },
      })
    } catch {
      continue
    }

    try {
      const [ustunde, sehirdeUstunde] = await Promise.all([
        prisma.listing.count({ where: { currentBid: { gt: kaybeden.currentBid } } }),
        prisma.listing.count({
          where: { city: kaybeden.city, currentBid: { gt: kaybeden.currentBid } },
        }),
      ])
      const sira = ustunde + 1
      const sehirSira = sehirdeUstunde + 1

      // Bu teklif kaybedeni tam bir basamak asagi itti; eski sirasi bir yukarisi.
      const sebep: Sebep =
        sira === 2 ? 'TAHT' : gecen.city === kaybeden.city && sehirSira === 2 ? 'SEHIR' : 'SIRA'

      // Geri almanin bedeli her ucunde de "bizi gecen ilani gecmek".
      const geriAl = priceToPass(gecen.currentBid, kaybeden.currentBid, topBid)

      await prisma.outbid.update({ where: { id: kayit.id }, data: { reason: sebep } })

      if (!kaybeden.ownerEmail) {
        await prisma.outbid.update({ where: { id: kayit.id }, data: { error: 'EPOSTA_YOK' } })
        continue
      }

      const mail = outbidMetni({
        sebep,
        kaybeden: { ...kaybeden, sira, sehirSira },
        gecen: { ad: gecen.name, etiket: linkLabel(gecen.url), tutar: gecen.currentBid },
        geriAl,
      })

      const sonuc = await postaGonder({ to: kaybeden.ownerEmail, ...mail })

      await prisma.outbid.update({
        where: { id: kayit.id },
        data: sonuc.ok ? { sentAt: new Date() } : { error: sonuc.hata },
      })
    } catch (e) {
      await prisma.outbid
        .update({
          where: { id: kayit.id },
          data: { error: (e instanceof Error ? e.message : 'HATA').slice(0, 300) },
        })
        .catch(() => {})
    }
  }
}

/**
 * Mailin metni. Uc sebep, uc farkli cumle — hepsi ayni yere baglaniyor.
 * Disari acik: gondermeden onizlemek/test etmek icin (saf fonksiyon).
 */
export function outbidMetni(p: {
  sebep: Sebep
  kaybeden: { id: string; name: string; city: string; currentBid: number; sira: number; sehirSira: number }
  gecen: { ad: string; etiket: string; tutar: number }
  geriAl: number
}): { konu: string; html: string; text: string } {
  const { sebep, kaybeden, gecen, geriAl } = p
  const sehir = cityName(kaybeden.city)
  const fark = Math.max(0, geriAl - kaybeden.currentBid)
  const url = mutlak(`/ilan/${kaybeden.id}?geriAl=${Math.ceil(geriAl / 100)}`)

  const baslik =
    sebep === 'TAHT'
      ? '1 numaralığı kaybettin.'
      : sebep === 'SEHIR'
        ? `${sehir}’in 1 numarası değişti.`
        : `${kaybeden.name} bir sıra geriledi.`

  const dugme =
    sebep === 'TAHT'
      ? '1 numarayı geri al'
      : sebep === 'SEHIR'
        ? `${sehir}’i geri al`
        : 'Sıranı geri al'

  const olan = `<strong style="color:#f4f4f5;">${kacir(gecen.ad)}</strong> (${kacir(gecen.etiket)}) ${kacir(tl(gecen.tutar))} verdi ve seni geçti.`

  const durum = `Şu an <strong style="color:#f4f4f5;">Türkiye ${kaybeden.sira}.</strong>, ${kacir(sehir)} ${kaybeden.sehirSira}. sıradasın.`

  const bedel = `Yatırdığın <strong style="color:#f4f4f5;">${kacir(tl(kaybeden.currentBid))}</strong> duruyor — sadece <strong style="color:#ffb020;">${kacir(tl(fark))}</strong> fark ödersin.`

  const html = mailIskelet({
    ustBaslik: sebep === 'TAHT' ? 'Türkiye 1 numarası' : sebep === 'SEHIR' ? sehir : 'Tabela',
    baslik,
    govde: `<p style="margin:0 0 10px;">${olan}</p><p style="margin:0 0 10px;">${durum}</p><p style="margin:0;">${bedel}</p>`,
    dugmeMetni: `${dugme} — ${tl(fark)}`,
    dugmeUrl: url,
    altNot: `Bu e-postayı ${kaybeden.name} ilanının sahibi olarak alıyorsun. Sıralama yalnızca teklif tutarına göredir.`,
  })

  const text = [
    baslik,
    '',
    `${gecen.ad} (${gecen.etiket}) ${tl(gecen.tutar)} verdi ve seni geçti.`,
    `Şu an Türkiye ${kaybeden.sira}., ${sehir} ${kaybeden.sehirSira}. sıradasın.`,
    `Yatırdığın ${tl(kaybeden.currentBid)} duruyor; sadece ${tl(fark)} fark ödersin.`,
    '',
    `${dugme}: ${url}`,
  ].join('\n')

  return { konu: `${baslik} ${gecen.ad} ${tl(gecen.tutar)} verdi`, html, text }
}

import { randomBytes } from 'crypto'
import { after } from 'next/server'
import { prisma } from './prisma'
import { SIRALAMA } from './board'
import { usteCikildiBildir } from './outbid'
import { checkBid } from './rules'
import { linkLabel } from './links'
import { SHOPIER_HAZIR } from './shopier'

/**
 * Odeme kesme noktasi — TEK GIRIS.
 *
 * TEST MODU (`PAYMENT_MODE !== 'live'` ya da Shopier anahtarlari yok):
 *   teklif aninda PAID sayilir, para istenmez. Gelistirme icin.
 *
 * CANLI:
 *   Bid PENDING yazilir + tek kullanimlik jeton -> kullanici `/odeme/[jeton]`
 *   sayfasina gider -> form Shopier'e POST edilir -> Shopier callback'e POST
 *   eder -> imza dogrulanir -> applyPaidBid.
 *
 * applyPaidBid tek uygulama noktasidir; callback iki kez gelse de bir kez isler.
 */
export const TEST_MODU = process.env.PAYMENT_MODE !== 'live' || !SHOPIER_HAZIR

export type PlaceResult =
  | { ok: true; applied: true; listingId: string; bidId: string; paid: number; rank: number }
  | { ok: true; applied: false; bidId: string; paid: number; paymentUrl: string }
  | { ok: false; error: string; minimum?: number }

/** Tahtadaki en yuksek teklif. */
async function topBid(): Promise<number> {
  const top = await prisma.listing.findFirst({
    where: { currentBid: { gt: 0 } },
    orderBy: { currentBid: 'desc' },
    select: { currentBid: true },
  })
  return top?.currentBid ?? 0
}

export async function placeBid(
  listingId: string,
  amount: number,
  ctx?: { ip: string; origin: string }
): Promise<PlaceResult> {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return { ok: false, error: 'İlan bulunamadı.' }

  const top = await topBid()
  const check = checkBid(amount, listing.currentBid, top)
  if (!check.ok) return { ok: false, error: check.reason, minimum: check.minimum }

  // Bu teklifle geride birakilan en guclu rakip — aktivite akisinin cumlesi.
  const passed = await prisma.listing.findFirst({
    where: {
      id: { not: listing.id },
      currentBid: { gt: listing.currentBid, lt: amount },
    },
    orderBy: { currentBid: 'desc' },
    select: { url: true },
  })

  const above = await prisma.listing.count({ where: { currentBid: { gt: amount } } })
  const rank = above + 1

  const bid = await prisma.bid.create({
    data: {
      listingId: listing.id,
      amount,
      paid: check.paid,
      status: 'PENDING',
      passedLabel: passed ? linkLabel(passed.url) : null,
      rankAfter: rank,
    },
  })

  if (TEST_MODU) {
    await applyPaidBid(bid.id)
    return { ok: true, applied: true, listingId: listing.id, bidId: bid.id, paid: check.paid, rank }
  }

  // --- Canli: Shopier ---
  if (!ctx) return { ok: false, error: 'Ödeme başlatılamadı.' }

  // Alici bilgisi olmadan odeme baslatmiyoruz: Shopier alici adi/e-postasi
  // istiyor, uydurma veri fatura ve fraud tarafini bozar.
  if (!listing.ownerName || !listing.ownerEmail) {
    await prisma.bid.update({
      where: { id: bid.id },
      data: { status: 'FAILED', failureCode: 'ALICI_YOK', failureMsg: 'Iletisim bilgisi yok' },
    })
    return { ok: false, error: 'Ödeme için iletişim bilgisi gerekiyor.' }
  }

  // Tek kullanimlik jeton. Odeme sayfasinin adresi teklif kimligi OLAMAZ:
  // teklif kimlikleri ilan sayfasinin kaynagindan okunabiliyor ve o sayfa
  // formda ilan sahibinin adini/e-postasini tasiyor — herkese acik bir
  // adres olsa iletisim bilgisi sizardi.
  const jeton = randomBytes(24).toString('base64url')
  await prisma.bid.update({ where: { id: bid.id }, data: { paymentToken: jeton } })

  return {
    ok: true,
    applied: false,
    bidId: bid.id,
    paid: check.paid,
    paymentUrl: `${ctx.origin}/odeme/${jeton}`,
  }
}

/**
 * Odeme onaylandiginda cagrilacak TEK nokta. Idempotent.
 *
 * ⚠️ Bilincli kural: para tahsil edildiyse teklif HER ZAMAN uygulanir.
 * Odeme sirasinda baskasi ayni tutari verip one gectiyse kullanici parasini
 * bosa vermez — sadece bekledigi siraya degil, tutarinin hak ettigi siraya
 * oturur (esitlikte once odeyen ustte). Parayi alip hicbir sey vermemek yok.
 */
export async function applyPaidBid(bidId: string): Promise<void> {
  const bid = await prisma.bid.findUnique({ where: { id: bidId } })
  if (!bid || bid.status === 'PAID') return

  let onceki = 0
  let yeni = 0

  await prisma.$transaction(async (tx) => {
    await tx.bid.update({ where: { id: bid.id }, data: { status: 'PAID' } })

    const listing = await tx.listing.findUnique({ where: { id: bid.listingId } })
    if (!listing) return

    onceki = listing.currentBid

    // Arada daha yuksek bir teklif gectiyse geri sarma.
    if (bid.amount > listing.currentBid) {
      yeni = bid.amount
      await tx.listing.update({
        where: { id: listing.id },
        data: {
          currentBid: bid.amount,
          firstBidAt: listing.firstBidAt ?? new Date(),
          lastBidAt: new Date(),
        },
      })
    }
  })

  if (yeni <= onceki) return

  await tahtiGuncelle()

  // Bildirim odeme yolunun DISINDA: kullanici cevabini beklemesin, mail
  // saglayicisi yavaslarsa ya da patlarsa teklif yine de gecerli olsun.
  arkaPlanda(() => usteCikildiBildir({ bidId: bid.id, listingId: bid.listingId, onceki, yeni }))
}

/**
 * Taht suresi. "3 saattir zirvede" cumlesinin tek yazan yeri.
 *
 * 1 numara degistiyse yeni sahibin sayaci sifirlanir, eskininki temizlenir.
 * Degismediyse sayac ILERLEMEZ — kendi teklifini yukselten lider "az once
 * zirveye cikti" gorunmesin diye.
 */
async function tahtiGuncelle(): Promise<void> {
  const top = await prisma.listing.findFirst({
    where: { currentBid: { gt: 0 } },
    orderBy: SIRALAMA,
    select: { id: true, topSince: true },
  })
  if (!top) return

  // Tahti kaybedenlerde bayat sayac kalmasin.
  await prisma.listing.updateMany({
    where: { id: { not: top.id }, topSince: { not: null } },
    data: { topSince: null },
  })

  if (!top.topSince) {
    await prisma.listing.update({ where: { id: top.id }, data: { topSince: new Date() } })
  }
}

/**
 * Istek bitse de calismasi gereken isler icin. Next'in `after`i istek
 * baglaminda calisir; script/seed gibi baglamsiz cagrilarda ates-et-unut'a
 * duser (orada istek zaten sonlanmiyor).
 */
function arkaPlanda(is: () => Promise<void>): void {
  try {
    after(is)
  } catch {
    void is().catch(() => {})
  }
}

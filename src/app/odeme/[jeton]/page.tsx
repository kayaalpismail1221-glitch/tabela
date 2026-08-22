import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { odemeFormu, SHOPIER_HAZIR } from '@/lib/shopier'
import { tl } from '@/lib/format'

export const dynamic = 'force-dynamic'

/**
 * Shopier'e giden ara sayfa.
 *
 * Shopier gidilecek bir adres dondurmuyor, imzalanmis bir FORM POST'u
 * bekliyor. Formu burada kuruyoruz; imza sunucuda hesaplaniyor, gizli anahtar
 * hicbir zaman tarayiciya inmiyor.
 *
 * Adres teklif kimligi DEGIL tek kullanimlik jeton: teklif kimlikleri ilan
 * sayfasinin kaynagindan okunabiliyor ve bu form ilan sahibinin adini ve
 * e-postasini tasiyor.
 *
 * Form kendiliginden gonderiliyor; JavaScript kapaliysa dugme duruyor.
 */
export default async function OdemePage({ params }: PageProps<'/odeme/[jeton]'>) {
  const { jeton } = await params

  const bid = await prisma.bid.findUnique({
    where: { paymentToken: jeton },
    include: { listing: true },
  })
  if (!bid || !bid.listing.ownerName || !bid.listing.ownerEmail) notFound()

  // Odenmis teklif icin form kurmuyoruz: ikinci kez odeme yapilmasin.
  if (bid.status === 'PAID') {
    return (
      <Kutu baslik="Bu ödeme zaten tamamlandı">
        <a href={`/ilan/${bid.listingId}`} className="text-neon hover:underline">
          İlana dön
        </a>
      </Kutu>
    )
  }

  if (!SHOPIER_HAZIR) {
    return (
      <Kutu baslik="Ödeme şu an açık değil">
        <p className="text-sm text-muted">Kısa süre sonra tekrar dene.</p>
      </Kutu>
    )
  }

  const { url, alanlar } = odemeFormu({
    bidId: bid.id,
    kurus: bid.paid,
    urunAdi: `Tabela ilan teklifi — ${bid.listing.name}`,
    alici: {
      ad: bid.listing.ownerName,
      email: bid.listing.ownerEmail,
      telefon: bid.listing.ownerPhone,
      sehir: bid.listing.city,
    },
  })

  return (
    <Kutu baslik="Ödeme sayfasına yönlendiriliyorsun">
      <p className="text-sm text-muted">
        <strong className="text-text">{tl(bid.paid)}</strong> tutarındaki ödeme Shopier’in güvenli
        sayfasında alınacak. Kart bilgilerin bize hiçbir aşamada girmez.
      </p>

      <form id="shopier" method="POST" action={url} className="mt-5">
        {Object.entries(alanlar).map(([ad, deger]) => (
          <input key={ad} type="hidden" name={ad} value={deger} />
        ))}
        <button
          type="submit"
          className="w-full rounded-xl bg-neon px-6 py-3 font-black text-ink transition hover:brightness-110"
        >
          Ödemeye geç
        </button>
      </form>

      {/* Kendiliginden gonder; JS kapaliysa yukaridaki dugme duruyor. */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.getElementById('shopier').submit()",
        }}
      />
    </Kutu>
  )
}

function Kutu({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-line bg-surface/40 p-6 text-center">
        <h1 className="text-xl font-black">{baslik}</h1>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}

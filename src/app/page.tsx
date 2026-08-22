import Link from 'next/link'
import {
  getBoard,
  getBoardToplam,
  getCityChampions,
  getActivity,
  getZirve,
} from '@/lib/board'
import { Board } from '@/components/Board'
import { Sayfalama } from '@/components/Sayfalama'
import { CityChampions } from '@/components/CityChampions'
import { TurkeyMap } from '@/components/TurkeyMap'
import { PopulerSerit } from '@/components/PopulerSerit'
import { ActivityFeed } from '@/components/ActivityFeed'
import { LivePill } from '@/components/LivePill'
import { ClaimFirst } from '@/components/ClaimFirst'
import { ziyaretKaydet } from '@/lib/stats'
import { headers } from 'next/headers'
import { tahtSozu } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** Sayfa basina ilan — "Turkiye Top" 50'lik dilimler halinde ilerliyor. */
const SAYFA_BOYU = 50

/**
 * Ziyaretciyi sunucuda da isaretliyoruz: aksi halde ilk boyamada ziyaret
 * HENUZ kaydedilmedigi icin "0 kisi burada" gorunup saniye sonra 1'e
 * sicriyordu — bozuk gibi duruyordu.
 */
async function ziyaretiKaydet() {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'yok'
  return ziyaretKaydet(ip, h.get('user-agent') ?? 'yok')
}

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const sp = await searchParams
  const istenenSayfa = Number(typeof sp.sayfa === 'string' ? sp.sayfa : 1)

  const toplam = await getBoardToplam()
  const toplamSayfa = Math.max(1, Math.ceil(toplam / SAYFA_BOYU))
  // Gecersiz/asiri buyuk sayfa numarasi son sayfaya dusuyor, 404 yerine.
  const sayfa = Number.isFinite(istenenSayfa)
    ? Math.min(Math.max(1, Math.floor(istenenSayfa)), toplamSayfa)
    : 1

  const [rows, champions, activity, rakamlar, zirve] = await Promise.all([
    getBoard(undefined, SAYFA_BOYU, (sayfa - 1) * SAYFA_BOYU),
    getCityChampions(),
    getActivity(20),
    ziyaretiKaydet(),
    getZirve(),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <section className="text-center">
        <LivePill aktif={rakamlar.aktif} ziyaretci={rakamlar.ziyaretci} />

        <div className="mt-6">
          <ClaimFirst
            zirve={
              zirve
                ? { id: zirve.id, name: zirve.name, soz: zirve.topSince ? tahtSozu(zirve.topSince) : null }
                : null
            }
          />
        </div>

        <p className="mt-6 text-sm text-muted">
          <Link href="/kurallar" className="hover:text-text">
            Nasıl çalışıyor?
          </Link>
        </p>
      </section>

      {/* Harita — anasayfanin en ustunde, tahtanin durumunu ilk gozle gorulen sey */}
      <div className="mt-12">
        <TurkeyMap
          champions={champions}
          hacim={rakamlar.hacim}
          tahtDegisimi={rakamlar.tahtDegisimi}
        />
      </div>

      {/* Turkiye Top — haritanin hemen alti. Ilk 10 buyuk kart, 50'ye kadar
          sayfalanir; canli cekisme yaninda sabit durur. */}
      <section className="mt-12">
        <h2 className="text-2xl font-black">Türkiye Top</h2>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <Board rows={rows} />
            <Sayfalama sayfa={sayfa} toplamSayfa={toplamSayfa} taban="/" />
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <ActivityFeed
              initial={activity.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
            />
          </div>
        </div>
      </section>

      <div className="mt-16">
        <PopulerSerit champions={champions} />
      </div>

      <div className="mt-16">
        <CityChampions champions={champions} />
      </div>
    </div>
  )
}

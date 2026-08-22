'use client'

import { useRef, useState } from 'react'
import { kareyeSikistir } from '@/lib/gorselKucult'

/**
 * LOGO KIRPMA — kullanici hangi karenin amblem olacagini kendi secsin.
 *
 * Onceden fotograf otomatik ORTADAN kare kirpiliyordu (`gorselKucult`); logo
 * fotografin ortasinda degilse yanlis parca kesiliyordu ve kullanicinin
 * duzeltecek hicbir yolu yoktu ("millet tam secemiyor" — 2026-08-22
 * kullanici geri bildirimi). Simdi surukleyip yakinlastirarak kareyi kendisi
 * seciyor, onaylamadan hicbir sey kaydedilmiyor.
 *
 * Surukleme fare VE dokunmatik icin ayni `Pointer Events` API'siyle;
 * `setPointerCapture` sayesinde parmak/imlec kutunun disina cikinca da
 * surukleme kopmuyor.
 */

/** Kirpma kutusunun ekrandaki kenar uzunlugu (CSS piksel). */
const KUTU_PX = 260
/** En fazla yakinlastirma — bunun uzeri kaliteyi anlamsizca dusurur. */
const MAX_YAKINLIK = 3

export function LogoKirp({
  gorsel,
  onOnayla,
  onVazgec,
}: {
  gorsel: HTMLImageElement
  onOnayla: (dataUri: string) => void
  onVazgec: () => void
}) {
  const kutuRef = useRef<HTMLDivElement>(null)
  const surukluyor = useRef<{ baslarken: { x: number; y: number }; ofset: { x: number; y: number } } | null>(
    null
  )

  // "Cover" olcegi: goruntu KUTU_PX'i bosluksuz doldursun (kucuk kenar esas alinir).
  const kapsamaOlcegi = KUTU_PX / Math.min(gorsel.width, gorsel.height)

  const [yakinlik, setYakinlik] = useState(1)
  // Ilk konum ortalanmis "cover" — lazy initializer'da hesaplaniyor ki
  // render sirasinda ayrica bir setState (ve onun tetikledigi ekstra
  // render) gerekmesin.
  const [ofset, setOfset] = useState(() => ({
    x: (KUTU_PX - gorsel.width * kapsamaOlcegi) / 2,
    y: (KUTU_PX - gorsel.height * kapsamaOlcegi) / 2,
  }))

  const toplamOlcek = kapsamaOlcegi * yakinlik
  const genislik = gorsel.width * toplamOlcek
  const yukseklik = gorsel.height * toplamOlcek

  /** Goruntu kutunun disina bosluk birakmasin diye ofseti sinirlar. */
  function sinirla(x: number, y: number, g = genislik, y2 = yukseklik) {
    const minX = Math.min(0, KUTU_PX - g)
    const minY = Math.min(0, KUTU_PX - y2)
    return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) }
  }

  function suruklemeBaslat(e: React.PointerEvent) {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    surukluyor.current = { baslarken: { x: e.clientX, y: e.clientY }, ofset }
  }

  function surukleniyor(e: React.PointerEvent) {
    if (!surukluyor.current) return
    const dx = e.clientX - surukluyor.current.baslarken.x
    const dy = e.clientY - surukluyor.current.baslarken.y
    setOfset(sinirla(surukluyor.current.ofset.x + dx, surukluyor.current.ofset.y + dy))
  }

  function suruklemeBitir() {
    surukluyor.current = null
  }

  function yakinlikDegisti(yeni: number) {
    const yeniOlcek = kapsamaOlcegi * yeni
    setYakinlik(yeni)
    setOfset((eski) => sinirla(eski.x, eski.y, gorsel.width * yeniOlcek, gorsel.height * yeniOlcek))
  }

  /** Onizlemede kare cerceve tam ortada; kaydirilan gorsele gore taban cizgisi. */
  const cerceveSol = 0
  const cerceveUst = 0

  const onayla = () => {
    // Ekrandaki kutu (0,0)-(KUTU_PX,KUTU_PX) neresi, orijinal gorsel piksellerinde
    // karsiligi ne — ofset ve toplam olcek tersine cevrilerek bulunuyor.
    const sx = (cerceveSol - ofset.x) / toplamOlcek
    const sy = (cerceveUst - ofset.y) / toplamOlcek
    const s = KUTU_PX / toplamOlcek
    onOnayla(kareyeSikistir(gorsel, { sx, sy, s }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Logo kırp"
    >
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-black">Logonu kırp</h2>
        <p className="mt-1 text-xs text-muted">
          Sürükleyerek konumla, gerekirse yakınlaştır — çerçevede kalan kısım amblem olur.
        </p>

        <div
          ref={kutuRef}
          className="relative mt-4 touch-none select-none overflow-hidden rounded-xl border-2 border-neon/50 bg-ink"
          style={{ width: KUTU_PX, height: KUTU_PX }}
          onPointerDown={suruklemeBaslat}
          onPointerMove={surukleniyor}
          onPointerUp={suruklemeBitir}
          onPointerCancel={suruklemeBitir}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gorsel.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none"
            style={{
              width: genislik,
              height: yukseklik,
              left: ofset.x,
              top: ofset.y,
            }}
          />
        </div>

        <label className="mt-4 flex items-center gap-3 text-xs text-muted">
          <span className="shrink-0">Yakınlaştır</span>
          <input
            type="range"
            min={1}
            max={MAX_YAKINLIK}
            step={0.05}
            value={yakinlik}
            onChange={(e) => yakinlikDegisti(Number(e.target.value))}
            className="w-full accent-neon"
          />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onVazgec}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-muted transition hover:text-text"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onayla}
            className="rounded-xl bg-neon px-4 py-2.5 text-sm font-black text-ink transition hover:brightness-110"
          >
            Kullan
          </button>
        </div>
      </div>
    </div>
  )
}

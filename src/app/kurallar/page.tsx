import Link from 'next/link'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF, MIN_ARTIS, ZIRVE_FARKI } from '@/lib/rules'

export const metadata = { title: 'Kurallar — Tabela' }

const KURALLAR: { baslik: string; metin: string }[] = [
  {
    baslik: 'Sıra teklife göre',
    metin:
      'Listede üstte olmanın tek yolu daha yüksek teklif vermek. Eşit teklifte önce gelen üstte kalır.',
  },
  {
    baslik: 'Tek liste, iki görünüm',
    metin:
      'İlanın hem Türkiye tahtasında hem kendi şehir tahtanda görünür. Ayrı ödeme yok; şehir tahtası aynı listenin süzülmüş hâli.',
  },
  {
    baslik: 'Sadece farkı ödersin',
    metin:
      'Kendi teklifini yükseltirken tutarın tamamını değil, aradaki farkı ödersin. En küçük artış ' +
      tl(MIN_ARTIS) +
      '.',
  },
  {
    baslik: '1 numaranın bedeli',
    metin:
      'Zirveyi almak için mevcut liderin en az ' +
      tl(ZIRVE_FARKI) +
      ' üstüne çıkman gerekir. Böylece 1 numara kuruş kuruş taciz edilmez.',
  },
  {
    baslik: 'Süre yok, üste çıkılana kadar',
    metin:
      'Teklifinin süresi dolmaz. Biri seni geçene kadar sıranı korursun. Geçildiğinde haber veririz.',
  },
  {
    baslik: 'Haftalık teslimat',
    metin:
      'Türkiye 1 numarası ve şehir şampiyonları, o hafta gastronomi hesabımızdan yayınlanır. Aldığın şey sadece sıra değil, gerçek erişim.',
  },
  {
    baslik: 'İade yok',
    metin:
      'Teklif, tuttuğun süre boyunca görünürlük karşılığıdır. Üste çıkıldığında ödediğin tutar iade edilmez.',
  },
  {
    baslik: 'Instagram ya da kendi siten',
    metin:
      'Tek bağlantı yazarsın: Instagram profilin ya da kendi siten. Tıklayan oraya gider. Aynı bağlantı iki kez tahtaya çıkamaz.',
  },
  {
    baslik: 'Bu bir kalite listesi değil',
    metin:
      'Sıralama ödemeye göredir. Lezzet, hijyen ya da kalite değerlendirmesi içermez; sponsorlu sıralamadır.',
  },
]

export default function KurallarPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black sm:text-5xl">
        Kurallar <span className="neon text-neon">basit</span>
      </h1>
      <p className="mt-3 text-muted">
        Listeye giriş {tl(TABAN_TEKLIF)}. Gerisi senin ne kadar iddialı olduğuna bağlı.
      </p>

      <ol className="mt-8 space-y-5">
        {KURALLAR.map((k, i) => (
          <li key={k.baslik} className="flex gap-4">
            <span className="mt-0.5 w-7 shrink-0 text-right text-lg font-black tabular-nums text-neon">
              {i + 1}
            </span>
            <div>
              <h2 className="font-bold">{k.baslik}</h2>
              <p className="mt-1 text-sm text-muted">{k.metin}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        href="/ilan-ver"
        className="mt-10 inline-block rounded-full bg-neon px-6 py-3 font-bold text-ink transition hover:brightness-110"
      >
        Tahtaya çık
      </Link>
    </div>
  )
}

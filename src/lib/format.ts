/** Kurus -> "1.250 ₺" */
export function tl(kurus: number): string {
  const lira = kurus / 100
  // Kurusluk bir tutar varsa iki hane goster (1.250,50), tam liraysa hic gosterme
  const kurusluk = !Number.isInteger(lira)
  return (
    lira.toLocaleString('tr-TR', {
      minimumFractionDigits: kurusluk ? 2 : 0,
      maximumFractionDigits: 2,
    }) + ' ₺'
  )
}

/** ISO hafta anahtari: "2026-W34" — Delivery kayitlari icin. */
export function weekKey(d: Date = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/** "3 dakika once" */
export function since(d: Date | string): string {
  const ms = Date.now() - new Date(d).getTime()
  const dk = Math.floor(ms / 60000)
  if (dk < 1) return 'az once'
  if (dk < 60) return `${dk} dk once`
  const sa = Math.floor(dk / 60)
  if (sa < 24) return `${sa} saat once`
  return `${Math.floor(sa / 24)} gun once`
}

/**
 * Taht suresi — "3 saattir zirvede".
 *
 * Tam cumleyi burasi kuruyor cunku sonuc SUNUCUDA hesaplanip istemciye dize
 * olarak geciyor: iki tarafta ayri ayri Date.now() cagirmak hidrasyon
 * uyusmazligi uretiyor.
 */
export function tahtSozu(d: Date | string): string {
  const dk = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (dk < 2) return 'az önce zirveye çıktı'
  if (dk < 60) return `${dk} dakikadır zirvede`
  const sa = Math.floor(dk / 60)
  if (sa < 48) return `${sa} saattir zirvede`
  return `${Math.floor(sa / 24)} gündür zirvede`
}

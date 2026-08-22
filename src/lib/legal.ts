/**
 * Yasal metinlerin ortak verisi — TEK KAYNAK.
 *
 * ⚠️ SATICI bilgileri henuz YOK: tuzel kisilik kurulmadi. Mesafeli Satis
 * Sozlesmesi hukuken satici kunyesi olmadan eksiktir; ilk gercek tahsilattan
 * ONCE asagidaki alanlar doldurulmali. Shopier bireysel saticiya acik oldugu
 * icin tahsilat tuzel kisilik olmadan baslayabiliyor — bu, kunyenin gerekli
 * OLMADIGI anlamina GELMIYOR. Baska hicbir yerde
 * kopyasi yok, yalnizca burasi degisecek.
 */
export const SATICI = {
  unvan: '',
  adres: '',
  vergiDairesi: '',
  vergiNo: '',
  telefon: '',
  eposta: 'merhaba@tabela.lol',
} as const

/** Kunye alanlarindan en az biri bos mu? Sayfalar buna gore uyari gosteriyor. */
export const SATICI_EKSIK = !SATICI.unvan || !SATICI.vergiNo

export const SITE_ADI = 'Tabela'

/** Metinlerin son guncellenme tarihi — degistirince burayi da guncelle. */
export const YURURLUK = '21 Ağustos 2026'

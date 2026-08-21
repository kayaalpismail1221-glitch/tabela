# Tabela

Türkiye'nin restoran tahtası. Restoranlar Instagram hesaplarıyla ilan verir,
**sıra teklife göre** belirlenir. outbid.lol mekaniği, Türkiye'ye ve gastronomiye
uyarlanmış hâli.

> **İyi olan değil, iddialı olan üstte.** — Marka mesajı bu, ve aynı zamanda
> hukuki kalkan. Bunu "en iyi restoranlar" diye konumlandırmak hem yalan olur
> hem Reklam Kurulu problemi yaratır.

## Ürünün tek cümlesi

**Tek ekonomi, iki görünüm.** Tek ilan, tek teklif, tek para.
Genel liste = tüm ilanlar teklife göre. Şehir listesi = aynı listenin şehir
süzülmüş hâli — ayrı açık artırma **değil**.

Bunun kritik sonucu: taban teklifle giren Trabzonlu mekân Türkiye'de 400.
sıradadır ama **Trabzon'da 1 numaradır**. Küçük şehirdeki restorana satılabilen
tek şey bu ucuz zafer.

## Komutlar

- `npm run dev` — geliştirme sunucusu
- `npm run build` — üretim derlemesi
- `npm run lint` — eslint (0 hata şartı)
- `npm run typecheck` — tsc --noEmit
- `npm run db:push` — şemayı veritabanına uygula
- `npm run db:seed` — geliştirme verisi (51 uydurma ilan, 37 il dolu)

## Yapı

| Yol | İçerik |
|---|---|
| `src/app/page.tsx` | Genel tahta + canlı çekişme + Şehir Şampiyonları |
| `src/app/[sehir]/` | Şehir tahtası (81 il, `cities.ts` slug'ları) |
| `src/app/ilan/[id]/` | İlan detayı + teklif yükseltme + rozet |
| `src/app/ilan-ver/` | İlan formu |
| `src/app/kurallar/` | Kurallar sayfası |
| `src/app/rozet/[id]/` | **1080×1920 story kartı** (next/og) |
| `src/app/git/[id]/` | Tıklama sayacı + Instagram'a yönlendirme |
| `src/app/api/listings` | İlan oluştur + ilk teklif |
| `src/app/api/bids` | Teklif yükselt |
| `src/app/api/activity` | Canlı çekişme akışı (8 sn yoklama) |
| `src/app/api/rank` | "Bu parayı verirsem kaçıncı olurum?" — canlı sıra önizlemesi |
| `src/components/RankPreview.tsx` | O önizlemenin arayüzü; hem ilan formunda hem teklif yükseltmede |
| `src/lib/rules.ts` | **Teklif kuralları — tek kaynak** |
| `src/lib/bids.ts` | Teklif uygulama + ödeme kesme noktası |
| `src/lib/board.ts` | Sıralama sorguları (sıra kuralı tek yerde) |
| `src/lib/cities.ts` | 81 il, plaka sırasında |
| `src/lib/links.ts` | Bağlantı çözümleme — Instagram mı site mi, tek yerde |
| `public/fonts/` | Inter woff dosyaları — **sadece rozet için** |

## Değişmez kurallar

1. **Sıra = `currentBid DESC, firstBidAt ASC`.** Eşitlikte eski teklif üstte.
   Bu sıralama `src/lib/board.ts` içinde tek yerde tanımlı, kopyalama.
2. **Tutarlar kuruş cinsinden integer.** Float yok. `tl()` sadece gösterim için.
3. **Kendi teklifini yükseltirken sadece fark tahsil edilir** (`checkBid` → `paid`).
4. **Zirveyi almak `ZIRVE_FARKI` kadar üste çıkmayı gerektirir** — 1 numara
   kuruş kuruş taciz edilmesin diye.
5. **Sponsorlu sıralama ibaresi footer'dan kaldırılamaz.** Reklam Kurulu şartı.

## ⏳ Açık işler

### 1. Fiyat bandı yer tutucu
`src/lib/rules.ts` içindeki üç rakam (taban 100 ₺, min artış 25 ₺, zirve farkı
100 ₺) **uydurma**. Taban kullanıcı kararı (2026-08-21); diğer ikisi ona oranla
seçildi. Gerçek değer restoran görüşmelerinden çıkacak. Tek dosya, tek değişiklik.

### 2. İyzico yazıldı ama HİÇ ÇALIŞTIRILMADI
`src/lib/iyzico.ts` + `api/iyzico/callback` duruyor. **Canlı anahtarla tek bir
kez bile denenmedi** — üye işyeri hesabı yok.

Akış: `placeBid` → Bid PENDING → Checkout Form → kullanıcı öder → İyzico
callback'e POST eder → `odemeDogrula` (token ile geri sorulur, gelen POST'a
güvenilmez) → `applyPaidBid`.

Anahtarlar geldiğinde ilk iş: **küçük tutarlı gerçek bir ödeme** ve callback'in
gerçekten geldiğinin teyidi.

Bilinçli kararlar:
- **Hosted Checkout Form + 3DS.** Kart bilgisi sunucumuza dokunmuyor → PCI
  SAQ-A (SAQ-D değil), chargeback sorumluluğu bankada. Culinora'da kendi form +
  non-3D kaldı çünkü orada çalışan bir akış vardı; burada öyle bir miras yok.
- **Para tahsil edildiyse teklif her zaman uygulanır.** Ödeme sırasında başkası
  öne geçtiyse kullanıcı parasını boşa vermez, tutarının hak ettiği sıraya
  oturur. Parayı alıp hiçbir şey vermemek yok.
- `identityNumber` sabit gönderiliyor — TCKN toplamıyoruz (KVKK). ⚠️ İyzico
  fraud skorlamasını etkileyebilir, üye işyeri açılışında sorulmalı.

### 3. Sahiplik doğrulaması YOK — bilinçli karar (2026-08-21)
İlan verirken hesap sahipliği doğrulanmıyor, sürtünmeyi kaldırmak için.
**Açık risk:** biri rakibinin mekânını tahtaya çıkarabilir ya da bir hesabı
işgal edebilir. Tek fren, ilanın paralı olması. Şikâyet gelirse elle indirme
yolu gerekecek — henüz yok.

Bağlantı Instagram profili **ya da** kendi sitesi olabilir; tür adresten
çıkarılıyor (`src/lib/links.ts`), kullanıcıya tür seçtirilmiyor. Aynı adres iki
kez tahtaya çıkamaz (`Listing.url` unique). Instagram bağlantısı mobilde
uygulamayı açar, açamazsa web'e düşer — bu tarayıcının işi, kodda özel bir şey
yok.

### 4. "Üste çıkıldın" bildirimi yok
Tekrar gelirin motoru bu. Mail + WhatsApp. Şu an sadece akışta görünüyor.

### 5. Haftalık teslimat kaydı boş
`Delivery` modeli duruyor ama yazan yok. Satışın karşılığı olan story/post'un
kanıtı orada tutulacak.

### 6. Veritabanı Postgres — lokalde de aynısı
SQLite'tan çıkıldı (2026-08-21). `DATABASE_URL` (havuzlanmış) +
`DATABASE_URL_UNPOOLED` (havuzsuz, `db push` için) gerekiyor. **İsimler
bilerek Neon'un ürettiği isimler** — Vercel'de elle env eklemek gerekmesin
diye. Başka bir sağlayıcıya geçilirse `prisma/schema.prisma` içindeki
`directUrl` satırı değişir.

Kurulum takılırsa `GET /api/health` hangi aşamada olduğunu söyler:
`DB_YOK` → `BAGLANTI_YOK` → `SEMA_YOK` → `TAMAM`. Değer döndürmez, yalnızca
"tanımlı mı" + Prisma hata kodu.

**Lokalde çalıştırmak için** aynı URL'leri `.env`e koy, sonra:
`npm run db:push && npm run db:seed`. Postgres olmadan uygulama açılmaz.

## Notlar

- Rozet fontu `public/fonts` altından `fs.readFile` ile okunuyor. `fetch(file://)`
  Node runtime'da çalışmıyor; `public/` her zaman deploy'a dahil olduğu için
  en güvenli yol bu.
- Satori aynı aile adı altındaki ikinci dosyaya düşmüyor: latin-ext ayrı aile
  adıyla (`InterExt`) kayıtlı ve `fontFamily: 'Inter, InterExt'` ile zincirleniyor.
  Aksi hâlde `İ` ve `₺` tofu çıkıyor.
- Seed'deki restoran isimlerinin tamamı **uydurma**. Gerçek hesap kullanma.

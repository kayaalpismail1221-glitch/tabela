# Tabela

Türkiye'nin restoran tahtası. Restoranlar Instagram hesaplarıyla ilan verir,
**sıra teklife göre** belirlenir. outbid.lol mekaniği, Türkiye'ye ve gastronomiye
uyarlanmış hâli.

> **İyi olan değil, iddialı olan üstte.** — Marka mesajı bu, ve aynı zamanda
> hukuki kalkan. Bunu "en iyi restoranlar" diye konumlandırmak hem yalan olur
> hem Reklam Kurulu problemi yaratır.

## Alan adı

**`tabela.lol`** (2026-08-22'de alındı, Vercel production'a bağlandı). Uzantı
şaka, marka değil: "iddialı olan üstte" göz kırpması. Header'daki rozet
`TABELA.lol` yazıyor.

Kanonik adres **kodda**: `src/lib/site.ts` → `ALAN_ADI`. Production
dağıtımında Vercel'in kendi değişkenine bakmıyoruz ki mailden gelen kullanıcı
`*.vercel.app` adresine düşmesin. `SITE_URL` sadece geçici/özel bir adres
gerekiyorsa doldurulur, normalde boş kalır.

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
| `src/app/ilan/[id]/?zafer=<bidId>` | **Zafer ekranı** — teklif geçtikten sonraki paylaşım anı |
| `src/components/Zafer.tsx` | O ekranın kendisi; rozet + WhatsApp + kopyala |
| `src/lib/outbid.ts` | **"Üste çıkıldın" bildirimi — döngünün tekrar gelir üreten adımı** |
| `src/lib/mail.ts` | Resend REST + mail iskeleti (SDK yok, tek POST) |
| `src/lib/site.ts` | **Kanonik alan adı (`tabela.lol`)** + mutlak bağlantı — tek kaynak |
| `src/lib/rules.ts` | **Teklif kuralları — tek kaynak** (`priceToPass` dahil) |
| `src/lib/bids.ts` | Teklif uygulama + ödeme kesme noktası |
| `src/lib/board.ts` | Sıralama sorguları (sıra kuralı tek yerde) |
| `src/lib/stats.ts` | Tahtanin rakamlari + LANSMAN sabiti — tek kaynak |
| `src/components/VisitorProvider.tsx` | Ziyaretci sayimi — kok yerlesimde, TUM sayfalarda |
| `src/lib/legal.ts` | Satici kunyesi + yururluk tarihi — yasal metinlerin tek kaynagi |
| `src/lib/db-url.ts` | Baglanti dizesi degisken adi cozumleme — tek yer |
| `src/components/TurkeyMap.tsx` | **Canlı harita** — anasayfada şehir seçici, sıfır JS |
| `src/lib/turkeyMap.ts` | 81 ilin SVG yol verisi (turkey-map-react, MIT) + viewBox |
| `src/lib/cities.ts` | 81 il, plaka sırasında |
| `src/lib/links.ts` | Bağlantı çözümleme — Instagram mı site mi, tek yerde |
| `public/fonts/` | Inter woff dosyaları — **sadece rozet için** |

## Döngü — ürünün tamamı bu

outbid.lol'ü viral yapan şey tahta değil, **tahtın el değiştirmesi**. Beş adım,
hepsi kodda:

1. **Tahtaya çık** — ilan + teklif (`/ilan-ver`).
2. **Sırayı al** — teklif geçer geçmez **zafer ekranı** açılır
   (`?zafer=<bidId>`): sıra, rozet, WhatsApp, kopyala. Sessiz `router.refresh()`
   parayı alıp hiçbir şey hissettirmemekti.
3. **Seyirci izler** — canlı çekişme akışı; tahtı alan teklif "1 NUMARA"
   rozetiyle ayrılır. Anasayfa başlığı tahtı kimin, ne kadardır tuttuğunu söyler.
4. **Geçilen haber alır** — `src/lib/outbid.ts` geçilenlere mail atar:
   ne kadarla geçildiği, yeni sırası ve **geri almanın farkı**. Düğme teklif
   kutusunu o rakamla açar (`?geriAl=<lira>`).
5. **Geri alır** → 2'ye dön.

Bu döngünün her adımı diğerine bağlı; birini kapatmak zincirin tamamını kırar.
Özellikle 4: onsuz ürün tek seferlik bir satış, onunla tekrar eden bir bahis.

### Bildirim kuralları (`src/lib/outbid.ts`)
- Bir teklif için bir ilana **bir kez** yazılır (`Outbid` unique) — ödeme
  callback'i iki kez gelse de ikinci mail gitmez.
- Teklif başına **en fazla 4** ilan uyarılır: geçilenlerin en yakın üçü +
  varsa düşürülen şehir şampiyonu. Büyük bir teklif tahtanın yarısına mail
  atmasın diye.
- Üç sebep: `TAHT` (Türkiye 1'liğini kaybetti), `SEHIR` (şehir 1'liğini),
  `SIRA` (sadece geçildi). Metin buna göre değişir, bağlantı aynı yere gider.
- Gönderim **asla ödeme yolunu kırmaz**: `after()` ile istek dışına alınır,
  her hata `Outbid.error` alanına yazılır (anahtar yoksa `POSTA_KAPALI`).

## Değişmez kurallar

1. **Sıra = `currentBid DESC, firstBidAt ASC`.** Eşitlikte eski teklif üstte.
   Bu sıralama `src/lib/board.ts` içinde tek yerde tanımlı, kopyalama.
2. **Tutarlar kuruş cinsinden integer.** Float yok. `tl()` sadece gösterim için.
3. **Kendi teklifini yükseltirken sadece fark tahsil edilir** (`checkBid` → `paid`).
4. **Zirveyi almak `ZIRVE_FARKI` kadar üste çıkmayı gerektirir** — 1 numara
   kuruş kuruş taciz edilmesin diye.
5. **Sponsorlu sıralama ibaresi footer'dan kaldırılamaz.** Reklam Kurulu şartı.
6. **Taht süresi yalnızca 1 numara DEĞİŞİNCE sıfırlanır** (`Listing.topSince`,
   tek yazan yer `applyPaidBid`). Kendi teklifini yükselten lider "az önce
   zirveye çıktı" görünmez.
7. **İletişim (ad + e-posta) zorunlu.** Hem İyzico alıcı bilgisi hem bildirim
   buna bağlı; ikisi de olmadan döngü kopuyor. Tahtada görünmez.

## ⏳ Açık işler

### 1. Fiyat bandı yer tutucu
`src/lib/rules.ts` içindeki üç rakam (taban 100 ₺, min artış 25 ₺, zirve farkı
100 ₺) **uydurma**. Taban kullanıcı kararı (2026-08-21); diğer ikisi ona oranla
seçildi. Gerçek değer restoran görüşmelerinden çıkacak. Tek dosya, tek değişiklik.

### 2. Yasal sayfalar var, künye YOK
`/mesafeli-satis`, `/gizlilik`, `/iptal-iade` yazıldı; footer ve ödeme adımından
bağlı. Ödeme adımında kabul edilen kart markaları + 3DS ibaresi `PaymentMarks`
bileşeninde (uzak görsel yok, hepsi inline SVG).

⚠️ **Satıcı künyesi boş** — `src/lib/legal.ts` içindeki `SATICI` yer tutucu.
Tüzel kişilik kurulmadan doldurulamıyor. Mesafeli Satış Sözleşmesi künyesiz
hukuken eksiktir ve sayfa bunu kırmızı bir Taslak uyarısıyla söylüyor.
**İyzico üye işyeri başvurusundan önce doldurulmalı.** Tek dosya, tek değişiklik.

Metinler hukuk danışmanı görmedi — başvuru öncesi mali müşavir/avukat okumalı.

### 3. İyzico yazıldı ama HİÇ ÇALIŞTIRILMADI
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

### 4. Sahiplik doğrulaması YOK — bilinçli karar (2026-08-21)
İlan verirken hesap sahipliği doğrulanmıyor, sürtünmeyi kaldırmak için.
**Açık risk:** biri rakibinin mekânını tahtaya çıkarabilir ya da bir hesabı
işgal edebilir. Tek fren, ilanın paralı olması. Şikâyet gelirse elle indirme
yolu gerekecek — henüz yok.

Bağlantı Instagram profili **ya da** kendi sitesi olabilir; tür adresten
çıkarılıyor (`src/lib/links.ts`), kullanıcıya tür seçtirilmiyor. Aynı adres iki
kez tahtaya çıkamaz (`Listing.url` unique). Instagram bağlantısı mobilde
uygulamayı açar, açamazsa web'e düşer — bu tarayıcının işi, kodda özel bir şey
yok.

### 5. Bildirim yazıldı — anahtar bekliyor
Mail yolu bitti (`src/lib/outbid.ts` + `src/lib/mail.ts`), **hiç gönderilmedi**:
`RESEND_API_KEY` + `MAIL_FROM` tanımlı değil. İkisi dolana kadar gönderim
sessizce atlanıyor, sebep `Outbid.error`'a `POSTA_KAPALI` olarak yazılıyor —
yani kayıp yok, sadece ertelenmiş.

Anahtar geldiğinde ilk iş: iki test ilanı, biri diğerini geçsin, mailin
gerçekten düştüğünü ve düğmenin doğru rakamla açtığını gör.

**WhatsApp otomatik bildirimi YOK ve yakında olmayacak** — WhatsApp Business
API onaylı şablon + BSP hesabı istiyor, tüzel kişilikten sonraki iş. Zafer
ekranındaki WhatsApp düğmesi kullanıcının kendi paylaşımı, bildirim değil.

### 6. Haftalık teslimat kaydı boş
`Delivery` modeli duruyor ama yazan yok. Satışın karşılığı olan story/post'un
kanıtı orada tutulacak.

### 7. Veritabanı Prisma Postgres
SQLite'tan çıkıldı (2026-08-21). Sağlayıcı **Prisma Postgres** (`db.prisma.io`),
Vercel > Storage üzerinden bağlı.

Neon'un aksine **tek bağlantı dizesi** veriyor — ayrı havuzsuz adres yok, bu
yüzden `prisma/schema.prisma` içinde `directUrl` tanımlı değil. Neon/Supabase
gibi havuzlu–havuzsuz ayrımı olan bir sağlayıcıya geçilirse o satır geri eklenir
ve `DATABASE_URL_UNPOOLED` gerekir.

**Değişken adı sabit değil — `src/lib/db-url.ts` tek kaynak.** Vercel'de projede
zaten bir `DATABASE_URL` bulunduğu için entegrasyon kendi değişkenlerine
`DATABASE_URL` prefix'i ekledi ve ortaya `DATABASE_URL_DATABASE_URL`,
`DATABASE_URL_POSTGRES_URL`, `DATABASE_URL_PRISMA_DATABASE_URL` çıktı.

Kod bu tuhaf isme sabitlenmedi: `resolveDbUrl()` bilinen adayları sırayla
deniyor ve ilk geçerli `postgres://` dizesini `PrismaClient`'a **elden**
veriyor (`src/lib/prisma.ts`). Prefix kaldırılsa ya da sağlayıcı değişse kod
değişmiyor. Boş veya postgres olmayan değerler atlanıyor ki projede kalmış
eski bir `DATABASE_URL` doğrusunun önünü tıkamasın.

Şemadaki `env("DATABASE_URL")` yalnızca `prisma db push` gibi **CLI** komutları
için geçerli; onlar lokalde `.env`den okuyor.

Kurulum takılırsa `GET /api/health` hangi aşamada olduğunu söyler:
`DB_YOK` → `BAGLANTI_YOK` → `SEMA_YOK` → `TAMAM`. Ayrıca **hangi değişkenden**
okuduğunu (`dbDegiskeni`) yazar. Değer döndürmez, yalnızca isim + Prisma hata
kodu.

**Lokalde çalıştırmak için** aynı URL'i `.env` içine koy, sonra
`npm run db:push`. Postgres olmadan uygulama açılmaz.

⚠️ **`vercel-build` şemayı uygulamaz.** `Listing.topSince` ve `Outbid` eklendi
(2026-08-22); bunlar veritabanına **elle** `npm run db:push` ile geçirilmeli.
Kod önce deploy edilirse tahta sorgusu eksik kolon yüzünden patlar — önce şema,
sonra deploy.

⚠️ Canlı veritabanında şema var ama **0 ilan**. `npm run db:seed` uydurma
restoran isimleri basar — canlıda çalıştırılıp çalıştırılmayacağı ürün kararı,
kendiliğinden yapılmadı.

## Canlı harita

Anasayfada, Şehir Şampiyonları'nın hemen üstünde. **Tamamen sunucuda çiziliyor:**
her il düz bir `<a>`, ipucu yerel `<title>`, vurgu CSS `:hover`. 81 ile tıklama
dinleyicisi bağlayan bir harita, tahtanın en ucuz olması gereken yerinde en
pahalı şeyi olurdu.

- **Renk = o ilin 1 numarasının teklifi.** Boş il karanlık kalır; karanlık il
  "burası boş" demenin en kısa yolu ve satılan şey o boşluk. Dolu iller
  `color-mix` ile neon'a doğru ısınıyor (%30'dan başlar ki en ucuzu bile görünsün).
- **Yol verisi `src/lib/turkeyMap.ts`** — turkey-map-react v2.0.6'dan (MIT,
  © 2020 Erdi Gökçe) alındı, paket bağımlılık olarak **eklenmedi**: bize yalnız
  path lazımdı. Lisans metni dosyanın başında, kaldırma.
- **Anahtar plaka numarası**, il adı değil: adların yazımı kaynaktan kaynağa
  değişiyor (Afyon/Afyonkarahisar), plaka değişmiyor. Ad ve slug her zaman
  `src/lib/cities.ts`'ten.
- **`HARITA_VIEWBOX` kaynağın varsayılanı değil.** Paketin verdiği
  `80 0 1050 585` üstte 144 birim boşluk bırakıp solu ve güneyi kırpıyordu;
  değer 81 ilin birleşik sınır kutusundan hesaplandı. Yol verisi değişirse
  yeniden hesapla.
- ⚠️ Mobilde iller **tıklamak için küçük**. Bilinçli: harita orada bir tablo,
  seçim işini altındaki Şehir Şampiyonları ızgarası görüyor.

## Notlar

- **Ziyaretçi sayacı yaklaşıktır, bilerek.** Çerez ve oturum yok; anahtar
  IP + tarayıcı bilgisinin geri döndürülemez özeti. Sonuç: aynı kişi telefon
  ve bilgisayardan girerse 2 ziyaretçi, aynı ofis ağından aynı tarayıcıyla
  girenler 1 ziyaretçi sayılır. KVKK metniyle tutarlı olsun diye böyle
  seçildi. Sayım `VisitorProvider` içinde tek yerde; anasayfa ayrıca sunucu
  tarafında da kaydediyor ki ilk boyamada "0 kişi" yanıp sönmesin.
- "Su an burada" = son 5 dakika. Arka plandaki sekme ziyaretçi sayılır ama
  aktif sayılmaz: `lastSeen` yalnızca sekme görünürken ilerliyor.

- Rozet fontu `public/fonts` altından `fs.readFile` ile okunuyor. `fetch(file://)`
  Node runtime'da çalışmıyor; `public/` her zaman deploy'a dahil olduğu için
  en güvenli yol bu.
- Satori aynı aile adı altındaki ikinci dosyaya düşmüyor: latin-ext ayrı aile
  adıyla (`InterExt`) kayıtlı ve `fontFamily: 'Inter, InterExt'` ile zincirleniyor.
  Aksi hâlde `İ` ve `₺` tofu çıkıyor.
- Seed'deki restoran isimlerinin tamamı **uydurma**. Gerçek hesap kullanma.

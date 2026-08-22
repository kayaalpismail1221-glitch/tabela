# Tabela

Türkiye'nin restoran tahtası. Restoranlar Instagram hesaplarıyla ilan verir,
**sıra teklife göre** belirlenir. outbid.lol mekaniği, Türkiye'ye ve gastronomiye
uyarlanmış hâli.

> **İddian varsa yerin üstte.** — Marka mesajı bu, ve aynı zamanda hukuki
> kalkan. Bunu "en iyi restoranlar" diye konumlandırmak hem yalan olur hem
> Reklam Kurulu problemi yaratır. Cümle 2026-08-22'de "İyi olan değil, iddialı
> olan üstte"den daha sıcak bir hâle çevrildi; **koruduğu şey aynı**: sıralama
> iddiaya göre, kaliteye göre değil. Değiştirecek olan bunu bozmasın.
> Üç yerde geçiyor: `SiteHeader`, `layout.tsx` metadata, `rozet/[id]`.

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
| `src/app/page.tsx` | Genel tahta + harita + şerit + canlı çekişme + Şehir Şampiyonları |
| `src/components/PopulerSerit.tsx` | "Şehrin popülerleri" — kesintisiz akan şerit |
| `src/components/Sayfalama.tsx` | Sayfa gez/geri — `?sayfa=N`, 50'de bir |
| `src/components/LogoKirp.tsx` | Logo kırpma modalı — sürükle/yakınlaştır, "Kullan" demeden kaydetmez |
| `src/app/api/site-bilgisi` | Adresten ad/açıklama/logo çeker ("Bilgileri çek") |
| `src/app/[sehir]/` | Şehir tahtası (81 il, `cities.ts` slug'ları) |
| `src/app/ilan/[id]/` | İlan detayı + teklif yükseltme + rozet |
| `src/app/ilan-ver/` | İlan formu |
| `src/app/kurallar/` | Kurallar sayfası |
| `src/app/rozet/[id]/` | **1080×1920 story kartı** (next/og) |
| `src/app/git/[id]/` | Tıklama sayacı + Instagram'a yönlendirme |
| `src/app/api/listings` | İlan oluştur + ilk teklif |
| `src/app/odeme/[jeton]/` | Shopier'e giden ara sayfa (imzalı form POST'u) |
| `src/app/api/shopier/callback` | Ödeme bildirimi — imza + tutar doğrulaması |
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
| `src/lib/shopier.ts` | **Ödeme — tek kaynak** (imza, form, callback doğrulama) |
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

## İlan sayfası — Devral vs Yükselt (2026-08-22 kararı)

Giriş sistemi yok, bu yüzden ilan sayfasının (`/ilan/[id]`) EKRANI iki farklı
ziyaretçiye iki farklı şey söylemek zorunda; ikisini karıştırmak parayı boşa
harcatır.

- **Devral** (herkesin gördüğü, birincil buton): "Kendi ilanını {bedel} ile
  ver — sıra senin olur, bağlantı senin işletmene gider." Bu, `/ilan-ver`'e
  şehir + tutar önceden dolu giden bir yönlendirme — **YENİ bir ilan**
  oluşturur, mevcut ilana dokunmaz. Rakip buraya para verirse KENDİ ilanı
  yükselir, başkasının değil.
- **"Bu ilan benim, teklifimi yükselteceğim"** (kapalı `<details>`, ikincil):
  gerçek sahibi için. Açılınca "Yatırdığın X duruyor, sadece farkı ödersin"
  — yani toplam teklif ARTAR ama hep aynı ilanın/sahibin kalır, kimse
  "kiralık artış" ödemiyor.
- **Sahiplik kapısı** (`api/bids`, giriş olmadığı için tek kanıt): ilanın
  `ownerEmail`'i doluysa, teklifi yükseltmek isteyen AYNI e-postayı yazmak
  zorunda; tutmuyorsa 403 + "Bu ilan sana ait değil" — `BidForm`'da
  `sahiplikGerekli` prop'u bu inputu açıyor. ⚠️ Bilinen delik: e-postası
  olmayan (yarım kalmış) bir ilanı ilk yükselten kişi sahibi olur; yeni
  ilanlar her zaman e-posta ile oluştuğu için delik yalnızca eski kayıtlar
  için açık.

Anasayfadaki/şehir tahtasındaki **"Yükselt" pilli** (`Board.tsx`) her zaman
`/ilan/{id}`'e gider — tıklayan sahip mi değil mi bilmiyoruz, o yüzden
kapıyı sayfa açık, karar orada veriliyor.

## Tahta satırı tıklama davranışı (Gemini 06da420, düzeltme 6c3686f)

Kart/satırın TAMAMI görünmez bir `<a href="/git/{id}" target="_blank">` ile
kaplı — **sıralamada nereye tıklarsan tıkla, "Yükselt" pili DIŞINDA,
işletmenin gerçek sitesine/Instagram'ına gidersin**. `/git/{id}` tıklama
sayacını da artırıyor.

⚠️ **Tuzak, bir kez gerçekten yaşandı:** Gemini'nin ilk hâlinde görünmez link
`z-0`, üstündeki TÜM içerik (isim, açıklama, rozet, avatar) `relative z-10`
idi. Pozisyonlanmış (`position != static`) elemanlar z-index'ten BAĞIMSIZ
olarak normal akıştaki elemanların her zaman üstünde tıklamayı yakalar — yani
görünen her alan linkten önce kendi üstüne alıyordu, yalnızca elemanlar
ARASINDAKI boşluklar gerçekten tıklanabiliyordu. **Kural:** içerik düz akışta
kalsın (`position` verilmesin), yalnız "Yükselt" linki kendi hedefine
(`/ilan/{id}`) gitsin diye `relative z-10` ile bu overlay'in üstüne çıkar.
Yeni bir eleman eklerken bu ikisinden birini bozarsan aynı hata geri gelir —
`document.elementFromPoint()` ile üzerine gelinen her görünür alanda gerçekten
`<a href="/git/...">` döndüğünü doğrula.

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

### 3. Ödeme: SHOPIER — yazıldı, canlı anahtarla denenmedi
**İyzico 2026-08-22'de tamamen kaldırıldı** (kullanıcı kararı). Sebebi ikili:
Culinora'nın üye işyerini paylaşmak, o hesap dondurulursa **Culinora'nın
tahsilatını da durdururdu**; ve Shopier bireysel satıcıya açık, yani tüzel
kişilik beklemeden tahsilata başlanabiliyor — projenin 1 numaralı tıkanıklığı.
İyzico kodu git geçmişinde duruyor, geri lazım olursa oradan.

**Akış:** `placeBid` → Bid PENDING + tek kullanımlık jeton → kullanıcı
`/odeme/[jeton]` sayfasına gider → form Shopier'e POST edilir → Shopier
`/api/shopier/callback`'e POST eder → imza doğrulanır → `applyPaidBid`.

Bilinçli kararlar ve tuzaklar:

- **Anahtar: API Key + API Secret.** Shopier'in *kişisel erişim anahtarı*
  (PAT) ödeme başlatmıyor — o mağaza verisi (ürün/sipariş/koleksiyon) için.
  Karıştırılması kolay, bir kez karıştırıldı.
- ⚠️ **Callback adresi istekle GÖNDERİLMİYOR**, Shopier panelinden tanımlanmak
  zorunda: `https://tabela.lol/api/shopier/callback`. Tanımlı değilse ödeme
  alınır ama **teklif uygulanmaz** — para alınıp hiçbir şey verilmez. Canlıya
  almadan önce doğrulanacak ilk madde bu.
- **Ödeme sayfasının adresi teklif kimliği DEĞİL, tek kullanımlık jeton.**
  Teklif kimlikleri ilan sayfasının kaynağından okunabiliyor ve o form ilan
  sahibinin adını/e-postasını taşıyor; kimlikle açılsaydı iletişim bilgisi
  sızardı. Jeton ödeme sonrası siliniyor.
- **İyzico'daki "sunucudan geri sorma" adımı YOK.** Güvence tamamen imzada
  (HMAC-SHA256, `random_nr + platform_order_id + total_order_value + currency`).
  Bu yüzden callback üç kapıdan geçiriyor: imza geçerli mi, durum başarılı mı,
  tutar beklediğimiz mi. Üçü de geçmeden hiçbir teklif uygulanmıyor.
- İmza **gelen değerler üzerinden** yeniden hesaplanıyor (biçim farkı
  doğrulamayı kırmasın); tutarın doğruluğu ayrı bir sayısal karşılaştırmayla.
- Kart bilgisi hiçbir aşamada sunucumuza dokunmuyor → PCI SAQ-A.
- ⚠️ Adres toplamıyoruz; Shopier'e sabit posta kodu gidiyor. İyzico'daki
  uydurma TCKN'nin eşdeğeri, fraud skorlamasını etkileyebilir.

**Canlı anahtarla tek bir kez bile çalıştırılmadı.** Anahtarlar geldiğinde ilk
iş: panelde callback adresini tanımla, sonra küçük tutarlı gerçek bir ödeme.

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

## Anasayfa sırası (2026-08-22, son güncelleme: sayfalama)

1. Giriş — **fiyat yok**. Eskiden "1 numarayı 450 ₺'ye al" diye bir sayaç
   vardı; kaldırıldı. Ziyaretçinin ilk gördüğü şey etiket fiyatı olunca tahta
   ürün rafına dönüyordu. Yerini tahtın **durumu** aldı (kimde, ne kadardır).
2. **Canlı harita** — sayfanın EN ÜSTÜ (hero'nun hemen altı). Toplanan para
   haritanın köşesinde. Önceden "popüler 3"ün altındaydı; kullanıcı kararıyla
   en başa alındı — tahtanın durumu her şeyden önce görülsün diye.
3. **"Türkiye Top"** — haritanın hemen altı, TEK bölüm (eskiden "popüler 3" +
   ayrı "kalan liste" olarak haritanın iki yanına bölünmüştü, artık değil).
   İlk 10 büyük kart (`BUYUK_SAYISI`, `Board.tsx`), sonrası küçük satır,
   **50'de bir sayfa** (`SAYFA_BOYU`, `page.tsx`). Yanında canlı çekişme sabit
   durur (`lg:sticky`).
4. **Şehrin popülerleri** — akan şerit.
5. Şehir Şampiyonları.

⚠️ **Ekran metninde "taht" kelimesi YOK** (2026-08-22 kullanıcı kararı):
memleket.lol'ün dili, çalıntı duruyor ve biz işletme odaklıyız. Karşılığı
**"1 numara"**. Sayaç dili **"10 il dolu, 71 il boş"**.

`tahta` (liste) kendi metaforumuz, ilk günden beri var, kalıyor — "tahtaya çık",
"Türkiye tahtası" sorun değil. Yasak olan `taht` (koltuk). Kod içindeki
`topSince`, `tahtSozu`, `tahtDegisimi` gibi **isimler bilerek değişmedi**:
kullanıcı görmüyor, değiştirmek saf gürültü olurdu.

## Sayfalama (2026-08-22)

`getBoard(citySlug?, take, skip)` — `skip` eklendi, `rank` ona göre kayıyor
(2. sayfada ilk satır 51. olur, 1 değil). `getBoardToplam(citySlug?)` toplam
ilan sayısını dönüyor, sayfa sayısını hesaplamak için.

⚠️ **`Board`'daki büyük-kart/küçük-satır ayrımı SADECE sayfa GERÇEKTEN
1'den başlıyorsa çalışır** (`rows[0]?.rank === 1`). 2. sayfada (rank 51-100)
hiçbir satır büyük kart OLMAZ — aksi hâlde 51. sıradaki ilan görsel olarak
"ilk 10"muş gibi yanlış bir üstünlük iddia ederdi. `ayracEtiketi` de yalnız
tam 10 büyük kart dolduğunda görünür.

`Sayfalama.tsx`: `?sayfa=N` query param, N=1 için parametre hiç yazılmıyor
(anasayfa adresi `/`de sabit kalsın, paylaşılan link bozulmasın). Anasayfada
kullanılıyor (`taban="/"`); şehir sayfası (`/[sehir]`) henüz sayfalanmıyor —
bir ilin 50'den fazla ilanı olması pratikte uzak bir ihtimal, gerekirse aynı
bileşen `taban="/{slug}"` ile oraya da eklenir.

⚠️ **Giriş fiyatı ekranlarda yazmıyor artık.** Ne kahramanda, ne şehir
şampiyonları kutusunda ("Burası boş — sen tut"), ne harita etiketinde. Fiyat
yalnızca ilan formunda — ait olduğu yer orası. Geri koyacak olan bunun bir
tercih olduğunu bilsin.

Sayfanın dibindeki dev "0 ₺ topladı — 28 saat önce açıldı" bloğu (`TotalRaised`)
**silindi**: boş tahtada dev bir 0 yazmak tahtanın bütün iddiasını çökertiyordu.
Toplam artık haritanın köşesinde, ölçüsünde. `stats.ts`'teki `LANSMAN`/`yasSozu`
o blokla birlikte gitti.

## Şehrin popülerleri (akan şerit)

Şehir Şampiyonları ızgarasından farkı **hareket**: duran liste "burası dolu"
der, akan şerit "burası çalışıyor" der. Saf CSS — şerit iki kez basılıp yarısı
kadar kaydırılıyor, baş ve son dikişsiz kapanıyor. Az şampiyon varsa liste
tekrarlanarak 12 öğeye tamamlanıyor, yoksa şerit ekranı doldurmuyor.
`prefers-reduced-motion` açıksa animasyon durur, şerit elle kaydırılır.

## İlan formu — "Bilgileri çek"

Kurucu fikir: **formu kullanıcı doldurmasın.** Adres yapıştırılınca
`/api/site-bilgisi` ad, açıklama ve logoyu çekiyor; kullanıcıya düzeltmek
kalıyor. Sürtünme, tahtayı boş bırakan tek şey.

- Çekilen değerler kullanıcının yazdığını **ezmez**, yalnızca boş alanı doldurur.
- **Galeriden seçilen fotoğraf otomatik kırpılmıyor — `LogoKirp.tsx`
  (2026-08-22).** Önceden merkezden kare kırpıyordu; logo fotoğrafın
  ortasında değilse yanlış parça kesiliyordu ve düzeltecek yol yoktu
  ("millet tam seçemiyor" — kullanıcı geri bildirimi). Şimdi dosya seçilince
  bir modal açılıyor: kullanıcı sürükleyip (Pointer Events — fare ve
  dokunmatik aynı kod) gerekirse yakınlaştırıp kareyi kendi seçiyor,
  "Kullan" demeden hiçbir şey kaydedilmiyor. `gorselKucult.ts` üçe bölündü:
  `gorselYukle` (dosya → Image), `kareyeSikistir` (seçilen kare → sıkıştırılmış
  data URI, eski mantık), `gorselKucult` (ikisinin otomatik-ortala sarmalayıcısı
  — artık yalnızca yedek yol). Tarayıcıda hem masaüstü hem mobil boyutta,
  gerçek bir sürükleme ile doğrulandı.
- Amblem sırası: elle verilen **logo adresi** > formda çekilmiş amblem >
  sitenin kendi logosu. Elle verilen adres de indirilip data URI'ye çevrilir —
  uzak adres saklanırsa karşı taraf hotlink engellediğinde amblem kırılır.
- İstemciden gelen data URI doğrulanır (bilinen görsel türleri, ≤80 KB).
  **SVG bilerek dışarıda**: belge formatı, script taşıyabiliyor.
- ⚠️ **SSRF freni** `src/lib/logo.ts`'te (`guvenliHost`): kullanıcının verdiği
  adrese sunucudan istek atıyoruz, `localhost` ve özel IP aralıkları reddedilir.
  DNS çözümlemesi yapılmıyor — kazayla iç ağa çıkmayı keser, kararlı saldırganı
  değil.
- **Amblem boyut limiti TEK YERDE:** `src/lib/amblem.ts` (`AMBLEM_EN_BUYUK`,
  80 KB). Hem istemci (`gorselKucult.ts`, galeri fotoğrafını küçültme hedefi)
  hem sunucu (`api/listings`, doğrulama) buradan okuyor — ikisi ayrı sayı
  tutuyordu, biri küçültüp diğeri reddetmeye devam edebilirdi (henüz
  gerçekleşmedi ama kırılgandı, birleştirildi). `gorselKucult` kaliteyi
  kademeli düşürüyor (0.82 → 0.2) sonuç sınıra sığana kadar — gerçek
  fotoğraflar (özellikle yemek fotoğrafı, dokulu) webp'de büyük çıkabiliyor
  diye. Sentetik gürültü testinde bile 144px'te en kötü ihtimal ~15 KB
  çıktı, yani pratikte limit aşılmıyor; yine de tek kaynağa toplandı.
- Buton: **"Şehrinin en popüleri ol · {tutar}"**. Altında "Tek seferlik ödeme,
  abonelik değil" — sistem tekil, abonelik yok ve öyle kalacak.

## Canlı harita

Anasayfada, Şehir Şampiyonları'nın hemen üstünde. **Tamamen sunucuda çiziliyor:**
her il düz bir `<a>`, ipucu yerel `<title>`, vurgu CSS `:hover`. 81 ile tıklama
dinleyicisi bağlayan bir harita, tahtanın en ucuz olması gereken yerinde en
pahalı şeyi olurdu.

- **Renk = o ilin 1 numarasının teklifi.** Boş il karanlık kalır; karanlık il
  "burası boş" demenin en kısa yolu ve satılan şey o boşluk. Dolu iller
  `color-mix` ile neon'a doğru ısınıyor (%30'dan başlar ki en ucuzu bile görünsün).
- **İKİ KATMAN, sebebi önemli.** SVG'de `z-index` yok, boyama sırası belge
  sırası. Amblem ve il adı illerle aynı katmanda olsaydı plakası küçük bir ilin
  rozeti, kendisinden sonra çizilen komşusunun altında kalırdı. Önce bütün
  iller, sonra bütün rozetler çizilir; rozet katmanı tıklamayı geçirmez.
- **İl adı `:hover`'da çıkar** — ad başka katmanda durduğu için CSS'in iki öğeyi
  eşleştirmesi gerekiyor, bunun tek yolu il başına bir `:has()` kuralı. Kurallar
  bileşende üretiliyor (~5 KB), yolları ikinci kez yazmaktan (113 KB) ucuz.
- **Amblem** ilin 1 numarasının logosu; `Listing.imageUrl` bir data URI olduğu
  için SVG `<image>`'a doğrudan giriyor, uzak istek yok. Instagram ilanlarının
  logosu olmadığından çoğunda harf kalır.
- **Kenardaki illerin adı ortalanmaz** (Çanakkale, Hakkari): ortalanınca çizim
  alanından taşıp kırpılıyordu, kenara yakınsa ilden içeri doğru yazılıyor.
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

- **Instagram profil fotoğrafı çekilemiyor — denendi, teknik bir çıkmaz,
  tekrar denemeyin (2026-08-22).** Instagram'ın normal tarayıcıya gösterdiği
  HTML bir giriş duvarı; ama Google'ın crawler'ına (`User-Agent: Googlebot`)
  SEO amaçlı farklı bir HTML veriyor ve o HTML'de `og:image` olarak gerçek
  profil fotoğrafının CDN adresi var. **Buraya kadar çalışıyor.** Ama o CDN
  adresi ayrı bir imzalı-URL korumasıyla kilitli: aynı adresi (aynı
  User-Agent, aynı cookie, `Referer` ile bile) başka bir yerden indirmeye
  çalışınca Instagram `403 Bad URL timestamp` döndürüyor — imza muhtemelen
  Google'ın gerçek IP aralığına bağlı, bizim sunucumuzdan asla geçmiyor.
  Yani User-Agent sahteciliği HTML'i açıyor ama görüntüyü hiç açmıyor;
  kodlamaya değecek bir şey yok, sonuç her zaman 403. Instagram ilanları
  harf amblemiyle kalıyor; kullanıcı isterse formdan galeriden kendi
  fotoğrafını yükler.
- Rozet fontu `public/fonts` altından `fs.readFile` ile okunuyor. `fetch(file://)`
  Node runtime'da çalışmıyor; `public/` her zaman deploy'a dahil olduğu için
  en güvenli yol bu.
- Satori aynı aile adı altındaki ikinci dosyaya düşmüyor: latin-ext ayrı aile
  adıyla (`InterExt`) kayıtlı ve `fontFamily: 'Inter, InterExt'` ile zincirleniyor.
  Aksi hâlde `İ` ve `₺` tofu çıkıyor.
- Seed'deki restoran isimlerinin tamamı **uydurma**. Gerçek hesap kullanma.

import Link from 'next/link'
import { LegalPage, Madde } from '@/components/LegalPage'
import { SATICI, SATICI_EKSIK } from '@/lib/legal'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF, MIN_ARTIS, ZIRVE_FARKI } from '@/lib/rules'

export const metadata = { title: 'Mesafeli Satış Sözleşmesi — Tabela' }

/** Kunye alani: sirket kurulunca src/lib/legal.ts doldurulacak. */
function Kunye() {
  const satirlar: [string, string][] = [
    ['Unvan', SATICI.unvan],
    ['Adres', SATICI.adres],
    ['Vergi dairesi', SATICI.vergiDairesi],
    ['Vergi numarası', SATICI.vergiNo],
    ['Telefon', SATICI.telefon],
    ['E-posta', SATICI.eposta],
  ]

  return (
    <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-1.5">
      {satirlar.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className={v ? 'text-text' : 'text-hot'}>{v || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function MesafeliSatisPage() {
  return (
    <LegalPage
      title="Mesafeli Satış Sözleşmesi"
      intro="Bu sözleşme, Tabela üzerinden verilen ilan ve teklif hizmetinin koşullarını düzenler. Tahtaya çıkarak bu koşulları kabul etmiş olursunuz."
      kunyeUyarisi
    >
      <Madde no={1} baslik="Taraflar">
        <p>
          <strong className="text-text">Satıcı (Hizmet Sağlayıcı):</strong>
        </p>
        <Kunye />
        {SATICI_EKSIK && (
          <p className="text-hot">
            Satıcı bilgileri tüzel kişilik kuruluşunun tamamlanmasının ardından doldurulacaktır.
          </p>
        )}
        <p>
          <strong className="text-text">Alıcı:</strong> İlan formunda bildirdiği ad, e-posta ve
          telefon bilgileriyle hizmeti satın alan gerçek veya tüzel kişi.
        </p>
      </Madde>

      <Madde no={2} baslik="Sözleşmenin konusu">
        <p>
          Sözleşmenin konusu, Alıcı’nın Tabela üzerinde bir <strong className="text-text">ilan
          yayınlaması</strong> ve verdiği teklif tutarına göre listede{' '}
          <strong className="text-text">sıralanmasıdır</strong>.
        </p>
        <p>
          Hizmet bir <strong className="text-text">reklam / sponsorlu sıralama</strong>{' '}
          hizmetidir. Listedeki sıra yalnızca ödenen tutara göre belirlenir; lezzet, kalite,
          hijyen veya herhangi bir başka değerlendirmeyi ifade etmez, böyle bir iddia
          içermez.
        </p>
      </Madde>

      <Madde no={3} baslik="Hizmetin niteliği ve süresi">
        <p>
          Hizmet <strong className="text-text">elektronik ortamda anında ifa edilen dijital bir
          hizmettir</strong>. Ödeme tamamlandığı anda ilan yayına girer ve teklif tutarının hak
          ettiği sıraya yerleşir.
        </p>
        <p>
          İlanın sırası <strong className="text-text">süreye bağlı değildir</strong>. Başka bir
          kullanıcı daha yüksek teklif verene kadar sıra korunur. Daha yüksek teklif verildiğinde
          ilan alt sıraya geçer; ilan yayından kalkmaz.
        </p>
      </Madde>

      <Madde no={4} baslik="Bedel ve ödeme">
        <p>
          Listeye giriş için taban teklif <strong className="text-text">{tl(TABAN_TEKLIF)}</strong>
          ’dir. En küçük artış {tl(MIN_ARTIS)}, listenin birinci sırasını almak için gereken fark
          ise {tl(ZIRVE_FARKI)}’dir. Güncel tutarlar{' '}
          <Link href="/kurallar" className="text-neon hover:underline">
            Kurallar
          </Link>{' '}
          sayfasında yayımlanır.
        </p>
        <p>
          Alıcı kendi ilanının teklifini yükseltirken tutarın tamamını değil,{' '}
          <strong className="text-text">yalnızca aradaki farkı</strong> öder. Daha önce ödenen
          tutar geçerliliğini korur.
        </p>
        <p>
          Tüm tutarlara KDV dâhildir. Ödeme, üye işyeri altyapısı üzerinden kredi/banka kartı ile
          alınır. <strong className="text-text">Kart bilgileri Satıcı’nın sunucularında
          tutulmaz</strong>; ödeme, ödeme kuruluşunun kendi güvenli sayfasında ve 3D Secure ile
          gerçekleştirilir.
        </p>
      </Madde>

      <Madde no={5} baslik="İfa ve teslim">
        <p>
          Ödeme onaylandığı anda hizmet ifa edilmiş sayılır. İlan; genel listede, ilan sahibinin
          seçtiği şehrin listesinde ve — sıralaması yeterliyse — anasayfadaki Şehir Şampiyonları
          bölümünde görüntülenir.
        </p>
        <p>
          Ödeme sırasında başka bir kullanıcı öne geçmiş olsa dahi tahsil edilen teklif her hâlükârda
          uygulanır; Alıcı, tutarının hak ettiği sıraya yerleşir.
        </p>
      </Madde>

      <Madde no={6} baslik="Cayma hakkı">
        <p>
          Hizmet, elektronik ortamda anında ifa edilen bir dijital hizmet olduğundan{' '}
          <strong className="text-text">cayma hakkı istisnası</strong> kapsamındadır (Mesafeli
          Sözleşmeler Yönetmeliği m. 15). Alıcı, ödeme adımında ifanın derhâl başlamasını ve bu
          nedenle cayma hakkının bulunmadığını kabul eder.
        </p>
        <p>
          Ayrıntılar için{' '}
          <Link href="/iptal-iade" className="text-neon hover:underline">
            İptal ve İade Koşulları
          </Link>
          .
        </p>
      </Madde>

      <Madde no={7} baslik="Alıcı’nın yükümlülükleri">
        <p>
          Alıcı, ilanda kullandığı bağlantının (Instagram hesabı veya internet sitesi) kendisine
          ait olduğunu veya yayın için yetkili olduğunu beyan eder. Aksi durumda doğacak
          taleplerden Alıcı sorumludur.
        </p>
        <p>
          Yanıltıcı, hakaret içeren, üçüncü kişilerin haklarını ihlal eden veya mevzuata aykırı
          içerikler yayınlanamaz. Satıcı, bu nitelikteki ilanları yayından kaldırma hakkını saklı
          tutar.
        </p>
      </Madde>

      <Madde no={8} baslik="Satıcı’nın yükümlülükleri ve sınırları">
        <p>
          Satıcı, hizmeti sunmak ve sıralamayı ilan edilen kurala göre işletmekle yükümlüdür.
          Sıralama kuralı tüm ilanlar için aynıdır ve gizli bir öncelik uygulanmaz.
        </p>
        <p>
          Satıcı; ilanın tıklanma sayısı, takipçi kazandırması veya herhangi bir ticari sonuç
          doğurması konusunda taahhütte bulunmaz. Teknik arıza, bakım veya mücbir sebep hâllerinde
          hizmete geçici erişim kesintileri yaşanabilir.
        </p>
      </Madde>

      <Madde no={9} baslik="Kişisel verilerin korunması">
        <p>
          Kişisel verilerin işlenmesine ilişkin esaslar{' '}
          <Link href="/gizlilik" className="text-neon hover:underline">
            KVKK Aydınlatma Metni ve Gizlilik Politikası
          </Link>
          ’nda düzenlenmiştir.
        </p>
      </Madde>

      <Madde no={10} baslik="Uyuşmazlıkların çözümü">
        <p>
          Bu sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır. Tüketici
          sıfatını haiz Alıcılar için Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri; diğer
          hâllerde Satıcı’nın yerleşim yerindeki mahkeme ve icra daireleri yetkilidir.
        </p>
      </Madde>
    </LegalPage>
  )
}

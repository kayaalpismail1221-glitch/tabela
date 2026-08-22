import Link from 'next/link'
import { LegalPage, Madde } from '@/components/LegalPage'
import { SATICI } from '@/lib/legal'

export const metadata = { title: 'KVKK Aydınlatma Metni ve Gizlilik Politikası — Tabela' }

export default function GizlilikPage() {
  return (
    <LegalPage
      title="Gizlilik ve KVKK"
      intro="6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, Tabela’yı kullanırken hangi verilerinizin işlendiğini, neden işlendiğini ve haklarınızı açıklar."
    >
      <Madde no={1} baslik="Veri sorumlusu">
        <p>
          Veri sorumlusu, Tabela’yı işleten hizmet sağlayıcıdır. Künye bilgileri{' '}
          <Link href="/mesafeli-satis" className="text-neon hover:underline">
            Mesafeli Satış Sözleşmesi
          </Link>{' '}
          içinde yer alır. Başvurularınızı{' '}
          <a href={`mailto:${SATICI.eposta}`} className="text-neon hover:underline">
            {SATICI.eposta}
          </a>{' '}
          adresine iletebilirsiniz.
        </p>
      </Madde>

      <Madde no={2} baslik="İşlenen kişisel veriler">
        <p>
          <strong className="text-text">İlan verirken:</strong> ad soyad, e-posta adresi, telefon
          numarası (isteğe bağlı), işletme adı, şehir ve ilçe bilgisi, ilan bağlantısı.
        </p>
        <p>
          <strong className="text-text">Ödeme sırasında:</strong> ödeme kuruluşuna iletilen ad,
          e-posta, telefon, şehir ve IP adresi ile işlem tutarı.{' '}
          <strong className="text-text">Kart numarası, son kullanma tarihi ve CVC bilgileri
          tarafımızca görülmez, kaydedilmez ve saklanmaz</strong>; bu veriler yalnızca ödeme
          kuruluşunun kendi altyapısında işlenir.
        </p>
        <p>
          <strong className="text-text">Site kullanımında:</strong> ilan bağlantılarına yapılan
          tıklamalarda, tekil ziyaretçi sayımı amacıyla IP adresi ve tarayıcı bilgisinden türetilen
          geri döndürülemez bir özet (hash) tutulur. Ham IP adresi kaydedilmez.
        </p>
      </Madde>

      <Madde no={3} baslik="İşleme amaçları ve hukuki sebep">
        <p>
          Veriler; ilanın yayınlanması, ödemenin alınması ve doğrulanması, faturalandırma, teklifin
          geçildiğine dair bilgilendirme yapılması, kötüye kullanım ve dolandırıcılığın önlenmesi
          amaçlarıyla işlenir.
        </p>
        <p>
          Hukuki sebep: KVKK m. 5/2-c (sözleşmenin kurulması ve ifası için gerekli olması),
          m. 5/2-ç (hukuki yükümlülüğün yerine getirilmesi) ve m. 5/2-f (meşru menfaat).
        </p>
      </Madde>

      <Madde no={4} baslik="Aktarım">
        <p>Veriler yalnızca hizmetin sunulması için zorunlu olan taraflarla paylaşılır:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Ödeme kuruluşu — ödemenin alınması ve doğrulanması amacıyla</li>
          <li>Barındırma (hosting) ve veritabanı sağlayıcıları — verinin saklanması amacıyla</li>
          <li>
            E-posta gönderim hizmeti sağlayıcısı — teklifinizin geçildiğine dair bilgilendirme
            iletisinin gönderilmesi amacıyla
          </li>
          <li>Yetkili kamu kurum ve kuruluşları — mevzuat gereği talep edilmesi hâlinde</li>
        </ul>
        <p>
          Barındırma ve veritabanı altyapısı yurt dışında bulunabilir; bu durumda aktarım, KVKK
          m. 9 kapsamında ve hizmetin ifası için gerekli ölçüde yapılır.
        </p>
        <p>Kişisel veriler pazarlama amacıyla üçüncü kişilere satılmaz veya kiralanmaz.</p>
      </Madde>

      <Madde no={5} baslik="Yayında görünen bilgiler">
        <p>
          İlanınızda yayımlanan işletme adı, şehir/ilçe, açıklama, bağlantı ve teklif tutarı{' '}
          <strong className="text-text">herkese açıktır</strong>. Ad soyad, e-posta ve telefon
          bilgileriniz tahtada görünmez; yalnızca fatura ve bildirim amacıyla kullanılır.
        </p>
      </Madde>

      <Madde no={6} baslik="Saklama süresi">
        <p>
          İlan ve teklif kayıtları, hizmetin doğası gereği ilan yayında kaldığı sürece saklanır.
          Ödeme ve fatura kayıtları, vergi mevzuatı uyarınca on yıl boyunca muhafaza edilir. Süre
          dolduğunda veriler silinir veya anonim hâle getirilir.
        </p>
      </Madde>

      <Madde no={7} baslik="Çerezler">
        <p>
          Tabela, çalışması için zorunlu olan teknik çerezler dışında çerez kullanmaz. Reklam veya
          profilleme amaçlı üçüncü taraf takip çerezi yerleştirilmez.
        </p>
      </Madde>

      <Madde no={8} baslik="Haklarınız">
        <p>KVKK m. 11 uyarınca şunları talep edebilirsiniz:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Kişisel verinizin işlenip işlenmediğini öğrenme ve buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>Şartları oluştuğunda silinmesini veya yok edilmesini isteme</li>
          <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
        </ul>
        <p>
          Talepleriniz, tarafımıza ulaşmasından itibaren en geç otuz gün içinde sonuçlandırılır.
        </p>
      </Madde>

      <Madde no={9} baslik="Güvenlik">
        <p>
          Veriler şifreli bağlantı (HTTPS) üzerinden iletilir. Ödeme akışında kart bilgileri hiçbir
          aşamada sistemlerimize girmez; ödeme, ödeme kuruluşunun kendi sayfasında 3D Secure ile
          tamamlanır.
        </p>
      </Madde>

      <Madde no={10} baslik="Değişiklikler">
        <p>
          Bu metin güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır ve yürürlük tarihi
          sayfanın başında belirtilir.
        </p>
      </Madde>
    </LegalPage>
  )
}

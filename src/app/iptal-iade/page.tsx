import Link from 'next/link'
import { LegalPage, Madde } from '@/components/LegalPage'
import { SATICI } from '@/lib/legal'

export const metadata = { title: 'İptal ve İade Koşulları — Tabela' }

export default function IptalIadePage() {
  return (
    <LegalPage
      title="İptal ve İade Koşulları"
      intro="Kısaca: ödenen teklif iade edilmez. Aşağıda bunun neden böyle olduğu ve hangi durumlarda istisna uygulandığı açıklanmıştır."
    >
      <Madde no={1} baslik="Ödenen teklif iade edilmez">
        <p>
          Teklif, ödendiği anda ifa edilen bir <strong className="text-text">reklam/görünürlük
          hizmetinin</strong> bedelidir. İlan ödeme sonrası derhâl yayına girer ve teklif tutarının
          hak ettiği sıraya yerleşir.
        </p>
        <p>
          Bu nedenle ödeme tamamlandıktan sonra{' '}
          <strong className="text-text">iptal veya iade yapılamaz</strong>.
        </p>
      </Madde>

      <Madde no={2} baslik="Cayma hakkı istisnası">
        <p>
          Hizmet, elektronik ortamda anında ifa edilen bir dijital hizmettir. Mesafeli Sözleşmeler
          Yönetmeliği m. 15 uyarınca bu tür hizmetlerde cayma hakkı bulunmamaktadır. Alıcı, ödeme
          adımında ifanın derhâl başlamasını onaylayarak bunu kabul eder.
        </p>
      </Madde>

      <Madde no={3} baslik="Üste çıkılması iade sebebi değildir">
        <p>
          Başka bir kullanıcının daha yüksek teklif vermesi ve ilanınızın alt sıraya geçmesi,
          hizmetin kusurlu ifası sayılmaz — sistemin ilan edilen işleyişinin kendisidir.
        </p>
        <p>
          Bu durumda ödediğiniz tutar{' '}
          <strong className="text-text">yanmaz ve geçerliliğini korur</strong>. Liderliği geri almak
          isterseniz tutarın tamamını değil, yalnızca aradaki farkı ödersiniz.
        </p>
      </Madde>

      <Madde no={4} baslik="Ödeme sırasında sıranın değişmesi">
        <p>
          Siz ödeme yaparken başka bir kullanıcı öne geçmiş olabilir. Bu durumda ödemeniz{' '}
          <strong className="text-text">her hâlükârda uygulanır</strong> ve tutarınızın hak ettiği
          sıraya yerleşirsiniz. Para alınıp hizmetin verilmemesi söz konusu değildir.
        </p>
      </Madde>

      <Madde no={5} baslik="İade yapılan durumlar">
        <p>Aşağıdaki hâllerde ödenen tutar tam olarak iade edilir:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Kart hesabınızdan tahsilat yapıldığı hâlde teknik bir arıza nedeniyle ilanın yayına
            girmemesi
          </li>
          <li>Aynı işlem için mükerrer (çift) tahsilat yapılması</li>
          <li>
            İlanın, Satıcı’nın kararıyla yayından kaldırılması — Alıcı’nın kural ihlali dışındaki
            sebeplerle
          </li>
        </ul>
        <p>
          İade, ödemenin yapıldığı karta ve aynı tutarda gerçekleştirilir. Bankaya bağlı olarak
          hesabınıza yansıması genellikle 2–14 iş günü sürer.
        </p>
      </Madde>

      <Madde no={6} baslik="Kural ihlali hâlinde">
        <p>
          Başkasına ait bir hesabın veya sitenin ilan edilmesi, yanıltıcı içerik, üçüncü kişilerin
          haklarının ihlali ya da mevzuata aykırılık hâlinde ilan yayından kaldırılır. Bu durumda{' '}
          <strong className="text-text">iade yapılmaz</strong>.
        </p>
      </Madde>

      <Madde no={7} baslik="Başvuru">
        <p>
          İade talebinizi{' '}
          <a href={`mailto:${SATICI.eposta}`} className="text-neon hover:underline">
            {SATICI.eposta}
          </a>{' '}
          adresine, ilan bağlantısı ve ödeme tarihiyle birlikte iletin. Talepler en geç on dört gün
          içinde sonuçlandırılır.
        </p>
        <p>
          Sözleşmenin tamamı için{' '}
          <Link href="/mesafeli-satis" className="text-neon hover:underline">
            Mesafeli Satış Sözleşmesi
          </Link>
          .
        </p>
      </Madde>
    </LegalPage>
  )
}

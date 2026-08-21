// Gelistirme verisi. Tahtanin dolu gorunmesi tasarimi dogru degerlendirmek icin sart.
// NOT: Tum isimler UYDURMA. Gercek restoran hesabi kullanilmiyor.
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// handle bir Instagram kullanici adi ya da dogrudan bir site adresi olabilir.
const L = (name, handle, city, district, description, bid) => ({
  name,
  url: handle.includes('.') ? `https://${handle}` : `https://instagram.com/${handle}`,
  label: handle.includes('.') ? handle : '@' + handle,
  city,
  district,
  description,
  bid: bid * 100,
})

const data = [
  // Istanbul — zirve kavgasi burada
  L('Ocakbasi Vefa', 'ocakbasivefa', 'istanbul', 'Beyoglu', 'Mese komuru, tek tip et, tek tip inat.', 48500),
  L('Karakoy Kokorec', 'karakoykokorec', 'istanbul', 'Karakoy', 'Gece 3te kuyruk varsa dogru yerdesin.', 41000),
  L('Balikci Nazmi', 'balikcinazmi', 'istanbul', 'Sariyer', 'Bogaz manzarasi bahane, lufer sahane.', 33500),
  L('Mangal Sofrasi', 'mangalsofrasi34', 'istanbul', 'Kadikoy', 'Adana acili, salgam soguk, tartisma yok.', 27000),
  L('Kahvalti Ustu', 'kahvaltiustu34', 'istanbul', 'Besiktas', 'Kahvalti 7de baslar, 12de biter.', 19500),
  L('Pideci Halim', 'pidecihalim', 'istanbul', 'Fatih', 'Kapali pide, acik hesap.', 14000),
  L('Nohutlu Emmi', 'nohutluemmi', 'istanbul', 'Uskudar', 'Pilav ustu. Nokta.', 9500),
  L('Ucuncu Dalga', 'ucuncudalga.com', 'istanbul', 'Cihangir', 'Filtre kahve ve biraz fazla ciddiyet.', 6500),

  // Ankara
  L('Ankara Doner Evi', 'ankaradonerevi', 'ankara', 'Cankaya', 'Et doner, ekmek arasi, sira bekle.', 22000),
  L('Beypazari Kuru', 'beypazarikuru', 'ankara', 'Kizilay', 'Kuru fasulye krali oldugunu iddia ediyoruz.', 12500),
  L('Tandir Baskent', 'tandirbaskent', 'ankara', 'Keciooren', 'Firindan cikar cikmaz servis.', 5500),

  // Izmir
  L('Boyoz Kardesler', 'boyozkardesler', 'izmir', 'Konak', 'Sabah 6, boyoz sicak, deniz karsida.', 18000),
  L('Kumru Efsanesi', 'kumruefsanesi', 'izmir', 'Cesme', 'Kumru ve limonata, baska bir sey yok.', 11000),
  L('Alsancak Meyhane', 'alsancakmeyhane', 'izmir', 'Alsancak', 'Raki balik, ustune muhabbet.', 7000),

  // Guney
  L('Antep Lahmacun', 'anteplahmacunn', 'gaziantep', 'Sahinbey', 'Ince hamur. Tartismayi kabul etmiyoruz.', 24000),
  L('Katmerci Usta', 'katmerciusta27', 'gaziantep', null, 'Sabah katmeri, kaymagi bol.', 9000),
  L('Adana Kebapcisi', 'adanakebapcisi01', 'adana', 'Seyhan', 'Acili. Acisiz isteme.', 21000),
  L('Salgamci Ali', 'salgamcialii', 'adana', null, 'Salgamin acisini biz ayarlariz.', 4500),
  L('Urfa Cig Kofte', 'urfacigkoftee', 'sanliurfa', null, 'Etsiz ama iddiali.', 6000),
  L('Antakya Kunefe', 'antakyakunefe', 'hatay', null, 'Peynir uzamiyorsa kunefe degildir.', 8500),
  L('Maras Dondurma', 'marasdondurmaci', 'kahramanmaras', null, 'Kesip yiyorsun, kasikla degil.', 5000),
  L('Mersin Tantuni', 'mersintantunii', 'mersin', null, 'Durum ince, ic bol.', 4000),

  // Karadeniz
  L('Karadeniz Pide', 'karadenizpidee', 'trabzon', null, 'Kasarli, yumurtali, tereyagli.', 13000),
  L('Hamsikoy Sutlac', 'hamsikoysutlac', 'trabzon', null, 'Firin sutlac, ustu yanik.', 3500),
  L('Cay Bahcesi Rize', 'caybahcesirize', 'rize', null, 'Manzara bedava, cay degil.', 2500),
  L('Ordu Balik', 'ordubalikevi', 'ordu', null, 'Hamsi mevsimi basladi.', 2000),
  L('Samsun Pide', 'samsunpidee', 'samsun', null, 'Sira beklemeye deger.', 3000),

  // Ic Anadolu
  L('Konya Etli Ekmek', 'konyaetliekmek.com', 'konya', null, 'Bir metre. Tek kisilik degil.', 10500),
  L('Kayseri Manti', 'kayserimanti38', 'kayseri', null, 'Kasiga kirk tane.', 8000),
  L('Sivas Kofte', 'sivaskoftecisi', 'sivas', null, 'Kiymadan baska bir sey yok.', 2500),
  L('Eskisehir Ciborek', 'eskisehirciborek', 'eskisehir', null, 'Tatar usulu, sicak servis.', 3200),
  L('Afyon Sucuk', 'afyonsucukevi', 'afyonkarahisar', null, 'Kaymak da var, sucuk da.', 2200),
  L('Nevsehir Testi', 'nevsehirtestikebap', 'nevsehir', null, 'Kirilan testi geri gelmez.', 1800),

  // Ege / Marmara
  L('Bursa Iskender', 'bursaiskender.com.tr', 'bursa', null, 'Tereyagi masada dokulur.', 15500),
  L('Denizli Kebap', 'denizlikebapp', 'denizli', null, 'Firin kuzu, ekmek yaninda.', 3800),
  L('Mugla Zeytinyagli', 'muglazeytinyagli', 'mugla', 'Bodrum', 'Otlar sabah toplanir.', 6800),
  L('Canakkale Peynir', 'canakkalepeynirhelva', 'canakkale', null, 'Peynir helvasi, sicak.', 1500),
  L('Balikesir Hosmerim', 'balikesirhosmerim', 'balikesir', null, 'Tatli ama peynirli.', 1600),
  L('Edirne Cigerci', 'edirnecigerci', 'edirne', null, 'Tava ciger, aci biber.', 2800),
  L('Tekirdag Kofte', 'tekirdagkoftem', 'tekirdag', null, 'Yaninda piyaz, ustune ayran.', 2100),
  L('Sakarya Islama', 'sakaryaislama', 'sakarya', null, 'Ekmek et suyuna batar.', 1900),
  L('Kocaeli Pismaniye', 'kocaelipismaniye', 'kocaeli', null, 'El cekmesi, makine degil.', 1400),

  // Dogu — ucuz zaferin vitrini
  L('Van Kahvalti', 'vankahvaltievi', 'van', null, 'Kahvalti 22 cesit, saat 6.', 5200),
  L('Erzurum Cag', 'erzurumcagkebap', 'erzurum', null, 'Yatay sis, odun atesi.', 4200),
  L('Malatya Kayisi', 'malatyakayisievi', 'malatya', null, 'Kuru kayisi ve kebap.', 1700),
  L('Diyarbakir Kaburga', 'diyarbakirkaburga', 'diyarbakir', null, 'Dolmali kaburga, sabah siparisi.', 3600),
  L('Mardin Kibe', 'mardinkibee', 'mardin', null, 'Icli kofte ama Mardin usulu.', 1300),
  L('Kars Gravyer', 'karsgravyeri', 'kars', null, 'Peynir mahzende bekler.', 1200),
  L('Ardahan Bal', 'ardahanbalevi', 'ardahan', null, 'Yayla bali, suzme.', 900),
  L('Bayburt Lor', 'bayburtlordolmasi', 'bayburt', null, 'Lor dolmasi, ev usulu.', 800),
  L('Igdir Kayisi', 'igdirkayisi76', 'igdir', null, 'Sinirdan taze.', 700),
]

async function main() {
  await prisma.bid.deleteMany()
  await prisma.click.deleteMany()
  await prisma.delivery.deleteMany()
  await prisma.listing.deleteMany()

  const now = Date.now()
  let i = 0

  for (const d of data) {
    // Ilk teklif ne kadar eskiyse esitlikte o kadar avantajli
    const firstAt = new Date(now - (data.length - i) * 3_600_000 - Math.random() * 86_400_000)

    const listing = await prisma.listing.create({
      data: {
        url: d.url,
        name: d.name,
        city: d.city,
        district: d.district,
        description: d.description,
        ownerName: d.name + " Sahibi",
        ownerEmail: d.label.replace(/[^a-z0-9]/gi, "").toLowerCase() + "@ornek.test",
        currentBid: d.bid,
        firstBidAt: firstAt,
        clickCount: Math.floor(Math.random() * 900) + 20,
      },
    })

    // Teklif gecmisi: taban -> bugunku tutar, birkac adimda
    const steps = Math.min(4, 1 + Math.floor(Math.random() * 4))
    let prev = 0
    for (let s = 1; s <= steps; s++) {
      const amount = s === steps ? d.bid : Math.round((d.bid * s) / steps / 5000) * 5000
      if (amount <= prev) continue
      await prisma.bid.create({
        data: {
          listingId: listing.id,
          amount,
          paid: amount - prev,
          status: 'PAID',
          createdAt: new Date(firstAt.getTime() + s * 3_600_000 * (1 + Math.random() * 6)),
          passedLabel:
            s > 1 && Math.random() > 0.5 ? data[Math.floor(Math.random() * data.length)].label : null,
        },
      })
      prev = amount
    }
    i++
  }

  const count = await prisma.listing.count()
  console.log(count + ' ilan olusturuldu.')
}

main().finally(() => prisma.$disconnect())

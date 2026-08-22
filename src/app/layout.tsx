import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { VisitorProvider } from '@/components/VisitorProvider'
import { siteUrl } from '@/lib/site'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'], // latin-ext olmadan ş ğ ı ü ö ç bozulur
})

const BASLIK = 'Tabela — Türkiye’nin en iddialı işletmeleri'
const ACIKLAMA =
  'İddian varsa yerin üstte. İşletmeler teklif verir, sıralama teklife göre değişir. Şehrinin en popüleri ol.'

export const metadata: Metadata = {
  // Dongunun son adimi paylasmak; paylasilan baglanti kart olarak aciliyor.
  // metadataBase olmadan goreli adresler mutlaklasmiyor.
  metadataBase: new URL(siteUrl()),
  title: BASLIK,
  description: ACIKLAMA,
  openGraph: {
    title: BASLIK,
    description: ACIKLAMA,
    url: '/',
    siteName: 'Tabela',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: { card: 'summary', title: BASLIK, description: ACIKLAMA },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {/* Ziyaretci sayimi burada: hangi sayfa acilirsa acilsin sayilsin */}
        <VisitorProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </VisitorProvider>
      </body>
    </html>
  )
}

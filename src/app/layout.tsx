import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { VisitorProvider } from '@/components/VisitorProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'], // latin-ext olmadan ş ğ ı ü ö ç bozulur
})

export const metadata: Metadata = {
  title: 'Tabela — Türkiye’nin en iddialı işletmeleri',
  description:
    'İyi olan değil, iddialı olan üstte. İşletmeler teklif verir, sıralama teklife göre değişir. Şehrinde 1 numara ol.',
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

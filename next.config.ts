import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],

  // Rozet fontlari: public/ klasoru Vercel'de CDN'den servis ediliyor ama
  // sunucu fonksiyonunun dosya sistemine DAHIL EDILMIYOR — o yuzden
  // fs.readFile canlida 500 veriyordu. Bu satir woff dosyalarini rozet
  // fonksiyonunun paketine zorla dahil ediyor.
  outputFileTracingIncludes: {
    '/rozet/[id]': ['./public/fonts/**'],
  },
}

export default nextConfig

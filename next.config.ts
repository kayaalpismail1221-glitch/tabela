import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // iyzipay, model dosyalarini calisma aninda dinamik require ile yukluyor.
  // Bundle'a girmeye calisinca "module not found" veriyor; sunucu tarafinda
  // paket olarak birakiyoruz.
  serverExternalPackages: ['iyzipay', 'sharp'],

  // Rozet fontlari: public/ klasoru Vercel'de CDN'den servis ediliyor ama
  // sunucu fonksiyonunun dosya sistemine DAHIL EDILMIYOR — o yuzden
  // fs.readFile canlida 500 veriyordu. Bu satir woff dosyalarini rozet
  // fonksiyonunun paketine zorla dahil ediyor.
  outputFileTracingIncludes: {
    '/rozet/[id]': ['./public/fonts/**'],
  },
}

export default nextConfig

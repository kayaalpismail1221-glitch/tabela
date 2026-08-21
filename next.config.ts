import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // iyzipay, model dosyalarini calisma aninda dinamik require ile yukluyor.
  // Bundle'a girmeye calisinca "module not found" veriyor; sunucu tarafinda
  // paket olarak birakiyoruz.
  serverExternalPackages: ['iyzipay'],
}

export default nextConfig

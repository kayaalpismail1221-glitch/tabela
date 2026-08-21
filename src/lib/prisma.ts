import { PrismaClient } from '@prisma/client'
import { resolveDbUrl } from './db-url'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Baglanti dizesini env'den ADIYLA cozup Prisma'ya elden veriyoruz.
// Sema hala env("DATABASE_URL") diyor — o yalnizca `prisma db push` gibi CLI
// komutlari icin gecerli ve lokalde .env dosyasindan okunuyor. Calisma
// zamaninda isim ne olursa olsun asagidaki override kazaniyor.
const cozulen = resolveDbUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(cozulen ? { datasources: { db: { url: cozulen.url } } } : undefined)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

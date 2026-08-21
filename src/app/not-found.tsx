import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
      <h1 className="neon text-6xl font-black text-neon">404</h1>
      <p className="mt-4 text-lg font-bold">Böyle bir tahta yok.</p>
      <p className="mt-1 text-sm text-muted">Ya adres yanlış ya da o ilan tahtadan indi.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-neon px-6 py-3 font-bold text-ink transition hover:brightness-110"
      >
        Tahtaya dön
      </Link>
    </div>
  )
}

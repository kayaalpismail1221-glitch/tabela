import Link from 'next/link'

/**
 * Odeme adiminda kabul edilen kart markalari + 3DS ibaresi.
 * Odeme kurulusunun sitede aradigi unsurlardan biri.
 *
 * Logolar disaridan cekilmiyor: uzak gorsel yok, hepsi inline SVG.
 * Beyaz cip icinde duruyorlar cunku marka renkleri koyu zeminde okunmuyor.
 */
function Chip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-12 items-center justify-center rounded-md bg-white"
    >
      {children}
    </span>
  )
}

function Mastercard() {
  return (
    <svg viewBox="0 0 40 24" className="h-4" role="img" aria-hidden>
      <circle cx="16" cy="12" r="9" fill="#EB001B" />
      <circle cx="24" cy="12" r="9" fill="#F79E1B" />
      <path d="M20 5.2a9 9 0 000 13.6 9 9 0 000-13.6z" fill="#FF5F00" />
    </svg>
  )
}

function Wordmark({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="text-[11px] font-black italic tracking-tight"
      style={{ color }}
      aria-hidden
    >
      {text}
    </span>
  )
}

export function PaymentMarks({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-surface/40 p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Chip label="Visa">
          <Wordmark text="VISA" color="#1A1F71" />
        </Chip>
        <Chip label="Mastercard">
          <Mastercard />
        </Chip>
        <Chip label="Troy">
          <Wordmark text="troy" color="#00A0DF" />
        </Chip>
        <span className="ml-1 rounded-md border border-line px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cool">
          3D Secure
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Ödeme, ödeme kuruluşunun güvenli sayfasında 3D Secure ile alınır.{' '}
        <strong className="text-text">Kart bilgileriniz sitemize hiçbir aşamada girmez ve
        saklanmaz.</strong>
      </p>

      <p className="mt-2 text-xs text-muted">
        Devam ederek{' '}
        <Link href="/mesafeli-satis" className="text-neon hover:underline">
          Mesafeli Satış Sözleşmesi
        </Link>
        ,{' '}
        <Link href="/iptal-iade" className="text-neon hover:underline">
          İptal ve İade Koşulları
        </Link>{' '}
        ve{' '}
        <Link href="/gizlilik" className="text-neon hover:underline">
          KVKK Aydınlatma Metni
        </Link>
        ’ni kabul etmiş olursunuz.
      </p>
    </div>
  )
}

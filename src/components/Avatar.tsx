// Gercek profil fotosu Instagram'dan cekilemiyor (Graph API sadece yetki veren
// hesabin verisini doner). Ilan sahibi gorsel yuklemediyse harften uretilmis
// deterministik bir amblem gosteriyoruz.
const PALETTE = [
  ['#ff8a3d', '#ff3d77'],
  ['#3ddc97', '#1aa1c9'],
  ['#ffb020', '#ff5f2e'],
  ['#8b5cf6', '#ec4899'],
  ['#22d3ee', '#3b82f6'],
  ['#f43f5e', '#f59e0b'],
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function Avatar({
  seed,
  label,
  size = 44,
  imageUrl,
}: {
  seed: string
  label: string
  size?: number
  imageUrl?: string | null
}) {
  const [a, b] = PALETTE[hash(seed) % PALETTE.length]
  const letter = label.trim().charAt(0).toLocaleUpperCase('tr-TR')

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-xl object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl font-black text-ink"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
    >
      {letter}
    </div>
  )
}

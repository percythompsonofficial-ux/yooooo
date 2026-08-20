export type FlashDesign =
  | "rose"
  | "swallow"
  | "dagger"
  | "snake"
  | "anchor"
  | "moth"
  | "star"
  | "lighthouse"
  | "sheet";

const INK = "#f4f1e8";
const RED = "#ff3d2e";
const TEAL = "#2fe6d0";
const GOLD = "#ffb627";
const VIOLET = "#a06bff";

/**
 * The seven motifs, each drawn centred on the origin inside roughly a
 * 190 x 200 box, so they can be dropped into a card or tiled into a sheet.
 */
const motifs: Record<Exclude<FlashDesign, "sheet">, React.ReactNode> = {
  rose: (
    <>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M0 -76 C 26 -76 37 -53 29 -29 C 23 -12 10 -4 0 -4 C -10 -4 -23 -12 -29 -29 C -37 -53 -26 -76 0 -76 Z"
          fill={RED}
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      ))}
      {[30, 90, 150, 210, 270, 330].map((a) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M0 -50 C 17 -50 25 -34 20 -18 C 16 -8 7 -2 0 -2 C -7 -2 -16 -8 -20 -18 C -25 -34 -17 -50 0 -50 Z"
          fill={GOLD}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      ))}
      <circle r="22" fill={RED} stroke={INK} strokeWidth="4" />
      <path
        d="M0 -13 A 13 13 0 1 1 -11 7 A 8 8 0 1 0 4 8"
        fill="none"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </>
  ),
  swallow: (
    <g transform="translate(4 4)">
      {/* gliding left, wings swept back */}
      <path d="M0 10 C 12 40 40 58 68 56 C 42 64 14 54 -2 32 Z" fill={TEAL} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M32 8 L84 -6 L66 16 L88 40 L38 26 Z" fill={TEAL} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <ellipse rx="40" ry="20" transform="rotate(-15)" fill={RED} stroke={INK} strokeWidth="4" />
      <circle cx="-36" cy="-10" r="15" fill={RED} stroke={INK} strokeWidth="4" />
      <path d="M-4 -14 C 8 -54 44 -70 72 -60 C 44 -44 18 -26 4 -6 Z" fill={GOLD} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-49 -12 L-70 -6 L-49 0 Z" fill={GOLD} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="-39" cy="-15" r="4" fill="#0a0a0c" />
    </g>
  ),
  dagger: (
    <>
      <circle cy="-94" r="11" fill={GOLD} stroke={INK} strokeWidth="4" />
      <rect x="-8" y="-86" width="16" height="32" fill={VIOLET} stroke={INK} strokeWidth="4" />
      <rect x="-34" y="-56" width="68" height="12" fill={GOLD} stroke={INK} strokeWidth="4" />
      <path d="M0 56 C -52 20 -48 -24 -2 -8 C 44 -24 48 20 0 56 Z" fill={RED} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-11 -44 L11 -44 L11 40 L0 80 L-11 40 Z" fill={TEAL} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    </>
  ),
  snake: (
    <>
      <path d="M-46 84 C -46 42 54 54 54 12 C 54 -28 -38 -18 -38 -56" fill="none" stroke={INK} strokeWidth="32" strokeLinecap="round" />
      <path d="M-46 84 C -46 42 54 54 54 12 C 54 -28 -38 -18 -38 -56" fill="none" stroke={VIOLET} strokeWidth="24" strokeLinecap="round" />
      <path d="M-46 84 C -46 42 54 54 54 12 C 54 -28 -38 -18 -38 -56" fill="none" stroke={GOLD} strokeWidth="9" strokeLinecap="round" strokeDasharray="2 13" />
      <g transform="translate(-38 -56)">
        <ellipse rx="23" ry="17" fill={VIOLET} stroke={INK} strokeWidth="4" />
        <circle cx="-8" cy="-4" r="4" fill="#0a0a0c" />
        <circle cx="9" cy="-4" r="4" fill="#0a0a0c" />
        <path d="M0 -17 L0 -31 M0 -31 L-8 -39 M0 -31 L8 -39" fill="none" stroke={RED} strokeWidth="4" strokeLinecap="round" />
      </g>
    </>
  ),
  anchor: (
    <>
      <circle cy="-84" r="16" fill="none" stroke={INK} strokeWidth="7" />
      <path d="M0 -68 L0 72" stroke={INK} strokeWidth="12" strokeLinecap="round" />
      <path d="M-44 -38 L44 -38" stroke={GOLD} strokeWidth="12" strokeLinecap="round" />
      <path d="M-62 24 C -62 72 -26 90 0 72 C 26 90 62 72 62 24" fill="none" stroke={TEAL} strokeWidth="12" strokeLinecap="round" />
      <path d="M-62 24 L-80 4 L-44 2 Z" fill={RED} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M62 24 L80 4 L44 2 Z" fill={RED} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    </>
  ),
  moth: (
    <>
      <path d="M0 -32 C -40 -76 -86 -62 -80 -16 C -76 20 -34 16 0 -4 Z" fill={VIOLET} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M0 -32 C 40 -76 86 -62 80 -16 C 76 20 34 16 0 -4 Z" fill={VIOLET} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M0 0 C -30 16 -58 36 -46 64 C -34 86 -10 64 0 36 Z" fill={TEAL} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M0 0 C 30 16 58 36 46 64 C 34 86 10 64 0 36 Z" fill={TEAL} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <ellipse rx="12" ry="48" fill={GOLD} stroke={INK} strokeWidth="4" />
      <circle cy="-28" r="9" fill="#0a0a0c" />
      <path d="M-5 -46 C -18 -66 -30 -72 -40 -70 M5 -46 C 18 -66 30 -72 40 -70" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  lighthouse: (
    <g transform="translate(0 6)">
      {/* the Biloxi light, the landmark this coast steers by */}
      <path d="M-18 -60 L-94 -84 L-94 -34 Z" fill={GOLD} opacity="0.35" />
      <path d="M18 -60 L94 -84 L94 -34 Z" fill={GOLD} opacity="0.35" />
      <path d="M-46 78 C -30 64 30 64 46 78 Z" fill={TEAL} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-27 78 L-17 -40 L17 -40 L27 78 Z" fill={INK} />
      <path d="M-17 -36 L17 -36 L19 -14 L-19 -14 Z" fill={RED} />
      <path d="M-21 8 L21 8 L23 30 L-23 30 Z" fill={RED} />
      <path d="M-25 52 L25 52 L27 74 L-27 74 Z" fill={RED} />
      <path d="M-27 78 L-17 -40 L17 -40 L27 78 Z" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x="-24" y="-52" width="48" height="12" fill={TEAL} stroke={INK} strokeWidth="4" />
      <rect x="-13" y="-76" width="26" height="24" fill={GOLD} stroke={INK} strokeWidth="4" />
      <path d="M-18 -76 L0 -93 L18 -76 Z" fill={RED} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    </g>
  ),
  star: (
    <>
      <path d="M0 -84l17 50 50-17-33 50 33 50-50-17-17 50-17-50-50 17 33-50-33-50 50 17z" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M0 -84l17 50 50-17-33 50H-33l-33-50 50 17z" fill={TEAL} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M0 84l-17-50-50 17 33-50h66l33 50-50-17z" fill={GOLD} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle r="12" fill={RED} stroke={INK} strokeWidth="4" />
    </>
  ),
};

const sheetOrder: Exclude<FlashDesign, "sheet">[] = [
  "rose", "swallow", "anchor", "moth", "dagger", "snake", "star", "lighthouse",
];

/** The shop wall: flash pinned up in rows, the way a real sheet is packed. */
function Sheet() {
  const cells: React.ReactNode[] = [];
  const cols = 7;
  const rows = 4;
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const design = sheetOrder[n % sheetOrder.length];
      const x = 100 + c * 200 + (r % 2 ? 100 : 0);
      const y = 110 + r * 200;
      const rot = ((n * 37) % 17) - 8;
      cells.push(
        <g key={`${r}-${c}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(0.44)`}>
          {motifs[design]}
        </g>,
      );
      n++;
    }
  }
  return <>{cells}</>;
}

/**
 * Original tattoo flash, drawn in the American traditional idiom: heavy
 * outlines, flat saturated fills, no gradients. This is the studio's own
 * artwork — used wherever a client photograph isn't supplied.
 */
export default function FlashArt({
  design = "rose",
  className = "",
}: {
  design?: FlashDesign;
  className?: string;
}) {
  if (design === "sheet") {
    return (
      <svg
        viewBox="0 0 1500 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className={className}
      >
        <rect width="1500" height="900" fill="#0a0a0c" />
        <g opacity="0.55">
          <Sheet />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={className}
    >
      <rect width="200" height="250" fill="#0a0a0c" />
      <circle cx="100" cy="115" r="86" fill="none" stroke={TEAL} strokeWidth="1" opacity="0.35" strokeDasharray="3 9" />
      <g stroke={TEAL} strokeWidth="2" fill="none" opacity="0.3">
        <path d="M-10 214 Q 30 200 70 214 T 150 214 T 230 214" />
        <path d="M-10 230 Q 30 216 70 230 T 150 230 T 230 230" opacity="0.6" />
      </g>
      <g transform="translate(100 115) scale(0.92)">{motifs[design]}</g>
    </svg>
  );
}

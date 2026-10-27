/** Petal positions round a flower centre, every `360 / count` degrees. */
function petalAngles(count: number): number[] {
  return Array.from({ length: count }, (_, index) => (360 / count) * index)
}

type FlowerProps = { x: number; y: number; petals: number; size: number; petalClass: string; heartClass: string }

function Flower({ x, y, petals, size, petalClass, heartClass }: FlowerProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {petalAngles(petals).map((angle) => (
        <ellipse
          key={angle}
          rx={size * 0.42}
          ry={size}
          cy={-size}
          transform={`rotate(${angle})`}
          className={petalClass}
        />
      ))}
      <circle r={size * 0.55} className="fill-petal-brown" />
      <circle r={size * 0.25} className={heartClass} />
    </g>
  )
}

/**
 * The table: glossy 1970s oilcloth, fixed behind everything. The print is a half-drop repeat, like the real rolls, in
 * tones close to the ground so the white cards stand out; the lamp catches the vinyl in two soft bands.
 */
export function Oilcloth() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10">
      <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="oilcloth-print" width="220" height="260" patternUnits="userSpaceOnUse">
            <rect width="220" height="260" className="fill-oilcloth" />
            <Flower x={55} y={65} petals={8} size={30} petalClass="fill-petal-ember" heartClass="fill-petal-gold" />
            <Flower x={165} y={195} petals={8} size={30} petalClass="fill-petal-ember" heartClass="fill-petal-gold" />
            <Flower x={165} y={65} petals={6} size={15} petalClass="fill-leaf" heartClass="fill-petal-cream" />
            <Flower x={55} y={195} petals={6} size={15} petalClass="fill-leaf" heartClass="fill-petal-cream" />
            <circle cx="110" cy="130" r="5" className="fill-petal-brown" />
            <circle cx="0" cy="130" r="5" className="fill-petal-brown" />
            <circle cx="220" cy="130" r="5" className="fill-petal-brown" />
            <circle cx="110" cy="0" r="3.5" className="fill-petal-cream" />
            <circle cx="110" cy="260" r="3.5" className="fill-petal-cream" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#oilcloth-print)" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_18%,rgb(255_244_220/0.32),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(118deg,transparent_22%,rgb(255_255_255/0.16)_27%,transparent_33%,transparent_64%,rgb(255_255_255/0.1)_68%,transparent_73%)]" />
    </div>
  )
}

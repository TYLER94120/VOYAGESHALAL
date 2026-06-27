interface Props {
  /** opacité du motif (défaut 0.07) */
  opacity?: number
  /** taille d'une tuile en px (défaut 90) */
  size?: number
  /** couleur du tracé (défaut or #C9A84C) */
  color?: string
  className?: string
}

/**
 * Motif géométrique islamique répétable (étoile à 8 branches + hexagone),
 * à poser en position:absolute inset:0 sur les fonds sombres.
 */
export default function IslamicPattern({
  opacity = 0.07,
  size = 90,
  color = '#C9A84C',
  className = '',
}: Props) {
  const patternId = `islamic-${size}`
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={patternId} width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1.1">
            {/* étoile à 8 branches (deux carrés superposés) */}
            <rect x={size * 0.22} y={size * 0.22} width={size * 0.56} height={size * 0.56} />
            <rect
              x={size * 0.22}
              y={size * 0.22}
              width={size * 0.56}
              height={size * 0.56}
              transform={`rotate(45 ${size / 2} ${size / 2})`}
            />
            {/* hexagone central */}
            <polygon
              points={hexagon(size / 2, size / 2, size * 0.16)}
            />
            {/* losange de liaison aux coins */}
            <path d={`M${size / 2} 0 L${size} ${size / 2} L${size / 2} ${size} L0 ${size / 2} Z`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

function hexagon(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

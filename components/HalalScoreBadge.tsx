export function HalalScoreBadge({ score }: { score: number }) {
  return (
    <div
      style={{
        background: 'rgba(201,168,76,0.16)',
        border: '1px solid rgba(201,168,76,0.6)',
        borderRadius: '30px',
        padding: '7px 13px',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#3BD17A',
          display: 'block',
          animation: 'pulse-green 2s ease-in-out infinite',
        }}
      />
      <span style={{ color: 'var(--or-clair)', fontSize: '12.5px', fontWeight: 700 }}>
        Halal {score}/10
      </span>
    </div>
  )
}

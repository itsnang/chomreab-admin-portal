import type React from 'react'

export function Field({
  label,
  children,
  error,
}: {
  label: React.ReactNode
  children: React.ReactNode
  error?: string | undefined
}) {
  return (
    <div className="mb-3.5">
      <label className="block" style={{ color: 'var(--hn-ink)' }}>
        <span className="block text-[12.5px] font-bold mb-1.5">{label}</span>
        {children}
      </label>
      {error && (
        <p className="mt-1 text-[11.5px] font-semibold" style={{ color: 'var(--hn-wish)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative w-[42px] h-[25px] rounded-full shrink-0 transition-colors"
      style={{ background: on ? 'var(--hn-clay)' : 'var(--hn-line)' }}
    >
      <span
        className="absolute top-[3px] w-[19px] h-[19px] rounded-full bg-white transition-all"
        style={{ left: on ? 20 : 3, boxShadow: '0 1px 3px rgba(0,0,0,.3)' }}
      />
    </button>
  )
}

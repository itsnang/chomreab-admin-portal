import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { InitialAvatar } from './initial-avatar'

interface ListRowProps {
  /** Drives the avatar's colour; omit `avatar` to hide it entirely. */
  id: string
  title: ReactNode
  subtitle?: ReactNode
  /** Trailing controls — chips and buttons. */
  actions?: ReactNode
  /** First row in a list draws no top border. */
  first?: boolean
  avatar?: boolean
  /** Dims the avatar and title for a row that is no longer current. */
  muted?: boolean
  className?: string
}

/**
 * The row shape shared by the students, classrooms and staff lists: avatar,
 * a truncating title over a truncating subtitle, then trailing actions. Each
 * screen used to repeat the same flex/border/truncate incantation.
 */
export function ListRow({
  id,
  title,
  subtitle,
  actions,
  first = false,
  avatar = true,
  muted = false,
  className,
}: ListRowProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 px-5 py-3.5',
        !first && 'border-t',
        className
      )}
    >
      {avatar && (
        <InitialAvatar
          id={id}
          name={typeof title === 'string' ? title : ''}
          className={cn(muted && 'opacity-50')}
        />
      )}
      {/* A floor rather than `min-w-0`: without it the name collapses to an
          ellipsis to make room for the actions, instead of the actions
          wrapping to their own line. */}
      <div className="min-w-[9rem] flex-1">
        <div className={cn('truncate text-sm font-bold', muted && 'text-muted-foreground')}>
          {title}
        </div>
        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

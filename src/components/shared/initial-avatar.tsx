import { cn } from '@/lib/utils'
import { avatarColor, initials } from '@/lib/avatar'

interface InitialAvatarProps {
  /** Drives the colour, so the same person keeps the same one across screens. */
  id: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  /** When set, the avatar carries this as its accessible name and tooltip
   *  instead of being hidden from assistive tech. */
  title?: string
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<InitialAvatarProps['size']>, string> = {
  sm: 'size-[34px] text-[13px]',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
}

/** A person's or classroom's initials in a colour derived from their id. The
 *  one place the avatar palette is applied — every list row uses this rather
 *  than repeating the same circle markup. */
export function InitialAvatar({ id, name, size = 'md', title, className }: InitialAvatarProps) {
  return (
    <div
      className={cn(
        'flex flex-none items-center justify-center rounded-full font-bold text-white',
        SIZE_CLASSES[size],
        className
      )}
      style={{ background: avatarColor(id) }}
      {...(title ? { title, role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      {initials(name)}
    </div>
  )
}

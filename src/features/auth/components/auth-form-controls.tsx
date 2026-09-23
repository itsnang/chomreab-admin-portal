'use client'

import { useState, type ReactNode, type ComponentType, type CSSProperties } from 'react'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const LABEL_CLASS = 'text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase'
// A filled surface plus a stronger focus glow than the default shadcn
// `focus-visible:ring-[3px]` — on the card's own background a bare border is
// easy to miss, so the field needs to read as its own surface at rest, not
// just on focus.
const INPUT_WRAPPER_CLASS =
  'flex items-center rounded-lg border bg-muted/60 transition-shadow focus-within:border-ring focus-within:shadow-[0_0_0_3px_hsl(var(--ring)/0.18)]'
const INPUT_CLASS = 'h-11 border-0 bg-transparent shadow-none focus-visible:ring-0'

type IconType = ComponentType<{ size?: number; className?: string; style?: CSSProperties }>

/** Single-line text field wired to react-hook-form, with an optional
 *  leading icon so email/name/organization fields are scannable at a
 *  glance instead of five identical-looking rows. */
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  autoComplete,
  icon: Icon,
}: {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder: string
  type?: 'text' | 'email'
  autoComplete?: string
  icon?: IconType
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className={LABEL_CLASS}>{label}</FormLabel>
          <FormControl>
            <div
              className={cn(
                INPUT_WRAPPER_CLASS,
                fieldState.error && 'border-destructive'
              )}
            >
              {Icon && <Icon size={15} className="ml-3.5 shrink-0 text-muted-foreground" />}
              <Input
                type={type}
                placeholder={placeholder}
                {...(autoComplete ? { autoComplete } : {})}
                className={cn(INPUT_CLASS, Icon && 'pl-2.5')}
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
}

/** Password field with its own show/hide toggle. `action` renders opposite
 *  the label — used by the sign-in form for a "Forgot password?" link, if
 *  one is added later. */
export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  autoComplete,
  action,
  icon: Icon = Lock,
}: {
  control: Control<T>
  name: Path<T>
  label: string
  autoComplete: 'current-password' | 'new-password'
  action?: ReactNode
  icon?: IconType
}) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel className={LABEL_CLASS}>{label}</FormLabel>
            {action}
          </div>
          <FormControl>
            <div
              className={cn(
                INPUT_WRAPPER_CLASS,
                fieldState.error && 'border-destructive'
              )}
            >
              <Icon size={15} className="ml-3.5 shrink-0 text-muted-foreground" />
              <Input
                type={visible ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete={autoComplete}
                className={cn(INPUT_CLASS, 'pl-2.5 pr-2')}
                {...field}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="mr-3.5 shrink-0 text-muted-foreground transition-opacity hover:opacity-70"
              >
                {visible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
}

/** Title + subtitle block every auth screen opens with. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle: ReactNode }) {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-1 mb-7 text-[13px] text-muted-foreground">{subtitle}</p>
    </>
  )
}

/** Full-width primary submit button with the shared pending spinner and a
 *  slight press/hover response, so the one action that actually submits
 *  money-adjacent forms (signup, sign-in) doesn't feel static. */
export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean
  children: ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-[var(--shadow-primary)] transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:active:scale-100"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

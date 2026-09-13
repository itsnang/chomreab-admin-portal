'use client'

import type { ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The button that opens the sheet. Omit for a sheet opened from a row
   *  action, where the caller drives `open` directly. */
  trigger?: ReactNode
  title: string
  description?: string
  submitLabel: string
  isSubmitting?: boolean
  /** Already bound through react-hook-form's `handleSubmit`. */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  /** The form fields. Wrap the whole sheet in `<Form {...form}>` so they can
   *  reach the form context. */
  children: ReactNode
}

/**
 * Houses a create form in a side sheet rather than pinned above the list, where
 * a horizontal `flex items-end` row squashed its inputs and shifted the page
 * every time a validation message appeared. A sheet keeps the list it is
 * adding to visible alongside the form, and gives fields a full column of
 * width to grow into as the form gains more of them.
 */
export function FormSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  children,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="grid min-h-0 flex-1 auto-rows-min gap-4 overflow-y-auto px-4">
            {children}
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

'use client'

import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The button that opens the dialog. */
  trigger: ReactNode
  title: string
  description?: string
  submitLabel: string
  isSubmitting?: boolean
  /** Already bound through react-hook-form's `handleSubmit`. */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  /** The form fields. Wrap the whole dialog in `<Form {...form}>` so they can
   *  reach the form context. */
  children: ReactNode
}

/**
 * Houses a create form in a dialog instead of pinning it above the list. The
 * inline forms this replaces squashed their inputs and shifted the page every
 * time a validation message appeared.
 */
export function FormDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-4 py-5">{children}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

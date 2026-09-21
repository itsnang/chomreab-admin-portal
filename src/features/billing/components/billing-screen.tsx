'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { SectionHeader } from '@/components/shared/section-header'
import { StatusChip, type Status } from '@/components/shared/status-chip'
import { Icons } from '@/components/shared/icons'
import { TONE_MUTED_BG, TONE_TEXT } from '@/components/shared/tone'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useBillingStatus } from '../hooks/use-billing-status'
import { startCheckout, startSubscription } from '../actions'
import type { CutLuyCheckout, Invoice, SubscriptionPlan, SubscriptionStatus } from '../types'

const CARD_CLASS = 'rounded-xl border bg-card p-4 shadow-card-sm'

const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { chip: Status; label: string }> = {
  active: { chip: 'active', label: 'Active' },
  in_grace: { chip: 'late', label: 'Payment overdue — grace period' },
  lapsed: { chip: 'absent', label: 'Lapsed' },
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BillingScreen() {
  const query = useBillingStatus()
  const [checkout, setCheckout] = useState<CutLuyCheckout | null>(null)

  if (query.isPending || query.isError) {
    return (
      <PageShell heading="Billing">
        <QueryState
          isPending={query.isPending}
          message="Couldn't load billing status."
          onRetry={() => query.refetch()}
        />
      </PageShell>
    )
  }

  const { subscription, openInvoice } = query.data

  return (
    <PageShell heading="Billing" description="Subscription status and payment.">
      <div className="flex max-w-[640px] flex-col gap-3.5">
        {subscription ? (
          <div className={CARD_CLASS}>
            <SectionHeader
              icon={Icons.creditCard}
              title="Subscription"
              subtitle={`${subscription.plan === 'monthly' ? 'Monthly' : 'Annual'} plan`}
              right={
                <StatusChip
                  status={SUBSCRIPTION_STATUS[subscription.status].chip}
                  label={SUBSCRIPTION_STATUS[subscription.status].label}
                />
              }
            />
            <p className="text-sm text-muted-foreground">
              Current period {formatDateTime(subscription.currentPeriodStart)} –{' '}
              {formatDateTime(subscription.currentPeriodEnd)}
            </p>
            {subscription.status === 'lapsed' && (
              <p
                className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${TONE_MUTED_BG.absent} ${TONE_TEXT.absent}`}
              >
                Parent notifications are paused until the open invoice is paid. Marking
                attendance, history, and reports are unaffected.
              </p>
            )}
            {subscription.status === 'in_grace' && (
              <p
                className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${TONE_MUTED_BG.late} ${TONE_TEXT.late}`}
              >
                Payment is overdue. Parent notifications keep sending during the grace
                period, but will pause if the invoice stays unpaid.
              </p>
            )}
          </div>
        ) : (
          <NoSubscriptionCard />
        )}

        {openInvoice ? (
          <InvoiceCard invoice={openInvoice} onCheckout={setCheckout} />
        ) : (
          <div className={CARD_CLASS}>
            <SectionHeader icon={Icons.check} title="Invoices" subtitle="Nothing due" />
            <p className="text-sm text-muted-foreground">There is no open invoice right now.</p>
          </div>
        )}
      </div>

      <CheckoutSheet checkout={checkout} onOpenChange={(open) => !open && setCheckout(null)} />
    </PageShell>
  )
}

/** A School has no Subscription until its admin actively converts — during
 *  or after the 30-day trial, per CONTEXT.md's Trial/Subscription entries in
 *  attendance-api. This is that conversion moment: a one-time action, not
 *  something that can be undone from here once started. */
function NoSubscriptionCard() {
  const queryClient = useQueryClient()
  const [plan, setPlan] = useState<SubscriptionPlan>('monthly')
  const [pending, setPending] = useState(false)

  const onSubscribe = async () => {
    setPending(true)
    const result = await startSubscription(plan)
    setPending(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Subscription started')
    await queryClient.invalidateQueries({ queryKey: ['billing-status'] })
  }

  return (
    <div className={CARD_CLASS}>
      <SectionHeader icon={Icons.creditCard} title="Subscription" />
      <p className="text-sm text-muted-foreground">
        No subscription started yet — you can convert anytime during or after your trial.
      </p>
      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <div className="inline-flex rounded-lg border p-0.5">
          {(['monthly', 'annual'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setPlan(option)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                plan === option
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={onSubscribe}
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-75"
        >
          {pending ? <Icons.loader2 size={16} className="animate-spin" /> : <Icons.check size={16} />}
          {pending ? 'Starting…' : 'Subscribe now'}
        </button>
      </div>
    </div>
  )
}

function InvoiceCard({
  invoice,
  onCheckout,
}: {
  invoice: Invoice
  onCheckout: (checkout: CutLuyCheckout) => void
}) {
  const [pending, setPending] = useState(false)

  const onPayNow = async () => {
    setPending(true)
    const result = await startCheckout(invoice.id)
    setPending(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.data) onCheckout(result.data)
  }

  return (
    <div className={CARD_CLASS}>
      <SectionHeader
        icon={Icons.creditCard}
        title="Invoice due"
        subtitle={`${invoice.activeStudentCount} active students`}
      />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold">{formatCents(invoice.amountCents)}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            Due {formatDateTime(invoice.dueAt)}
          </p>
        </div>
        <button
          onClick={onPayNow}
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-75"
        >
          {pending ? <Icons.loader2 size={16} className="animate-spin" /> : <Icons.creditCard size={16} />}
          {pending ? 'Starting…' : 'Pay now'}
        </button>
      </div>
    </div>
  )
}

/** CutLuy has no self-rendered checkout flow of its own — `checkoutUrl` is a
 *  hosted page, `qrString` the same payment's QR payload for scanning in-app
 *  instead of leaving the dashboard. Confirmation only ever arrives later via
 *  the webhook attendance-api verifies; this sheet closing early changes
 *  nothing about whether the payment went through. */
function CheckoutSheet({
  checkout,
  onOpenChange,
}: {
  checkout: CutLuyCheckout | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={checkout !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Scan to pay</SheetTitle>
          <SheetDescription>
            Scan with a banking app that supports KHQR, or open the payment page directly.
          </SheetDescription>
        </SheetHeader>
        {checkout && (
          <div className="flex flex-col items-center gap-4 px-4">
            <div className="rounded-xl border bg-white p-4">
              <QRCodeSVG value={checkout.qrString} size={220} />
            </div>
            <a
              href={checkout.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-bold text-primary"
            >
              Open payment page
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

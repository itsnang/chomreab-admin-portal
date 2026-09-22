'use client'

import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatusChip, type Status } from '@/components/shared/status-chip'
import { Icons } from '@/components/shared/icons'
import { TONE_MUTED_BG, TONE_TEXT } from '@/components/shared/tone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useBillingStatus } from '../hooks/use-billing-status'
import { startCheckout, startSubscription } from '../actions'
import type { CutLuyCheckout, Invoice, SubscriptionPlan, SubscriptionStatus } from '../types'

const CARD_CLASS = 'rounded-2xl border bg-card p-5 shadow-card-sm'

const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { chip: Status; label: string }> = {
  active: { chip: 'active', label: 'Active' },
  in_grace: { chip: 'late', label: 'Payment overdue' },
  lapsed: { chip: 'absent', label: 'Lapsed' },
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
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
          className="min-h-[240px]"
        />
      </PageShell>
    )
  }

  const { subscription, openInvoice } = query.data

  return (
    <PageShell heading="Billing" description="Subscription status and payment.">
      <div className="flex max-w-[560px] flex-col gap-4">
        {subscription ? (
          <SubscriptionCard subscription={subscription} />
        ) : (
          <NoSubscriptionCard />
        )}

        {openInvoice ? (
          <InvoiceCard invoice={openInvoice} onCheckout={setCheckout} />
        ) : subscription ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed px-5 py-4 text-sm font-semibold text-muted-foreground">
            <Icons.check size={18} className="text-present" />
            All paid up — nothing due right now.
          </div>
        ) : null}
      </div>

      <PaymentDialog checkout={checkout} onOpenChange={(open) => !open && setCheckout(null)} />
    </PageShell>
  )
}

function SubscriptionCard({
  subscription,
}: {
  subscription: { plan: SubscriptionPlan; status: SubscriptionStatus; currentPeriodStart: string; currentPeriodEnd: string }
}) {
  const { chip, label } = SUBSCRIPTION_STATUS[subscription.status]
  const renewsIn = daysUntil(subscription.currentPeriodEnd)

  return (
    <div className={CARD_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icons.creditCard size={19} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-[15px] font-bold capitalize">{subscription.plan} plan</p>
            <p className="text-xs font-medium text-muted-foreground">
              {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
              {subscription.status === 'active' &&
                renewsIn >= 0 &&
                ` · renews in ${renewsIn} ${renewsIn === 1 ? 'day' : 'days'}`}
            </p>
          </div>
        </div>
        <StatusChip status={chip} label={label} />
      </div>

      {subscription.status === 'lapsed' && (
        <Banner tone="absent">
          Parent notifications are paused until the open invoice is paid. Marking attendance,
          history, and reports are unaffected.
        </Banner>
      )}
      {subscription.status === 'in_grace' && (
        <Banner tone="late">
          Payment is overdue. Parent notifications keep sending during the grace period, but will
          pause if the invoice stays unpaid.
        </Banner>
      )}
    </div>
  )
}

function Banner({ tone, children }: { tone: 'absent' | 'late'; children: ReactNode }) {
  return (
    <p
      className={cn(
        'mt-4 flex items-start gap-2 rounded-xl px-3.5 py-3 text-xs leading-relaxed font-semibold',
        TONE_MUTED_BG[tone],
        TONE_TEXT[tone]
      )}
    >
      <Icons.clock size={15} className="mt-0.5 shrink-0" />
      {children}
    </p>
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
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icons.creditCard size={19} strokeWidth={2.2} />
        </span>
        <div>
          <p className="text-[15px] font-bold">No subscription yet</p>
          <p className="text-xs font-medium text-muted-foreground">
            $0.10 per active student, billed monthly
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        You can convert anytime during or after your trial — nothing is charged until you do.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <div className="inline-flex rounded-lg border bg-background p-0.5">
          {(['monthly', 'annual'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setPlan(option)}
              className={cn(
                'rounded-md px-3.5 py-1.5 text-xs font-bold capitalize transition-colors',
                plan === option
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={onSubscribe}
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-70"
        >
          {pending ? (
            <Icons.loader2 size={16} className="animate-spin" />
          ) : (
            <Icons.check size={16} />
          )}
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
  const overdue = daysUntil(invoice.dueAt) < 0

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
    <div className={cn(CARD_CLASS, 'flex items-center justify-between gap-4')}>
      <div>
        <p className="text-2xl font-extrabold tracking-tight">{formatCents(invoice.amountCents)}</p>
        <p
          className={cn(
            'mt-0.5 text-xs font-semibold',
            overdue ? 'text-absent' : 'text-muted-foreground'
          )}
        >
          {overdue ? 'Overdue since' : 'Due'} {formatDate(invoice.dueAt)} ·{' '}
          {invoice.activeStudentCount} active {invoice.activeStudentCount === 1 ? 'student' : 'students'}
        </p>
      </div>
      <button
        onClick={onPayNow}
        disabled={pending}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-70"
      >
        {pending ? (
          <Icons.loader2 size={16} className="animate-spin" />
        ) : (
          <Icons.creditCard size={16} />
        )}
        {pending ? 'Starting…' : 'Pay now'}
      </button>
    </div>
  )
}

/** CutLuy has no self-rendered checkout flow of its own — `checkoutUrl` is a
 *  hosted page, `qrString` the same payment's raw KHQR payload. Rendered via
 *  CutLuy's own render endpoint (https://cutluy.com/docs#khqr-image) rather
 *  than a generic QR library: it reads the merchant name, amount, and
 *  currency straight out of the payload and draws the real KHQR card design,
 *  which is what a Cambodian banking app's scanner is tuned to recognise —
 *  a plain black-and-white QR of the same string is technically scannable
 *  but not what payers expect to see. Confirmation only ever arrives later
 *  via the webhook attendance-api verifies; closing this dialog changes
 *  nothing about whether the payment went through. */
function PaymentDialog({
  checkout,
  onOpenChange,
}: {
  checkout: CutLuyCheckout | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={checkout !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan to pay</DialogTitle>
          <DialogDescription>Scan with any KHQR-supporting banking app.</DialogDescription>
        </DialogHeader>
        {checkout && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full overflow-hidden rounded-xl border bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- external SVG rendered by CutLuy, not a local/Next-optimized asset */}
              <img
                src={`https://cutluy.com/api/render/khqr/${encodeURIComponent(checkout.qrString)}.svg`}
                alt="KHQR payment code"
                width={360}
                height={360}
                className="mx-auto h-auto w-full max-w-[320px]"
              />
            </div>
            <a
              href={checkout.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-bold text-primary transition-colors hover:bg-muted"
            >
              <Icons.link2 size={16} />
              Open payment page instead
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

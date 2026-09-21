'use server'

import { ApiError, apiFetch } from '@/lib/api/server'
import type { BillingStatus, CutLuyCheckout, Invoice, Subscription } from '../types'

interface SubscriptionApi {
  id: string
  plan: Subscription['plan']
  status: Subscription['status']
  current_period_start: string
  current_period_end: string
}

interface InvoiceApi {
  id: string
  amount_cents: number
  due_at: string
  status: Invoice['status']
  active_student_count: number
}

interface BillingStatusApi {
  subscription: SubscriptionApi | null
  open_invoice: InvoiceApi | null
}

export async function getBillingStatus(): Promise<BillingStatus> {
  const api = await apiFetch<BillingStatusApi>('/billing/status')
  return {
    subscription: api.subscription
      ? {
          id: api.subscription.id,
          plan: api.subscription.plan,
          status: api.subscription.status,
          currentPeriodStart: api.subscription.current_period_start,
          currentPeriodEnd: api.subscription.current_period_end,
        }
      : null,
    openInvoice: api.open_invoice
      ? {
          id: api.open_invoice.id,
          amountCents: api.open_invoice.amount_cents,
          dueAt: api.open_invoice.due_at,
          status: api.open_invoice.status,
          activeStudentCount: api.open_invoice.active_student_count,
        }
      : null,
  }
}

interface CheckoutApi {
  checkout_url: string
  qr_string: string
}

export async function startCheckout(
  invoiceId: string
): Promise<{ data?: CutLuyCheckout; error?: string }> {
  try {
    const api = await apiFetch<CheckoutApi>(`/billing/invoices/${invoiceId}/checkout`, {
      method: 'POST',
    })
    return { data: { checkoutUrl: api.checkout_url, qrString: api.qr_string } }
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to start checkout' }
  }
}

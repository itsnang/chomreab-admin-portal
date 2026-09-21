export type SubscriptionPlan = 'monthly' | 'annual'
export type SubscriptionStatus = 'active' | 'in_grace' | 'lapsed'
export type InvoiceStatus = 'open' | 'paid' | 'void'

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
}

export interface Invoice {
  id: string
  amountCents: number
  dueAt: string
  status: InvoiceStatus
  activeStudentCount: number
}

export interface BillingStatus {
  subscription: Subscription | null
  openInvoice: Invoice | null
}

/** Where to send the payer — CutLuy's hosted page, and the raw QR payload to
 *  render in-app. Confirmation of payment never comes from this call
 *  succeeding, only from the webhook attendance-api verifies separately. */
export interface CutLuyCheckout {
  checkoutUrl: string
  qrString: string
}

/** Short display label for a customer we only know by id — the real order
 *  API carries no name/profile, just `customerId`. Used by any screen that
 *  renders an order (orders list/detail, dashboard). */
export function formatCustomerLabel(customerId: string): string {
  return `Customer #${customerId.slice(0, 8)}`
}

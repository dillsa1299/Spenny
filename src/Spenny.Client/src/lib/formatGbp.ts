const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export function formatGbp(amount: number): string {
  return gbpFormatter.format(amount)
}

// Ordinal day label for list rows (e.g. 20th) from an ISO date string.
function ordinalSuffix(day: number): string {
  const mod100 = day % 100
  if (mod100 >= 11 && mod100 <= 13) {
    return 'th'
  }
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export function formatOrdinalDay(isoDate: string): string {
  const day = Number(isoDate.slice(8, 10))
  return `${day}${ordinalSuffix(day)}`
}

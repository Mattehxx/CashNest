const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

/** Data odierna in formato ISO `yyyy-mm-dd` (utile per i campi date). */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Formatta una data ISO `yyyy-mm-dd` in formato italiano leggibile. */
export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return dateFormatter.format(d)
}

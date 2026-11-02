const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

// Money is stored as integer kobo (D-26). The UI divides by 100 here, once.
export const formatNaira = (kobo) => naira.format(Math.round(Number(kobo) / 100))

const dateTime = new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Lagos',
})
export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : '')

// '+2348031234567' -> '0803 123 4567'
export function formatPhone(phone) {
  if (!phone) return ''
  const local = `0${phone.replace(/^\+234/, '')}`
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`
}

// Plain URL, no API key (D-10).
export const mapsLink = (...parts) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.filter(Boolean).join(', '))}`

// Accepts 0803..., 234803..., +234803... (spaces and dashes allowed).
// Returns +234XXXXXXXXXX or null. The server re-validates (migration 001 CHECK).
export function normalizePhone(input) {
  const digits = String(input).replace(/[\s()-]/g, '')
  if (/^\+234\d{10}$/.test(digits)) return digits
  if (/^234\d{10}$/.test(digits)) return `+${digits}`
  if (/^0\d{10}$/.test(digits)) return `+234${digits.slice(1)}`
  return null
}

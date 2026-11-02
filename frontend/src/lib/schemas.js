// Zod schemas for UX only. The server validates everything again (US-02).
import { z } from 'zod'
import { normalizePhone } from './format.js'
import {
  FUEL_TYPES,
  LOCATION_OPTIONS,
  NIGERIAN_STATES,
  SERVICE_TYPES,
  URGENCY_OPTIONS,
  VEHICLE_TYPES,
} from './constants.js'

const values = (list) => list.map((o) => o.value)
const email = z.string().trim().min(1, 'Enter your email').pipe(z.email('Enter a valid email address'))

// Empty input -> undefined, otherwise a number. One message for every failure.
const intField = ({ message, min, max, optional = false }) => {
  let n = z.number({ error: message }).int(message)
  if (min !== undefined) n = n.min(min, message)
  if (max !== undefined) n = n.max(max, message)
  return z.preprocess((v) => (v === '' || v == null ? undefined : Number(v)), optional ? n.optional() : n)
}

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})

const accountFields = {
  full_name: z.string().trim().min(2, 'Enter your full name').max(100, 'Name is too long'),
  email,
  phone: z
    .string()
    .trim()
    .refine((v) => normalizePhone(v) !== null, 'Enter a Nigerian number, like 0803 123 4567')
    .transform((v) => normalizePhone(v)),
  password: z.string().min(8, 'Use at least 8 characters').max(72, 'Use 72 characters or fewer'),
  confirm_password: z.string(),
}
const passwordsMatch = [
  (d) => d.password === d.confirm_password,
  { path: ['confirm_password'], message: 'Passwords do not match' },
]

export const ownerRegisterSchema = z.object(accountFields).refine(...passwordsMatch)

export const shopRegisterSchema = z
  .object({
    ...accountFields,
    business_name: z.string().trim().min(2, 'Enter the business name').max(120, 'Name is too long'),
    state: z.enum(NIGERIAN_STATES, { error: 'Choose a state' }),
    city_area: z.string().trim().min(2, 'Enter the city or area').max(80, 'Too long'),
    address: z.string().trim().min(5, 'Enter the shop address').max(200, 'Address is too long'),
    service_codes: z.array(z.enum(SERVICE_TYPES.map((s) => s.code))).min(1, 'Choose at least one service'),
    certification_notes: z.string().trim().max(2000, 'Keep this under 2,000 characters').optional(),
  })
  .refine(...passwordsMatch)

const thisYear = new Date().getFullYear()
export const vehicleSchema = z.object({
  vehicle_type: z.enum(values(VEHICLE_TYPES), { error: 'Choose a vehicle type' }),
  make: z.string().trim().min(2, 'Enter the make').max(50, 'Too long'),
  model: z.string().trim().min(1, 'Enter the model').max(50, 'Too long'),
  year: intField({ message: `Enter a year between 1950 and ${thisYear + 1}`, min: 1950, max: thisYear + 1 }),
  plate_number: z.string().trim().max(15, 'Plate number is too long').optional(),
  vin: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[A-Za-z0-9]{17}$/.test(v), 'A VIN has exactly 17 letters and numbers')
    .optional(),
  fuel_type: z.enum(values(FUEL_TYPES), { error: 'Choose a fuel type' }),
  mileage_km: intField({ message: 'Enter the mileage as a whole number', min: 0, optional: true }),
})

export const requestSchema = z
  .object({
    vehicle_id: z.string().min(1, 'Choose a vehicle'),
    symptoms: z.string().trim().min(10, 'Describe the problem in at least 10 characters').max(1000, 'Keep this under 1,000 characters'),
    urgency: z.enum(values(URGENCY_OPTIONS)),
    location_type: z.enum(values(LOCATION_OPTIONS)),
    service_address: z.string().trim().max(200, 'Address is too long').optional(),
  })
  .superRefine((d, ctx) => {
    if (d.location_type === 'mobile' && !(d.service_address?.length >= 5)) {
      ctx.addIssue({ code: 'custom', path: ['service_address'], message: 'Enter where the mechanic should come' })
    }
  })

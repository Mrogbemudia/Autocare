export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
]

// Codes match migrations/003 (service_types.code).
export const SERVICE_TYPES = [
  { code: 'mobile_mechanic', label: 'Mobile Mechanic' },
  { code: 'heavy_towing', label: 'Heavy Towing' },
  { code: 'open_24_7', label: '24/7 Shop' },
  { code: 'tire_specialist', label: 'Tire Specialist' },
  { code: 'ev_technician', label: 'EV Technician' },
  { code: 'general_repair', label: 'General Repair' },
]

export const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'suv', label: 'SUV' },
  { value: 'bus', label: 'Bus' },
  { value: 'truck', label: 'Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'tricycle', label: 'Tricycle' },
]

export const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const URGENCY_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'urgent', label: 'Urgent' },
]

export const LOCATION_OPTIONS = [
  { value: 'shop', label: 'I will visit the shop' },
  { value: 'mobile', label: 'Mobile mechanic comes to me' },
]

const labelOf = (list) => (v) => list.find((o) => o.value === v)?.label ?? v
export const vehicleTypeLabel = labelOf(VEHICLE_TYPES)
export const fuelLabel = labelOf(FUEL_TYPES)
export const urgencyLabel = labelOf(URGENCY_OPTIONS)

// A shop's services may arrive as { code, label } objects or plain codes.
export const serviceLabel = (s) =>
  s?.label ?? SERVICE_TYPES.find((t) => t.code === (s?.code ?? s))?.label ?? String(s)

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { applyFieldErrors } from '../lib/forms.js'
import { FUEL_TYPES, VEHICLE_TYPES, fuelLabel, vehicleTypeLabel } from '../lib/constants.js'
import { vehicleSchema } from '../lib/schemas.js'
import { EmptyState, ErrorState, Field, FormError, PageSpinner } from '../components/ui.jsx'

function VehicleForm({ vehicle, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicle_type: vehicle?.vehicle_type ?? '',
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      year: vehicle?.year ?? '',
      plate_number: vehicle?.plate_number ?? '',
      vin: vehicle?.vin ?? '',
      fuel_type: vehicle?.fuel_type ?? '',
      mileage_km: vehicle?.mileage_km ?? '',
    },
  })
  const save = useMutation({
    mutationFn: (body) => (vehicle ? api.vehicles.update(vehicle.id, body) : api.vehicles.create(body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      onClose()
    },
    onError: (err) => applyFieldErrors(err, setError),
  })
  const onSubmit = (v) =>
    save.mutate({
      ...v,
      plate_number: v.plate_number ? v.plate_number.toUpperCase() : null,
      vin: v.vin ? v.vin.toUpperCase() : null,
      mileage_km: v.mileage_km ?? null,
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4 p-5">
      <h2 className="text-xl">{vehicle ? 'Edit vehicle' : 'Add a vehicle'}</h2>
      <FormError>{save.error?.message}</FormError>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vehicle type" error={errors.vehicle_type?.message}>
          <select {...register('vehicle_type')}>
            <option value="">Choose a type</option>
            {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Fuel type" error={errors.fuel_type?.message}>
          <select {...register('fuel_type')}>
            <option value="">Choose a fuel type</option>
            {FUEL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Make" error={errors.make?.message}><input placeholder="Toyota" {...register('make')} /></Field>
        <Field label="Model" error={errors.model?.message}><input placeholder="Corolla" {...register('model')} /></Field>
        <Field label="Year" error={errors.year?.message}><input type="number" inputMode="numeric" {...register('year')} /></Field>
        <Field label="Plate number" hint="Optional" error={errors.plate_number?.message}><input {...register('plate_number')} /></Field>
        <Field label="VIN" hint="Optional, 17 characters" error={errors.vin?.message}><input {...register('vin')} /></Field>
        <Field label="Mileage (km)" hint="Optional" error={errors.mileage_km?.message}><input type="number" inputMode="numeric" {...register('mileage_km')} /></Field>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save vehicle'}</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  )
}

function VehicleCard({ vehicle, onEdit }) {
  const qc = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const remove = useMutation({
    mutationFn: () => api.vehicles.remove(vehicle.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
    onError: () => setConfirming(false),
  })
  return (
    <li className="card p-5">
      <h2 className="text-xl">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-ink-soft">Type</dt><dd>{vehicleTypeLabel(vehicle.vehicle_type)}</dd>
        <dt className="text-ink-soft">Fuel</dt><dd>{fuelLabel(vehicle.fuel_type)}</dd>
        {vehicle.plate_number && (<><dt className="text-ink-soft">Plate</dt><dd className="font-semibold">{vehicle.plate_number}</dd></>)}
        {vehicle.mileage_km != null && (<><dt className="text-ink-soft">Mileage</dt><dd>{vehicle.mileage_km.toLocaleString('en-NG')} km</dd></>)}
      </dl>
      <FormError>{remove.error?.message}</FormError>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(vehicle)}>Edit</button>
        {confirming ? (
          <>
            <button type="button" className="btn btn-danger btn-sm" disabled={remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirming(false)}>Keep</button>
          </>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirming(true)}>Delete</button>
        )}
      </div>
    </li>
  )
}

export default function Garage() {
  const [editing, setEditing] = useState(null) // null | 'new' | vehicle
  const { data: vehicles, isPending, error, refetch } = useQuery({ queryKey: ['vehicles'], queryFn: api.vehicles.list })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">My garage</h1>
        {!editing && <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>Add a vehicle</button>}
      </div>

      {editing && (
        <div className="mt-6 max-w-3xl">
          <VehicleForm key={editing === 'new' ? 'new' : editing.id} vehicle={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
        </div>
      )}

      <div className="mt-6">
        {isPending ? <PageSpinner /> : error ? <ErrorState error={error} onRetry={refetch} /> : vehicles.length === 0 && !editing ? (
          <EmptyState title="Your garage is empty" action={<button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>Add your first vehicle</button>}>
            Save your vehicle once and reuse it for every request.
          </EmptyState>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} onEdit={setEditing} />)}
          </ul>
        )}
      </div>
    </div>
  )
}

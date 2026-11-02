import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegister } from '../lib/auth.js'
import { applyFieldErrors } from '../lib/forms.js'
import { NIGERIAN_STATES, SERVICE_TYPES } from '../lib/constants.js'
import { ownerRegisterSchema, shopRegisterSchema } from '../lib/schemas.js'
import { Field, FormError } from '../components/ui.jsx'

function AccountFields({ register, errors }) {
  return (
    <>
      <Field label="Full name" error={errors.full_name?.message}>
        <input autoComplete="name" {...register('full_name')} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field label="Phone number" hint="For example 0803 123 4567" error={errors.phone?.message}>
        <input type="tel" autoComplete="tel" {...register('phone')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" hint="At least 8 characters" error={errors.password?.message}>
          <input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirm_password?.message}>
          <input type="password" autoComplete="new-password" {...register('confirm_password')} />
        </Field>
      </div>
    </>
  )
}

function OwnerForm() {
  const signup = useRegister('owner')
  const { register, handleSubmit, setError, formState: { errors } } = useForm({ resolver: zodResolver(ownerRegisterSchema) })
  const onSubmit = (values) => signup.mutate(values, { onError: (err) => applyFieldErrors(err, setError) })
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4 p-6">
      <FormError>{signup.error?.message}</FormError>
      <AccountFields register={register} errors={errors} />
      <button type="submit" className="btn btn-primary w-full" disabled={signup.isPending}>
        {signup.isPending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}

function ShopForm() {
  const signup = useRegister('shop')
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(shopRegisterSchema),
    defaultValues: { service_codes: [], state: '' },
  })
  const onSubmit = (values) =>
    signup.mutate({ ...values, certification_notes: values.certification_notes || null }, { onError: (err) => applyFieldErrors(err, setError) })
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4 p-6">
      <FormError>{signup.error?.message}</FormError>
      <AccountFields register={register} errors={errors} />
      <hr className="border-line" />
      <Field label="Business name" error={errors.business_name?.message}>
        <input {...register('business_name')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State" error={errors.state?.message}>
          <select {...register('state')}>
            <option value="">Choose a state</option>
            {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="City or area" error={errors.city_area?.message}>
          <input {...register('city_area')} />
        </Field>
      </div>
      <Field label="Shop address" error={errors.address?.message}>
        <input autoComplete="street-address" {...register('address')} />
      </Field>
      <fieldset>
        <legend className="text-sm font-semibold">Services you offer</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {SERVICE_TYPES.map((s) => (
            <label key={s.code} className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2">
              <input type="checkbox" value={s.code} className="size-4 accent-ink" {...register('service_codes')} />
              {s.label}
            </label>
          ))}
        </div>
        {errors.service_codes && <p role="alert" className="mt-1.5 text-sm font-medium text-alert">{errors.service_codes.message}</p>}
      </fieldset>
      <Field label="Certifications and experience" hint="Optional. An admin reads this when verifying your shop." error={errors.certification_notes?.message}>
        <textarea rows={4} {...register('certification_notes')} />
      </Field>
      <button type="submit" className="btn btn-primary w-full" disabled={signup.isPending}>
        {signup.isPending ? 'Creating account…' : 'Register my shop'}
      </button>
      <p className="text-sm text-ink-soft">Your shop stays hidden until an admin verifies it.</p>
    </form>
  )
}

export default function Register() {
  const [params, setParams] = useSearchParams()
  const role = params.get('role') === 'shop' ? 'shop' : 'owner'
  const tab = (value, label) => (
    <button
      type="button"
      aria-pressed={role === value}
      onClick={() => setParams({ role: value })}
      className={`btn flex-1 ${role === value ? 'btn-primary' : 'btn-secondary'}`}
    >
      {label}
    </button>
  )
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl">Create your account</h1>
      <div className="mt-6 flex gap-2" role="group" aria-label="Account type">
        {tab('owner', 'I own a vehicle')}
        {tab('shop', 'I run a repair shop')}
      </div>
      <div className="mt-4">{role === 'shop' ? <ShopForm key="shop" /> : <OwnerForm key="owner" />}</div>
      <p className="mt-4 text-ink-soft">
        Already registered? <Link to="/login" className="font-semibold text-ink underline underline-offset-4">Log in</Link>
      </p>
    </div>
  )
}

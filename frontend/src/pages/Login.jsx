import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '../lib/auth.js'
import { loginSchema } from '../lib/schemas.js'
import { Field, FormError } from '../components/ui.jsx'

// After a successful login, <GuestOnly> redirects to the page the user came from.
export default function Login() {
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) })

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl">Log in</h1>
      <form onSubmit={handleSubmit((values) => login.mutate(values))} noValidate className="card mt-6 space-y-4 p-6">
        <FormError>{login.error?.message}</FormError>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input type="password" autoComplete="current-password" {...register('password')} />
        </Field>
        <button type="submit" className="btn btn-primary w-full" disabled={login.isPending}>
          {login.isPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-ink-soft">
        New to Kaza? <Link to="/register" className="font-semibold text-ink underline underline-offset-4">Create an account</Link>
      </p>
    </div>
  )
}

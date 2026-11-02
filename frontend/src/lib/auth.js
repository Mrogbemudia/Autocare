import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api.js'

export const ME_KEY = ['me']

export const homeFor = (role) =>
  ({ owner: '/shops', shop: '/shop', admin: '/admin/shops' })[role] ?? '/'

// The current user, or null for a guest. A 401 is a normal answer here, not an error.
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      try {
        return await api.auth.me()
      } catch (err) {
        if (err.status === 401) return null
        throw err
      }
    },
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: (user) => qc.setQueryData(ME_KEY, user),
  })
}

// Registers, then logs in with the same credentials, so this works whether or
// not the backend's register endpoint sets cookies itself.
export function useRegister(kind) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values) => {
      const body = { ...values }
      delete body.confirm_password
      await (kind === 'shop' ? api.auth.registerShop(body) : api.auth.registerOwner(body))
      return api.auth.login({ email: body.email, password: body.password })
    },
    onSuccess: (user) => qc.setQueryData(ME_KEY, user),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.auth.logout,
    onSettled: () => {
      qc.clear() // drop every cached private query
      qc.setQueryData(ME_KEY, null)
    },
  })
}

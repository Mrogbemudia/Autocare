// Show per-field errors from the server (api error.fields) next to the inputs.
export function applyFieldErrors(error, setError) {
  if (!error?.fields) return
  for (const [name, message] of Object.entries(error.fields)) {
    setError(name, { type: 'server', message: String(message) })
  }
}

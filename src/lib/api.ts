'use client'

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) {
    super(message)
  }
}

/** JSON fetch against our own API. Throws ApiError with the server's message and field errors. */
export async function api<T = unknown>(
  path: string,
  opts: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  const init: RequestInit = { method: opts.method ?? (opts.body === undefined ? 'GET' : 'POST'), signal: opts.signal, credentials: 'same-origin' }
  if (opts.body instanceof FormData) init.body = opts.body
  else if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  let res: Response
  try {
    res = await fetch(path, init)
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError(0, 'You appear to be offline. Check your connection and try again.')
  }
  const data = res.headers.get('content-type')?.includes('json') ? await res.json().catch(() => ({})) : {}
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? `Request failed (${res.status})`, (data as { fields?: Record<string, string> }).fields)
  }
  return data as T
}

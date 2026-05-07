type Fbq = (...args: unknown[]) => void

export function trackLead() {
  if (typeof window === 'undefined') return
  const fbq = (window as unknown as { fbq?: Fbq }).fbq
  if (typeof fbq !== 'function') return
  fbq('track', 'Lead')
}

export function getStoredUser(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('izpiti_user')
}

export function setStoredUser(name: string): void {
  localStorage.setItem('izpiti_user', name)
}

export function clearStoredUser(): void {
  localStorage.removeItem('izpiti_user')
}

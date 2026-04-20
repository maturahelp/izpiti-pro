type UserIdentity = {
  email?: string | null
  user_metadata?: {
    name?: string | null
  } | null
} | null | undefined

function normalizeDisplayValue(value?: string | null) {
  return value?.trim() || ''
}

export function getUserDisplayName(user: UserIdentity) {
  const metadataName = normalizeDisplayValue(user?.user_metadata?.name)
  if (metadataName) return metadataName

  const emailLocalPart = normalizeDisplayValue(user?.email?.split('@')[0])
  if (!emailLocalPart) return ''

  return emailLocalPart.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function getUserFirstName(user: UserIdentity) {
  const displayName = getUserDisplayName(user)
  return displayName ? displayName.split(' ')[0] : 'Ученик'
}

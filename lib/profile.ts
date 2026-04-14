export type UserRole = 'student' | 'admin'
export type SubscriptionPlan = 'free' | 'premium'
export type UserClass = '7' | '12' | null

export interface UserProfile {
  id: string
  name: string
  role: UserRole
  class: UserClass
  exam_path: string
  plan: SubscriptionPlan
  streak_days: number
  is_active: boolean
  plan_expires_at: string | null
}

export const USER_PROFILE_COLUMNS = [
  'id',
  'name',
  'role',
  'class',
  'exam_path',
  'plan',
  'streak_days',
  'is_active',
  'plan_expires_at',
].join(', ')

export function isAdminProfile(profile: Pick<UserProfile, 'role'> | null | undefined) {
  return profile?.role === 'admin'
}

export function hasActivePremiumPlan(
  profile: Pick<UserProfile, 'plan' | 'plan_expires_at'> | null | undefined
) {
  if (!profile || profile.plan !== 'premium') {
    return false
  }

  if (!profile.plan_expires_at) {
    return true
  }

  return new Date(profile.plan_expires_at).getTime() >= Date.now()
}

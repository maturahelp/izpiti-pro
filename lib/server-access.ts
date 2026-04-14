import 'server-only'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { USER_PROFILE_COLUMNS, type UserProfile } from '@/lib/profile'

export const getServerAccess = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(USER_PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle()

  return {
    user,
    profile: (profile as UserProfile | null) ?? null,
  }
})

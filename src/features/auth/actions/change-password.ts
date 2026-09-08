'use server'

import { redirect } from 'next/navigation'
import { ApiError, apiFetch } from '@/lib/api/server'
import { clearSession } from './session-store'
import type { ChangePasswordInput } from '../types'

/**
 * Replace the signed-in user's password. The API revokes every refresh token
 * for the account on success — the temporary password was shared with whoever
 * created it, so any session it authorised has to end — which leaves this
 * session unable to refresh. Rather than let it expire mid-task, sign out and
 * send the user back to /login to sign in with the password they just chose.
 */
export async function changePassword(input: ChangePasswordInput): Promise<{ error?: string }> {
  try {
    await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: input.currentPassword,
        new_password: input.newPassword,
      }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to change password' }
  }

  await clearSession()
  redirect('/login?changed=1')
}

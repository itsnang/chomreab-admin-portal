export type UserRole = 'admin' | 'teacher'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  /** True while the account still carries the temporary password an admin
   *  generated for it. The dashboard holds the user on /change-password until
   *  they replace it. */
  mustChangePassword: boolean
  schoolId: string
}

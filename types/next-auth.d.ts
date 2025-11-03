import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      teamId?: string | null // ✅ make optional — sometimes user may not belong to a team
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name?: string | null
    teamId?: string | null // ✅ optional to prevent type errors during signup or admin accounts
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    teamId?: string | null // ✅ same reason as above
  }
}


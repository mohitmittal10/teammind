import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      teamId: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    teamId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    teamId: string
  }
}


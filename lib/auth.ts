import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Find user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // Validate user and password type
        if (!user || typeof user.password !== 'string') {
          throw new Error('Invalid credentials')
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        // Return minimal user data to NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          teamId: user.teamId ?? null,
        }
      },
    }),
  ],

  pages: {
    signIn: '/login', // Custom sign-in page
  },

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.teamId = (user as any).teamId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.teamId = token.teamId as string | undefined
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

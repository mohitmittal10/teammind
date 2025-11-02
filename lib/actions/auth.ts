'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  teamId: z.string().min(1),
})

export async function signup(formData: FormData) {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      teamId: formData.get('teamId') as string,
    }

    console.log('Signup attempt with data:', {
      email: rawData.email,
      hasPassword: !!rawData.password,
      name: rawData.name,
      teamId: rawData.teamId,
    })

    const validated = signupSchema.safeParse(rawData)
    if (!validated.success) {
      console.error('Validation failed:', validated.error.errors)
      return { error: 'Invalid input data' }
    }

    const { email, password, name, teamId } = validated.data

    // Check if team exists by name (teams are hardcoded: A-Team, B-Team, C-Team)
    console.log('Looking up team by name:', teamId)
    const team = await prisma.team.findUnique({
      where: { name: teamId },
    })

    if (!team) {
      console.error('Team not found:', teamId)
      // List available teams for debugging
      const allTeams = await prisma.team.findMany()
      console.error('Available teams:', allTeams.map(t => t.name))
      return { error: 'Invalid team selected' }
    }

    console.log('Team found:', { id: team.id, name: team.name })

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: 'User already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        teamId: team.id,
      },
    })

    // Return success - redirect will be handled client-side
    return { success: true }
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Provide more specific error messages
    if (error?.code === 'P2002') {
      // Unique constraint violation
      if (error?.meta?.target?.includes('email')) {
        return { error: 'Email already exists. Please use a different email.' }
      }
    }
    
    if (error?.code === 'P2003') {
      // Foreign key constraint violation
      return { error: 'Invalid team selected. Please select a valid team.' }
    }
    
    // Log full error for debugging
    console.error('Full signup error details:', JSON.stringify(error, null, 2))
    
    return { 
      error: error?.message || 'Failed to create account. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }
  }
}


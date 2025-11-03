import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create teams
  const teams = ['A-Team', 'B-Team', 'C-Team']
  
  for (const teamName of teams) {
    await prisma.team.upsert({
      where: { name: teamName },
      update: {},
      create: {
        name: teamName,
      },
    })
  }

  console.log('Teams seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




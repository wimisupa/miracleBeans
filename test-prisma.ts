import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
prisma.family.findMany({ include: { _count: { select: { members: true } } } })
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect())

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting family migration...')

    // 1. Check if the default family already exists to avoid duplicates
    let defaultFamily = await prisma.family.findFirst({
        where: { name: 'wimiheros' }
    })

    if (!defaultFamily) {
        console.log('Default family not found. Creating wimiheros...')
        defaultFamily = await prisma.family.create({
            data: {
                name: 'wimiheros',
                motto: '느리지만 쿨한 가족',
                location: '서귀포시 위미리'
            }
        })
        console.log(`Created default family with ID: ${defaultFamily.id}`)
    } else {
        console.log(`Default family already exists with ID: ${defaultFamily.id}`)
    }

    // 2. Assign all members to this family who don't have one
    const membersWithoutFamily = await prisma.member.findMany({
        where: { familyId: null }
    })

    console.log(`Found ${membersWithoutFamily.length} members without a family.`)

    for (const member of membersWithoutFamily) {
        await prisma.member.update({
            where: { id: member.id },
            data: { familyId: defaultFamily.id }
        })
        console.log(`Assigned member ${member.name} (ID: ${member.id}) to family ${defaultFamily.name}`)
    }

    console.log('Migration completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

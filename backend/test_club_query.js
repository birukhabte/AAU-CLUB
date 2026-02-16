const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing club query...");
        const limit = 12;
        const skip = 0;
        const where = { status: 'ACTIVE' };

        const clubs = await prisma.club.findMany({
            where,
            skip,
            take: parseInt(limit),
            include: {
                leader: {
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                },
                _count: {
                    select: {
                        memberships: { where: { status: 'APPROVED' } },
                        events: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        console.log("Clubs found:", clubs.length);
    } catch (error) {
        console.error("Error fetching clubs:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

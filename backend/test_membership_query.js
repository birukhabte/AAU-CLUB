const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing membership query...");
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log("No users found");
            return;
        }
        console.log("Using user:", user.id);

        const memberships = await prisma.membership.findMany({
            where: { userId: user.id },
            include: {
                club: {
                    include: {
                        leader: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                        _count: {
                            select: { memberships: { where: { status: 'APPROVED' } } },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        console.log("Memberships found:", memberships.length);
    } catch (error) {
        console.error("Error fetching memberships:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing category query...");
        const clubs = await prisma.club.findMany({
            select: { category: true },
            distinct: ['category'],
        });
        console.log("Categories found:", clubs.length);
    } catch (error) {
        console.error("Error fetching categories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

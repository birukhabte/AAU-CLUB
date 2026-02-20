const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserRole() {
    try {
        const email = process.argv[2];
        const role = process.argv[3];

        if (!email || !role) {
            console.log('Usage: node update-user-role.js <email> <role>');
            console.log('Example: node update-user-role.js user@aau.edu.et ADMIN');
            console.log('Valid roles: ADMIN, CLUB_LEADER, MEMBER');
            process.exit(1);
        }

        if (!['ADMIN', 'CLUB_LEADER', 'MEMBER'].includes(role)) {
            console.error('❌ Invalid role. Must be ADMIN, CLUB_LEADER, or MEMBER');
            process.exit(1);
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`❌ User with email ${email} not found`);
            process.exit(1);
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        console.log('✅ User role updated successfully!');
        console.log(`   Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   New Role: ${updatedUser.role}`);
    } catch (error) {
        console.error('❌ Error updating user role:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserRole();

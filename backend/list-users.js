const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
            },
            orderBy: { role: 'asc' },
        });

        if (users.length === 0) {
            console.log('❌ No users found in database');
            console.log('💡 Run: node src/utils/seed.js to create sample users');
            process.exit(0);
        }

        console.log(`\n📋 Found ${users.length} users:\n`);
        
        const admins = users.filter(u => u.role === 'ADMIN');
        const leaders = users.filter(u => u.role === 'CLUB_LEADER');
        const members = users.filter(u => u.role === 'MEMBER');

        if (admins.length > 0) {
            console.log('👑 ADMINS:');
            admins.forEach(u => {
                console.log(`   ${u.firstName} ${u.lastName} - ${u.email} ${u.isActive ? '✓' : '✗'}`);
            });
            console.log('');
        }

        if (leaders.length > 0) {
            console.log('👤 CLUB LEADERS:');
            leaders.forEach(u => {
                console.log(`   ${u.firstName} ${u.lastName} - ${u.email} ${u.isActive ? '✓' : '✗'}`);
            });
            console.log('');
        }

        if (members.length > 0) {
            console.log('👥 MEMBERS:');
            members.forEach(u => {
                console.log(`   ${u.firstName} ${u.lastName} - ${u.email} ${u.isActive ? '✓' : '✗'}`);
            });
            console.log('');
        }

        console.log('💡 To update a user role, run:');
        console.log('   node update-user-role.js <email> <ADMIN|CLUB_LEADER|MEMBER>');
    } catch (error) {
        console.error('❌ Error listing users:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();

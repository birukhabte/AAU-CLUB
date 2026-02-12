const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding RBAC test data...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aau.edu.et' },
    update: {},
    create: {
      email: 'admin@aau.edu.et',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Created admin:', admin.email);

  // Create clubs
  const club1 = await prisma.club.upsert({
    where: { name: 'Tech Club' },
    update: {},
    create: {
      name: 'Tech Club',
      description: 'A club for technology enthusiasts',
      category: 'Technology',
      status: 'ACTIVE',
      leaderId: admin.id, // Temporary, will be updated
    },
  });

  const club2 = await prisma.club.upsert({
    where: { name: 'Sports Club' },
    update: {},
    create: {
      name: 'Sports Club',
      description: 'A club for sports lovers',
      category: 'Sports',
      status: 'ACTIVE',
      leaderId: admin.id, // Temporary, will be updated
    },
  });

  // Create club leaders
  const leaderPassword = await bcrypt.hash('leader123', 10);
  
  const leader1 = await prisma.user.upsert({
    where: { email: 'leader1@aau.edu.et' },
    update: {},
    create: {
      email: 'leader1@aau.edu.et',
      password: leaderPassword,
      firstName: 'John',
      lastName: 'Leader',
      role: 'CLUB_LEADER',
      clubId: club1.id,
      isActive: true,
    },
  });

  const leader2 = await prisma.user.upsert({
    where: { email: 'leader2@aau.edu.et' },
    update: {},
    create: {
      email: 'leader2@aau.edu.et',
      password: leaderPassword,
      firstName: 'Jane',
      lastName: 'Leader',
      role: 'CLUB_LEADER',
      clubId: club2.id,
      isActive: true,
    },
  });

  // Update clubs with proper leaders
  await prisma.club.update({
    where: { id: club1.id },
    data: { leaderId: leader1.id },
  });

  await prisma.club.update({
    where: { id: club2.id },
    data: { leaderId: leader2.id },
  });

  console.log('Created club leaders:', leader1.email, leader2.email);

  // Create member users
  const memberPassword = await bcrypt.hash('member123', 10);
  
  const members = [];
  for (let i = 1; i <= 5; i++) {
    const member = await prisma.user.upsert({
      where: { email: `member${i}@aau.edu.et` },
      update: {},
      create: {
        email: `member${i}@aau.edu.et`,
        password: memberPassword,
        firstName: `Member${i}`,
        lastName: 'User',
        role: 'MEMBER',
        isActive: true,
      },
    });
    members.push(member);
  }
  console.log('Created 5 members');

  // Create some memberships
  for (const membership of [
    { userId: members[0].id, clubId: club1.id, status: 'APPROVED' },
    { userId: members[1].id, clubId: club1.id, status: 'APPROVED' },
    { userId: members[2].id, clubId: club2.id, status: 'APPROVED' },
    { userId: members[3].id, clubId: club2.id, status: 'APPROVED' },
  ]) {
    await prisma.membership.upsert({
      where: {
        userId_clubId: {
          userId: membership.userId,
          clubId: membership.clubId,
        },
      },
      update: {},
      create: membership,
    });
  }

  // Create some membership requests
  await prisma.membershipRequest.upsert({
    where: {
      userId_clubId: {
        userId: members[4].id,
        clubId: club1.id,
      },
    },
    update: {},
    create: {
      userId: members[4].id,
      clubId: club1.id,
      status: 'PENDING',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

const seed = async () => {
    console.log('🌱 Seeding database...');

    try {
        // Clean existing data
        await prisma.message.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.announcement.deleteMany();
        await prisma.rSVP.deleteMany();
        await prisma.event.deleteMany();
        await prisma.membership.deleteMany();
        await prisma.club.deleteMany();
        await prisma.user.deleteMany();

        const hashedPassword = await bcrypt.hash('Password123', 12);

        // Create primary Admin
        const admin = await prisma.user.create({
            data: {
                email: 'admin@aau.edu.et',
                password: hashedPassword,
                firstName: 'System',
                lastName: 'Admin',
                studentId: 'ADM001',
                role: 'ADMIN',
                bio: 'System Administrator of AAU Club Management System',
            },
        });

        // Create secondary Admin
        const admin2 = await prisma.user.create({
            data: {
                email: 'admin2@aau.edu.et',
                password: hashedPassword,
                firstName: 'Assistant',
                lastName: 'Admin',
                studentId: 'ADM002',
                role: 'ADMIN',
                bio: 'Secondary administrator for AAU Club Management System',
            },
        });

        // Create Club Leaders
        const leader1 = await prisma.user.create({
            data: {
                email: 'abebe.kebede@aau.edu.et',
                password: hashedPassword,
                firstName: 'Abebe',
                lastName: 'Kebede',
                studentId: 'ETS0201/14',
                role: 'CLUB_LEADER',
                phone: '+251911234567',
                bio: 'Computer Science student passionate about technology and innovation.',
            },
        });

        const leader2 = await prisma.user.create({
            data: {
                email: 'tigist.hailu@aau.edu.et',
                password: hashedPassword,
                firstName: 'Tigist',
                lastName: 'Hailu',
                studentId: 'ETS0305/14',
                role: 'CLUB_LEADER',
                phone: '+251922345678',
                bio: 'Electrical Engineering student and debate champion.',
            },
        });

        const leader3 = await prisma.user.create({
            data: {
                email: 'dawit.mengistu@aau.edu.et',
                password: hashedPassword,
                firstName: 'Dawit',
                lastName: 'Mengistu',
                studentId: 'ETS0412/14',
                role: 'CLUB_LEADER',
                phone: '+251933456789',
                bio: 'Civil Engineering student and environmental enthusiast.',
            },
        });

        // Create Members
        const members = [];
        const memberData = [
            { email: 'sara.tadesse@aau.edu.et', firstName: 'Sara', lastName: 'Tadesse', studentId: 'ETS0500/14' },
            { email: 'yonas.alemu@aau.edu.et', firstName: 'Yonas', lastName: 'Alemu', studentId: 'ETS0501/14' },
            { email: 'meron.bekele@aau.edu.et', firstName: 'Meron', lastName: 'Bekele', studentId: 'ETS0502/14' },
            { email: 'henok.girma@aau.edu.et', firstName: 'Henok', lastName: 'Girma', studentId: 'ETS0503/14' },
            { email: 'hana.solomon@aau.edu.et', firstName: 'Hana', lastName: 'Solomon', studentId: 'ETS0504/14' },
        ];

        for (const m of memberData) {
            const member = await prisma.user.create({
                data: {
                    ...m,
                    password: hashedPassword,
                    role: 'MEMBER',
                },
            });
            members.push(member);
        }

        // Create Clubs
        const techClub = await prisma.club.create({
            data: {
                name: 'AAU Tech Hub',
                description: 'A community for tech enthusiasts at AAU. We explore cutting-edge technologies, host hackathons, conduct coding workshops, and build innovative projects together. Join us to enhance your technical skills and network with like-minded peers.',
                category: 'Technology',
                leaderId: leader1.id,
                meetingDay: 'Saturday',
                meetingTime: '2:00 PM',
                location: 'Block 501, Room 203',
                status: 'ACTIVE',
            },
        });

        const debateClub = await prisma.club.create({
            data: {
                name: 'AAU Debate Society',
                description: 'Sharpen your critical thinking and public speaking skills. We organize weekly debates, participate in inter-university competitions, and foster intellectual discourse on a wide range of topics from politics to philosophy.',
                category: 'Academic',
                leaderId: leader2.id,
                meetingDay: 'Wednesday',
                meetingTime: '3:30 PM',
                location: 'Main Library, Seminar Hall',
                status: 'ACTIVE',
            },
        });

        const greenClub = await prisma.club.create({
            data: {
                name: 'Green Campus Initiative',
                description: 'Dedicated to environmental sustainability at AAU. We organize tree planting campaigns, recycling drives, and awareness programs. Our goal is to make AAU a greener, more sustainable campus.',
                category: 'Environment',
                leaderId: leader3.id,
                meetingDay: 'Friday',
                meetingTime: '4:00 PM',
                location: 'Natural Science Building, Room 101',
                status: 'ACTIVE',
            },
        });

        const artClub = await prisma.club.create({
            data: {
                name: 'AAU Creative Arts Club',
                description: 'A vibrant community celebrating creativity through visual arts, music, photography, and performance. We host exhibitions, open mic nights, and collaborative art projects. Express yourself!',
                category: 'Arts & Culture',
                leaderId: leader1.id,
                meetingDay: 'Thursday',
                meetingTime: '5:00 PM',
                location: 'Student Center, Art Studio',
                status: 'ACTIVE',
            },
        });

        const sportsClub = await prisma.club.create({
            data: {
                name: 'AAU Sports Federation',
                description: 'Your gateway to competitive and recreational sports at AAU. We support basketball, football, athletics, chess, and more. Stay fit, compete, and build team spirit!',
                category: 'Sports',
                leaderId: leader2.id,
                meetingDay: 'Monday',
                meetingTime: '6:00 AM',
                location: 'University Stadium',
                status: 'ACTIVE',
            },
        });

        // Create memberships
        const clubs = [techClub, debateClub, greenClub, artClub, sportsClub];
        const leaders = [leader1, leader2, leader3];

        // Leaders auto-join their clubs
        await prisma.membership.create({
            data: { userId: leader1.id, clubId: techClub.id, status: 'APPROVED', joinedAt: new Date() },
        });
        await prisma.membership.create({
            data: { userId: leader2.id, clubId: debateClub.id, status: 'APPROVED', joinedAt: new Date() },
        });
        await prisma.membership.create({
            data: { userId: leader3.id, clubId: greenClub.id, status: 'APPROVED', joinedAt: new Date() },
        });
        await prisma.membership.create({
            data: { userId: leader1.id, clubId: artClub.id, status: 'APPROVED', joinedAt: new Date() },
        });
        await prisma.membership.create({
            data: { userId: leader2.id, clubId: sportsClub.id, status: 'APPROVED', joinedAt: new Date() },
        });

        // Members join various clubs
        for (const member of members) {
            const numClubs = Math.floor(Math.random() * 3) + 1;
            const shuffled = [...clubs].sort(() => 0.5 - Math.random());
            for (let i = 0; i < numClubs; i++) {
                await prisma.membership.create({
                    data: {
                        userId: member.id,
                        clubId: shuffled[i].id,
                        status: i === 0 ? 'APPROVED' : 'PENDING',
                        joinedAt: i === 0 ? new Date() : null,
                    },
                });
            }
        }

        // Create Events
        const now = new Date();
        const events = [
            {
                title: 'Hackathon 2026',
                description: 'Join our annual 24-hour hackathon! Build innovative solutions, compete for prizes, and showcase your coding skills. Mentors from top tech companies will be available.',
                date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
                time: '9:00 AM',
                location: 'Block 501, Computer Labs',
                capacity: 100,
                clubId: techClub.id,
                creatorId: leader1.id,
            },
            {
                title: 'Inter-University Debate Championship',
                description: 'AAU hosts the annual inter-university debate championship. Top debaters from across Ethiopia will compete. Come watch or participate!',
                date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
                time: '10:00 AM',
                location: 'Main Auditorium',
                capacity: 500,
                clubId: debateClub.id,
                creatorId: leader2.id,
            },
            {
                title: 'Campus Tree Planting Day',
                description: 'Help us plant 500 trees across campus. Gloves and tools provided. Let\'s make our campus greener together!',
                date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
                time: '8:00 AM',
                location: 'University Main Gate',
                capacity: 200,
                clubId: greenClub.id,
                creatorId: leader3.id,
            },
            {
                title: 'Art Exhibition: Colors of Ethiopia',
                description: 'A stunning exhibition showcasing student artwork inspired by Ethiopian culture, landscapes, and traditions. Free entry for all students.',
                date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
                time: '3:00 PM',
                location: 'Student Center Gallery',
                clubId: artClub.id,
                creatorId: leader1.id,
            },
            {
                title: 'Inter-Department Football Tournament',
                description: 'Annual football tournament between departments. Register your team and compete for the championship trophy!',
                date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30),
                time: '2:00 PM',
                location: 'University Stadium',
                capacity: 16,
                clubId: sportsClub.id,
                creatorId: leader2.id,
            },
        ];

        for (const eventData of events) {
            const event = await prisma.event.create({ data: eventData });

            // Add some RSVPs
            for (let i = 0; i < Math.min(3, members.length); i++) {
                await prisma.rSVP.create({
                    data: {
                        userId: members[i].id,
                        eventId: event.id,
                        status: 'GOING',
                    },
                });
            }
        }

        // Create Announcements
        const announcements = [
            {
                title: 'Welcome to the New Semester!',
                content: 'Welcome back to AAU Tech Hub! This semester we have exciting plans including workshops on AI, web development bootcamps, and our flagship Hackathon 2026. Stay tuned for more details!',
                priority: 'high',
                clubId: techClub.id,
                authorId: leader1.id,
            },
            {
                title: 'Debate Practice Sessions',
                content: 'Weekly practice sessions are now open. Every Wednesday at 3:30 PM in the Main Library Seminar Hall. All skill levels welcome. Bring your passion for intellectual discourse!',
                priority: 'normal',
                clubId: debateClub.id,
                authorId: leader2.id,
            },
            {
                title: 'Volunteering Opportunity',
                content: 'We need volunteers for next week\'s campus cleanup drive. Sign up in the club office or respond to this announcement. Every hand counts!',
                priority: 'urgent',
                clubId: greenClub.id,
                authorId: leader3.id,
            },
        ];

        for (const ann of announcements) {
            await prisma.announcement.create({ data: ann });
        }

        // Create Notifications for members
        for (const member of members) {
            await prisma.notification.create({
                data: {
                    title: 'Welcome to AAU Club System!',
                    message: 'Your account has been created. Explore clubs, join communities, and participate in events.',
                    type: 'system',
                    userId: member.id,
                },
            });
        }

        console.log('✅ Database seeded successfully!');
        console.log(`   👑 Admin 1: admin@aau.edu.et / Password123`);
        console.log(`   👑 Admin 2: admin2@aau.edu.et / Password123`);
        console.log(`   👤 Leader 1: abebe.kebede@aau.edu.et / Password123`);
        console.log(`   👤 Leader 2: tigist.hailu@aau.edu.et / Password123`);
        console.log(`   👤 Leader 3: dawit.mengistu@aau.edu.et / Password123`);
        console.log(`   👥 Members: sara.tadesse@aau.edu.et / Password123 (and 4 more)`);
        console.log(`   🏛️  Clubs: ${clubs.length} created`);
        console.log(`   📅 Events: ${events.length} created`);
        console.log(`   📢 Announcements: ${announcements.length} created`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

seed();

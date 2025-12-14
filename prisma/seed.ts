import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@aitutor.com' },
        update: {},
        create: {
            email: 'admin@aitutor.com',
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Create a test student user
    const studentUser = await prisma.user.upsert({
        where: { email: 'student@aitutor.com' },
        update: {},
        create: {
            email: 'student@aitutor.com',
            name: 'Test Student',
            role: 'STUDENT',
        },
    });

    console.log('✅ Created student user:', studentUser.email);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

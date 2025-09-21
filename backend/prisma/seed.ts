import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Qa@123123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@aiimage.com' },
    update: {},
    create: {
      email: 'admin@aiimage.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: userPassword,
      name: 'Test User',
      credits: 50,
      isActive: true,
      isVerified: true
    }
  });

  console.log('✅ Test user created:', user.email);

  // Create system configurations
  const configs = [
    {
      key: 'max_file_size',
      value: '10485760',
      type: 'NUMBER' as const
    },
    {
      key: 'default_user_credits',
      value: '10',
      type: 'NUMBER' as const
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'BOOLEAN' as const
    },
    {
      key: 'site_name',
      value: 'AI Image Processing',
      type: 'STRING' as const
    }
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config
    });
  }

  console.log('✅ System configurations created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

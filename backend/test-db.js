const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Test schema
    const users = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        createdAt: true
      }
    });
    
    console.log('Sample user:', users[0]);
    console.log('✅ Database is working correctly!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();

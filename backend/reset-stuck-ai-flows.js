const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetStuckAIFlows() {
  try {
    // Find AI flows that have been processing for more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const stuckFlows = await prisma.productAIFlow.findMany({
      where: {
        status: 'processing',
        updated_at: {
          lt: fiveMinutesAgo
        }
      }
    });

    console.log(`Found ${stuckFlows.length} stuck AI flows`);

    for (const flow of stuckFlows) {
      await prisma.productAIFlow.update({
        where: { id: flow.id },
        data: {
          status: 'error',
          error_message: 'Processing timeout - OpenRouter API quota exceeded'
        }
      });
      console.log(`Reset AI flow ${flow.id}`);
    }

    console.log('Reset completed');
  } catch (error) {
    console.error('Error resetting stuck AI flows:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetStuckAIFlows();


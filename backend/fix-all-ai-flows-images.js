const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllAIFlowsImages() {
  try {
    // Get all AI flows with status 'done'
    const aiFlows = await prisma.productAIFlow.findMany({
      where: { status: 'done' }
    });

    console.log(`Found ${aiFlows.length} AI flows to fix`);

    for (const flow of aiFlows) {
      if (flow.ai_result) {
        const aiResult = JSON.parse(flow.ai_result);
        
        if (aiResult.painpoints && Array.isArray(aiResult.painpoints)) {
          // Fix image URLs
          aiResult.painpoints = aiResult.painpoints.map((painpoint, index) => ({
            ...painpoint,
            image_url: painpoint.image_url && painpoint.image_url.trim() !== '' 
              ? painpoint.image_url 
              : `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center&text=${encodeURIComponent(painpoint.name)}`
          }));

          // Update the AI flow
          await prisma.productAIFlow.update({
            where: { id: flow.id },
            data: {
              ai_result: JSON.stringify(aiResult)
            }
          });

          console.log(`Fixed AI flow: ${flow.title}`);
        }
      }
    }

    console.log('All AI flows fixed successfully');
  } catch (error) {
    console.error('Error fixing AI flows:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllAIFlowsImages();











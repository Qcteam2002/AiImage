const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateNewAIFlowWithMock() {
  try {
    const aiFlowId = 'd10ad652-6887-47fe-83d3-1d7f684a3ab6';
    
    const mockResult = {
      painpoints: [
        {
          name: "Không khí khô gây khó chịu",
          description: "Trong môi trường máy lạnh hoặc mùa hanh khô, không khí thường bị khô, dẫn đến các vấn đề như da khô, môi nứt nẻ, đau họng, và khó thở.",
          solution: "Máy tạo độ ẩm giúp duy trì độ ẩm lý tưởng trong không khí, giảm thiểu các triệu chứng khó chịu do không khí khô gây ra.",
          image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center"
        },
        {
          name: "Không gian sống thiếu điểm nhấn",
          description: "Nhiều người muốn trang trí không gian sống của mình nhưng khó tìm được sản phẩm vừa hữu ích vừa mang tính thẩm mỹ độc đáo.",
          solution: "Với thiết kế tinh xảo, sản phẩm không chỉ hữu ích mà còn là một món đồ trang trí nghệ thuật, làm tăng thêm vẻ sang trọng cho căn phòng.",
          image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center"
        },
        {
          name: "Bụi bẩn và dị ứng trong không khí",
          description: "Không khí khô có thể làm bụi bẩn và các tác nhân gây dị ứng lơ lửng lâu hơn, gây ảnh hưởng đến sức khỏe đường hô hấp.",
          solution: "Máy tạo độ ẩm giúp các hạt bụi và tác nhân gây dị ứng kết tụ và lắng xuống, làm sạch không khí và giảm nguy cơ dị ứng.",
          image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center"
        },
        {
          name: "Giấc ngủ không sâu",
          description: "Không khí khô có thể gây khó chịu ở đường hô hấp, dẫn đến tình trạng ngủ không sâu giấc, thức giấc giữa đêm.",
          solution: "Với khả năng cân bằng độ ẩm và hoạt động êm ái, máy tạo độ ẩm giúp cải thiện chất lượng không khí, mang lại giấc ngủ sâu và ngon hơn.",
          image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center"
        },
        {
          name: "Phải liên tục bổ sung nước",
          description: "Nhiều máy tạo độ ẩm thông thường có dung tích nhỏ, yêu cầu người dùng phải đổ nước thường xuyên, gây bất tiện.",
          solution: "Máy tạo độ ẩm có dung tích lớn và thiết kế tiện lợi, cho phép sản phẩm hoạt động liên tục trong thời gian dài mà không cần thường xuyên đổ thêm nước.",
          image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center"
        }
      ]
    };

    await prisma.productAIFlow.update({
      where: { id: aiFlowId },
      data: {
        status: 'done',
        ai_result: JSON.stringify(mockResult),
        generated_at: new Date()
      }
    });

    console.log('New AI Flow updated with mock data successfully');
  } catch (error) {
    console.error('Error updating AI flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateNewAIFlowWithMock();






















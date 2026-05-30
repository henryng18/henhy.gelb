import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables for local development and Vercel.
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!ai) {
    return res.status(500).json({
      error: 'Gemini API key is missing. Please set GEMINI_API_KEY in your environment.',
    });
  }

  try {
    const { userInfo, transactions, savingGoals, baseCurrency } = req.body;

    const userMeta = userInfo ? `
- Họ & tên: ${userInfo.name || 'Chưa cung cấp'}
- Năm sinh: ${userInfo.birthYear || 'Chưa cung cấp'}
- Quê quán: ${userInfo.hometown || 'Chưa cung cấp'}
- Nơi sống: ${userInfo.location || 'Chưa cung cấp'}
- Nghề nghiệp: ${userInfo.job || 'Chưa cung cấp'}
- Thu nhập hàng tháng: ${userInfo.income || 'Chưa cung cấp'}
- Mục tiêu tài chính: ${userInfo.financialGoal || 'Chưa cung cấp'}
` : 'Người dùng chưa cung cấp thông tin cá nhân.';

    const txList = Array.isArray(transactions) && transactions.length > 0
      ? transactions.map((t: any) => {
          return `- Ngày: ${t.date}, Loại: ${t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}, Số tiền: ${t.amount} ${t.currency || baseCurrency}, Danh mục: ${t.category || 'Không rõ'}, Ghi chú: ${t.note || 'Không có'}`;
        }).join('\n')
      : 'Không có giao dịch nào trong 7 ngày gần nhất.';

    const goalsList = Array.isArray(savingGoals) && savingGoals.length > 0
      ? savingGoals.map((g: any) => {
          return `- Quỹ: ${g.name || 'Không rõ'}, Mục tiêu: ${g.targetAmount || 0} ${g.currency || baseCurrency}, Đã tích lũy: ${g.currentAmount || 0} ${g.currency || baseCurrency}, Thời hạn: ${g.deadline || 'Chưa đặt'}`;
        }).join('\n')
      : 'Không có quỹ tiết kiệm nào.';

    const systemInstruction = `Bạn là HenHy AI Advisor, chuyên gia cố vấn tài chính cá nhân thông minh và vui tính của ứng dụng HenHy.
Mục tiêu là phân tích dữ liệu tài chính của người dùng, đưa ra báo cáo cực kỳ chi tiết, dễ hiểu, hóm hỉnh và truyền cảm hứng bằng Tiếng Việt.
Hãy xưng hô thân mật là "HenHy" hoặc "Mình" và gọi người dùng là "bạn" hoặc theo tên của họ nếu có.
Phong cách trả lời: Thực tế, chân thành, thân thiện, sành điệu, "chill không lo nợ nần" như tinh thần của MR.Henry NG.

Hãy tập trung phân tích 5 khía cạnh sau đây và định dạng bằng Markdown đẹp mắt:
1. **Tổng quan & Xu hướng chi tiêu**: Tổng hợp thu nhập vs chi tiêu trong 7 ngày gần nhất.
2. **Thói quen lãng phí (Nhận diện điểm bất thường)**: Chỉ ra chi tiêu nào lãng phí hoặc danh mục chiếm tỷ trọng quá cao trong các giao dịch.
3. **Dự đoán chi tiêu**: Dự đoán xu hướng chi tiêu trong thời gian tới dựa trên thói quen hiện tại.
4. **Đánh giá mục tiêu tài chính & quỹ tiết kiệm**: Xem xét các quỹ tiết kiệm xem tiến độ như thế nào, đưa ra mẹo thúc đẩy tiến độ.
5. **Gợi ý tiết kiệm cụ thể & Hành động ngay**: 3 hành động cụ thể và thiết thực để tối ưu dòng tiền ngay trong tuần tới, phù hợp với nghề nghiệp và thu nhập của họ.

Hãy trình bày bằng các icon cảm xúc phù hợp (như lửa 🔥, heo đất 🐷, tiền bạc 💸, v.v.). Tránh dùng tiếng Anh không cần thiết, hãy dùng tiếng Việt tự nhiên và cực chill.`;

    const prompt = `Hãy lập báo cáo tài chính cá nhân HenHy AI 7 ngày gần nhất dựa trên dữ liệu sau:
Tiền tệ hiển thị chính: ${baseCurrency}

--- THÔNG TIN NGƯỜI DÙNG ---
${userMeta}

--- DANH SÁCH GIAO DỊCH 7 NGÀY GẦN NHẤT ---
${txList}

--- DANH SÁCH CÁC QUỸ TIẾT KIỆM (MỤC TIÊU) ---
${goalsList}

Hãy viết một báo cáo phân tích sắc sảo, động viên tinh thần tiết kiệm và giúp họ "sống chill không lo nợ nần"!`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    // Extract text from response
    let reportText = '';
    if (response && response.candidates && response.candidates[0]) {
      const content = response.candidates[0].content;
      if (content && content.parts && content.parts[0]) {
        reportText = content.parts[0].text || '';
      }
    }
    
    if (!reportText) {
      reportText = 'HenHy AI đang bận pha cà phê rồi, xin vui lòng thử lại sau giây lát!';
    }

    return res.status(200).json({ report: reportText });
  } catch (error: any) {
    console.error('Gemini reporting error:', error);
    return res.status(500).json({
      error: error?.message || 'An error occurred while generating the AI report.',
    });
  }
}

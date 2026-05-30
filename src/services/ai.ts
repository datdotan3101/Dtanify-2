const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export interface FlashcardData {
  meaning: string;
  pronunciation: string;
  examples: string[];
}

export const generateFlashcardData = async (word: string): Promise<FlashcardData | null> => {
  if (!API_KEY) {
    console.error("Gemini API key is missing");
    return null;
  }

  const prompt = `
Bạn là một chuyên gia ngôn ngữ. Hãy phân tích từ vựng tiếng Anh sau đây: "${word}".
Trả về một JSON object hợp lệ (không chứa markdown code block, chỉ chứa chuỗi JSON) với định dạng chính xác như sau:
{
  "meaning": "Nghĩa tiếng Việt của từ (ngắn gọn, dễ hiểu)",
  "pronunciation": "Phiên âm quốc tế IPA",
  "examples": [
    "Câu ví dụ 1 bằng tiếng Anh có chứa từ này",
    "Câu ví dụ 2 bằng tiếng Anh có chứa từ này"
  ]
}
Chỉ trả về JSON, không thêm bất kỳ văn bản nào khác.
`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text) as FlashcardData;
    }
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
  }
  
  return null;
};

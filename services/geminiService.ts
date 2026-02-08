
import { GoogleGenAI, Type } from "@google/genai";
import { Grade, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateQuestions = async (
  keyword: string, 
  grade: Grade, 
  fileData?: { data: string; mimeType: string },
  contextText?: string
): Promise<Question[]> => {
  const chars = keyword.replace(/\s/g, "").toUpperCase().split("");
  
  const textPart = {
    text: `Hãy tạo ${chars.length} câu hỏi trắc nghiệm Tin học lớp ${grade} dành cho giáo dục.
    ${fileData ? "Dựa trên nội dung tài liệu đính kèm này để đặt câu hỏi chính xác hơn." : ""}
    ${contextText ? `Dựa trên nội dung văn bản sau đây để đặt câu hỏi:\n\n${contextText}` : ""}
    Mỗi câu hỏi phải có đáp án là một khái niệm liên quan đến kí tự trong từ khóa: "${keyword}".
    Danh sách các kí tự cần gắn với mỗi câu hỏi theo thứ tự là: ${chars.join(", ")}.
    Đảm bảo câu hỏi có kiến thức chuẩn theo chương trình phổ thông.
    Đầu ra là một mảng JSON các đối tượng câu hỏi.`
  };

  const parts: any[] = [textPart];
  
  // Chỉ gửi inlineData nếu là PDF hoặc Image vì Gemini hỗ trợ tốt các định dạng này qua inlineData
  if (fileData && (fileData.mimeType.includes('pdf') || fileData.mimeType.includes('image'))) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Nội dung câu hỏi" },
            options: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
              },
              required: ["A", "B", "C", "D"],
            },
            correctAnswer: { type: Type.STRING, enum: ["A", "B", "C", "D"], description: "Đáp án đúng" },
          },
          required: ["text", "options", "correctAnswer"],
        },
      },
    },
  });

  const rawQuestions = JSON.parse(response.text || "[]");
  
  return rawQuestions.map((q: any, index: number) => ({
    ...q,
    id: index,
    keywordChar: chars[index],
  }));
};

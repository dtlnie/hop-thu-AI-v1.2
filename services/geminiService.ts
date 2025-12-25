
import { GoogleGenAI } from "@google/genai";
import { PersonaType, RiskLevel } from "../types.ts";
import { SYSTEM_PROMPT, PERSONAS } from "../constants.tsx";

export const getGeminiStreamResponse = async (
  message: string, 
  personaId: PersonaType, 
  history: {role: string, content: string}[],
  userMemory: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
) => {
  try {
    // Luôn khởi tạo instance mới để tránh các lỗi trạng thái cũ
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    if (!process.env.API_KEY) {
      return {
        reply: "Hệ thống chưa nhận được chìa khóa API. Vui lòng kiểm tra lại cấu hình Environment Variables trên Vercel.",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }

    const persona = PERSONAS.find(p => p.id === personaId);
    const dynamicPrompt = SYSTEM_PROMPT
      .replace("{persona_name}", persona?.name || "")
      .replace("{persona_role}", persona?.role || "")
      .replace("{user_memory}", userMemory || "Mới bắt đầu trò chuyện.");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ 
          role: h.role === 'user' ? 'user' : 'model', 
          parts: [{ text: h.content }] 
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: dynamicPrompt,
        responseMimeType: "application/json",
      }
    });

    const fullText = response.text || "";
    
    try {
      // Làm sạch dữ liệu rác nếu AI trả về kèm tag ```json
      const cleanJson = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return {
        reply: fullText || "Mình đang lắng nghe, bạn cứ nói tiếp đi...",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    console.error("Lỗi kết nối AI:", error);
    if (error.name === 'AbortError') throw error;
    
    return {
      reply: "Có chút trục trặc khi kết nối với tâm hồn mình rồi. Bạn thử gửi lại tin nhắn xem sao nhé?",
      riskLevel: RiskLevel.GREEN,
      new_insights: ""
    };
  }
};

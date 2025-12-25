
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
    // Khởi tạo instance mới ngay trước khi gọi để tránh lỗi kết nối cũ
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const persona = PERSONAS.find(p => p.id === personaId);
    
    const dynamicPrompt = SYSTEM_PROMPT
      .replace("{persona_name}", persona?.name || "")
      .replace("{persona_role}", persona?.role || "")
      .replace("{user_memory}", userMemory || "Chưa có thông tin cũ.");

    const result = await ai.models.generateContent({
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
    }, { signal });

    const fullText = result.text || "";
    
    try {
      // Làm sạch dữ liệu rác nếu AI trả về kèm markdown
      const cleanJson = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (e) {
      console.warn("AI không trả về JSON chuẩn, đang trả về text thuần.");
      return {
        reply: fullText || "Mình đang lắng nghe đây, bạn nói tiếp đi...",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    
    // Log lỗi chi tiết để kiểm tra trên Vercel console
    console.error("Gemini API Error Detail:", error.message);
    
    return {
      reply: "Mình gặp chút khó khăn khi kết nối. Bạn kiểm tra lại mạng hoặc thử gửi lại tin nhắn nhé!",
      riskLevel: RiskLevel.GREEN,
      new_insights: ""
    };
  }
};

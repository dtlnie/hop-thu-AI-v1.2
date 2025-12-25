
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
    // Khởi tạo SDK theo chuẩn mới nhất
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const persona = PERSONAS.find(p => p.id === personaId);
    
    const dynamicPrompt = SYSTEM_PROMPT
      .replace("{persona_name}", persona?.name || "")
      .replace("{persona_role}", persona?.role || "")
      .replace("{user_memory}", userMemory || "Chưa có dữ liệu cũ.");

    // Sử dụng model 'gemini-3-flash-preview' cho các tác vụ text nhanh
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.slice(-4).map(h => ({ 
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
      // Làm sạch dữ liệu rác nếu có
      const cleanJson = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Dữ liệu trả về không phải JSON chuẩn:", fullText);
      return {
        reply: fullText || "Mình đang ở đây lắng nghe bạn.",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    console.error("Lỗi Gemini API:", error);
    // Nếu lỗi 404 hoặc 403, có thể do model hoặc API key
    if (error.message?.includes("not found")) {
      return {
        reply: "Hệ thống đang bảo trì Model, bạn quay lại sau nhé!",
        riskLevel: RiskLevel.GREEN
      };
    }
    throw error;
  }
};

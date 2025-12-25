
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const persona = PERSONAS.find(p => p.id === personaId);
    
    const dynamicPrompt = SYSTEM_PROMPT
      .replace("{persona_name}", persona?.name || "")
      .replace("{persona_role}", persona?.role || "")
      .replace("{user_memory}", userMemory || "Chưa có thông tin cũ.");

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
    }, { signal });

    const fullText = response.text || "";
    
    try {
      // Làm sạch text nếu AI trả về markdown JSON
      const cleanJson = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (e) {
      console.error("JSON Parse Error:", fullText);
      return {
        reply: fullText || "Mình đang suy nghĩ một chút, bạn chờ tí nhé.",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    console.error("Gemini API Error:", error);
    return {
      reply: "Hệ thống đang bận một chút, bạn thử gửi lại tin nhắn cho mình nhé!",
      riskLevel: RiskLevel.GREEN,
      new_insights: ""
    };
  }
};


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
    // Vite sẽ thay thế process.env.API_KEY bằng giá trị thực tế lúc build
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      throw new Error("MISSING_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });
    const persona = PERSONAS.find(p => p.id === personaId);
    
    const dynamicPrompt = SYSTEM_PROMPT
      .replace("{persona_name}", persona?.name || "")
      .replace("{persona_role}", persona?.role || "")
      .replace("{user_memory}", userMemory || "Đây là lần đầu học sinh này nhắn tin.");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.slice(-6).map(h => ({ 
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
      const cleanJson = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return {
        reply: fullText,
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    console.error("Lỗi AI:", error);
    
    if (error.message === "MISSING_API_KEY") {
      return {
        reply: "⚠️ Lỗi: Chưa tìm thấy API Key. Bạn hãy kiểm tra đã thêm 'API_KEY' vào Vercel Environment Variables và thực hiện REDEPLOY chưa nhé!",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
    
    return {
      reply: "Mình đang gặp chút trục trặc khi kết nối với bộ não AI. Bạn thử nhắn lại sau vài giây hoặc kiểm tra API Key của mình nhé!",
      riskLevel: RiskLevel.GREEN,
      new_insights: ""
    };
  }
};

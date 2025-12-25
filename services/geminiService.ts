
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
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

    const stream = await ai.models.generateContentStream({
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
        thinkingConfig: { thinkingBudget: 0 } 
      }
    }, { signal });

    let fullText = "";
    for await (const chunk of stream) {
      const text = (chunk as GenerateContentResponse).text;
      if (text) {
        fullText += text;
      }
    }

    try {
      const parsed = JSON.parse(fullText);
      return parsed;
    } catch (e) {
      return {
        reply: fullText || "Mình đang suy nghĩ một chút, bạn chờ tí nhé.",
        riskLevel: RiskLevel.GREEN,
        new_insights: ""
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    console.error("Gemini Error:", error);
    return {
      reply: "Có chút trục trặc nhỏ, mình vẫn ở đây lắng nghe bạn nè.",
      riskLevel: RiskLevel.GREEN,
      new_insights: ""
    };
  }
};

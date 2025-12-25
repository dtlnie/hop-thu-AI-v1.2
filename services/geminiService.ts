
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaType, RiskLevel } from "../types";
import { SYSTEM_PROMPT } from "../constants";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (
  message: string, 
  persona: PersonaType, 
  history: {role: string, content: string}[]
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: `Nhân vật: ${persona}. Tin nhắn của tôi: ${message}` }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: Object.values(RiskLevel) },
            reason: { type: Type.STRING }
          },
          required: ["reply", "riskLevel", "reason"]
        }
      }
    });

    const result = await model;
    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reply: "Xin lỗi, mình gặp một chút trục trặc kỹ thuật. Bạn có thể nói lại được không?",
      riskLevel: RiskLevel.GREEN,
      reason: "Error connection"
    };
  }
};

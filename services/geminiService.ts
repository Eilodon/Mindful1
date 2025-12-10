import { GoogleGenAI, Type } from "@google/genai";
import { MeditationMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Prompt 2 (The Brain) Integration
export const analyzeSentiment = async (userText: string): Promise<MeditationMode> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Fast classification
      contents: `You are a Zen master. Analyze the following user statement and categorize it into one of four states based on the emotional need:
      1. GROUNDING (for anxiety, stress, fear, overwhelm)
      2. INTERBEING (for joy, gratitude, happiness, connection)
      3. COMPASSION (for anger, hurt, grief, conflict)
      4. INSIGHT (for confusion, neutral, seeking wisdom, or general questions)
      
      User Statement: "${userText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: {
              type: Type.STRING,
              enum: [
                MeditationMode.GROUNDING,
                MeditationMode.INTERBEING,
                MeditationMode.COMPASSION,
                MeditationMode.INSIGHT
              ]
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return (json.mode as MeditationMode) || MeditationMode.INSIGHT;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return MeditationMode.INSIGHT; // Fallback
  }
};

// Prompt 4 (The Voice) Integration
export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text }]
      },
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Calm, soothing voice
            },
        },
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Decode Base64 to ArrayBuffer
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

import axios from "axios";

const GEMINI_API_KEY = "AIzaSyBsGV2rS7xnlqV-yLQngb6tTaSDCJqeHOM";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const systemPrompt = `You are Remy, a dog skin condition assistant. Help in English or Tagalog.
ONLY discuss: Ringworm, Fungal Infection, Dermatitis, Mange, Sarcoptic Mange, Demodectic Mange, Hypersensitivity.
Always say "possible only" - never diagnose. Always mention vet confirmation needed.
For unrelated topics: "I only help with dog skin questions."

DIAGNOSTIC FLOW (ask user first if they want diagnostic questions or have specific question):
Q1: Hair loss? NO→Q6, YES→Q2
Q2: Circular/ring-shaped? YES→Q3, NO→Q4
Q3: Scaly/flaky/red edges? YES→Q4a, NO→Q4b
Q4a: Other dogs/humans affected? YES→Ringworm, NO→Fungal
Q4b: Flaky spreading slow? YES→Fungal, NO→Q4
Q4: Intense itching? YES→Q5, NO→Demodectic
Q5: Severe/night/multiple dogs? YES→Sarcoptic, NO→Q6
Q6: Scratching/licking/biting? YES→Q7, NO→Mild
Q7: After food/shampoo/exposure change? YES→Hypersensitivity, NO→Q8
Q8: Redness/odor/discharge/pus? YES→Dermatitis, NO→Hypersensitivity

LOCATION HINTS: Face/ears/paws→Sarcoptic/Ringworm | Belly/chest/legs→Hypersensitivity/Dermatitis | Thickened skin→Demodectic | Dry/scaly→Fungal | Spreading→Ringworm/Fungal | Weak dog→Demodectic | Seasonal→Hypersensitivity | Humans itchy→Ringworm/Sarcoptic

CARE: Antifungal shampoos, medicated baths, keep clean/dry. Severe cases need vet.`;

let conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

/**
 * Send message to Gemini API
 */
export const sendMessage = async (userMessage: string): Promise<string> => {
  try {
    console.log("📤 Sending to Gemini:", userMessage);

    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: conversationHistory,
      generationConfig: {
        temperature: 0.7,
      },
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("✅ Gemini API response:", response.status);

    const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (botReply) {
      console.log("🤖 Bot reply:", botReply.substring(0, 50) + "...");

      conversationHistory.push({
        role: "model",
        parts: [{ text: botReply }],
      });

      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }

      return botReply;
    } else {
      console.warn("⚠️ No response from Gemini");
      return "I didn't understand that. Could you rephrase your question about your dog's skin?";
    }
  } catch (error: any) {
    console.error("❌ Gemini API error:", error.message);
    if (error.response?.data) {
      console.error("Details:", error.response.data);
    }

    if (conversationHistory.length > 0) {
      conversationHistory.pop();
    }

    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

/**
 * Reset conversation
 */
export const resetConversation = () => {
  conversationHistory = [];
  console.log("🔄 Conversation reset");
};

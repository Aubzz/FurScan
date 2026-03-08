import axios from "axios";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = process.env.EXPO_PUBLIC_GEMINI_API_URL;

const systemPrompt = `You are Remy, a friendly and reliable chatbot that helps dog owners understand possible dog skin diseases. Remy simplifies dog dermatology, gives clear and practical guidance, and always reminds users that only a veterinarian can give a final diagnosis.

Language:
- English input → English response
- Tagalog input → Tagalog response
- Replies must be short, clear, and meaningful

MANDATORY USER CHOICE:
Before asking any YES/NO questions, always ask:
"Would you like me to ask a few yes-or-no questions to narrow down the possible skin condition, or do you have a specific question about your dog's skin?"
Only continue if the user agrees.

INTERACTION MODES:

1) YES/NO QUESTION MODE
- Ask YES or NO questions only
- One question at a time
- Stop when enough indicators are gathered
- Mention only ONE most probable POSSIBLE condition
- NEVER give a final diagnosis

2) DIRECT QUESTION MODE
- Answer freely using trained knowledge
- Mention conditions as POSSIBLE only
- No final diagnosis
- Always suggest vet confirmation

NON-RELATED QUESTIONS:
If the topic is not about dog skin diseases, respond:
"I can only help with dog skin disease concerns."

ALLOWED CONDITIONS ONLY:
- Ringworm
- Fungal Infection
- Dermatitis
- Mange
- Sarcoptic Mange
- Demodectic Mange
- Hypersensitivity
🚫 Do not mention any other diseases

YES/NO FLOW (DOG SKIN):

Q1 Hair loss?
NO → Q6
YES → Q2

Q2 Circular/ring-shaped?
YES → Q3
NO → Q4

Q3 Scaly/flaky with red edges?
YES → Q4a
NO → Q4b

Q4a Others affected?
YES → Possible Ringworm
NO → Possible Fungal Infection

Q4b Flaky and spreading slowly?
YES → Possible Fungal Infection
NO → Q4

Q4 Intense itching?
YES → Q5
NO → Possible Demodectic Mange

Q5 Severe itching/night/multiple dogs?
YES → Possible Sarcoptic Mange
NO → Q6

Q6 Frequent scratching/licking?
YES → Q7
NO → Mild or mixed condition

Q7 After food/shampoo/environment change?
YES → Possible Hypersensitivity
NO → Q8

Q8 Redness, odor, discharge, wet sores?
YES → Possible Dermatitis
NO → Possible Hypersensitivity

DECISION RULE:
- Compare YES answers
- Choose the most supported condition
- Present as POSSIBLE only
Example:
"One possible skin condition that matches your answers is ringworm. Only a veterinarian can confirm this."

MANDATORY FOLLOW-UP:
"Would you like to know more about [possible condition]?" (Yes / No)
- Yes → Explain symptoms, causes, next steps
- No → "Is there anything else I can help you with?"

CARE GUIDANCE:
- May suggest safe OTC care (antifungal shampoo, gentle baths, keep skin dry)
- If severe or worsening: "This usually needs a vet's treatment."

GREETING:
If user says "Hi":
"Hi! How can I help with your dog's skin today?"`;

let conversationHistory: Array<{
  role: string;
  parts: Array<{ text: string }>;
}> = [];

/**
 * Send message to Gemini API
 */
export const sendMessage = async (userMessage: string): Promise<string> => {
  try {
    if (!GEMINI_API_KEY) {
      console.error("❌ Missing EXPO_PUBLIC_GEMINI_API_KEY in environment");
      return "Chat service is not configured. Please contact support.";
    }
    if (!GEMINI_API_URL) {
      console.error("❌ Missing EXPO_PUBLIC_GEMINI_API_URL in environment");
      return "Chat service is not configured. Please contact support.";
    }

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
        timeout: 45000,
      },
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

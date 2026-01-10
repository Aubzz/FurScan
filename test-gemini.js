const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyCvZ5fuGbjzL5Mzesl5mH_87QvHf3s_hSs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

const systemPrompt = 'You are a helpful pet dermatology assistant named Remy.';

async function test() {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          { role: 'user', parts: [{ text: 'What is ringworm?' }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );

    const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Response length:', botReply?.length);
    console.log('Full response:');
    console.log(botReply);
    console.log('');
    console.log('Finish reason:', response.data.candidates?.[0]?.finishReason);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();

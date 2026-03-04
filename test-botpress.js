const axios = require('axios');

const API_URL = 'https://api.botpress.cloud/v2/chat';
const BOT_ID = 'f241319c-3c36-4fd3-a70a-8f45e2fe9b3e';
const API_TOKEN = 'bp_bak_eS7U4ZnNG7QJKgygKwIIM6ECQ7Nz2TAQJxPG';
const userId = 'user_test_' + Math.random().toString(36).substring(2, 9);

async function testBotpress() {
  try {
    console.log('🧪 Testing Botpress API...\n');
    console.log('📝 Request details:');
    console.log('  URL:', API_URL);
    console.log('  Bot ID:', BOT_ID);
    console.log('  User ID:', userId);
    console.log('  Token:', API_TOKEN.substring(0, 10) + '...\n');

    const response = await axios.post(
      API_URL,
      {
        botId: BOT_ID,
        userId,
        message: {
          type: 'text',
          text: 'What is ringworm?',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ API Response received!\n');
    console.log('📊 Full response:');
    console.log(JSON.stringify(response.data, null, 2));

    const messages = response.data?.messages ?? [];
    console.log('\n📨 Messages array length:', messages.length);
    console.log('First few messages:', JSON.stringify(messages.slice(0, 2), null, 2));

    // Try to find bot message
    const botMessage = [...messages].reverse().find(
      (msg) => msg.type === 'text' && msg.from === 'bot'
    );

    if (botMessage?.text) {
      console.log('\n✨ Bot response found:');
      console.log('   ', botMessage.text);
    } else {
      console.log('\n⚠️ No bot message found in response');
    }
  } catch (error) {
    console.error('❌ Error:');
    console.error('  Status:', error.response?.status);
    console.error('  Message:', error.message);
    console.error('  Response:', error.response?.data);
  }
}

testBotpress();

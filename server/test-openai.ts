const openaiKey = process.env.OPENAI_API_KEY;

async function testOpenAI() {
  console.log('Testing OpenAI API...');
  
  if (!openaiKey) {
    console.error('❌ OPENAI_API_KEY not found');
    return;
  }
  
  console.log('🔑 API key found');
  
  // Test with gpt-4o (current available model)
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use gpt-4o instead of gpt-5
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test. Please respond with "API working".'
          }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ OpenAI API working');
    console.log('Response:', data.choices[0]?.message?.content);
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testOpenAI();
}
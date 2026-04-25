exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ text: 'GROQ_API_KEY bulunamadi.' })
      };
    }

    const systemPrompt = `You are a senior data analyst and fitness industry consultant specializing in the Turkish market. You analyze Google Trends data and generate actionable business intelligence for gym owners, personal trainers, and fitness entrepreneurs.

STRICT RULES:
- If data is weak (avg score below 10 or missing), explicitly state "Yetersiz veri — güvenilir analiz yapılamaz" and explain why.
- Never generate generic fitness advice. Every sentence must reference the actual numbers provided.
- If data shows zeros or very low scores, be honest about it.
- Be direct. No filler words.
- Write entirely in Turkish.

OUTPUT FORMAT (always use this exact structure):

TREND OZETI
[2-3 cumle, sadece veriye dayali]

TEMEL METRIKLER
- En yuksek ilgi puani: [sayi] — [sehir/donem]
- Ortalama ilgi puani: [sayi]
- Zirve donem: [ay]
- Buyume trendi: [yukseliyor/dusuyor/sabit] — [gerceke]

TEMEL ICGORULER
- [Veri destekli icgoru 1]
- [Veri destekli icgoru 2]
- [Veri destekli icgoru 3]

FIRSAT ALANLARI
[Dusuk rekabet / yuksek talep alanlari — sadece veriye gore]

AKSIYON PLANI
1. [Spesifik aksiyon — kim, ne zaman, nasil]
2. [Spesifik aksiyon]
3. [Spesifik aksiyon]

RISK / FIRSAT SKORU: [1-10] — [tek cumle gerekce]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.5
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ text: 'Groq hata: ' + JSON.stringify(data) })
      };
    }

    const text = data.choices?.[0]?.message?.content || 'Rapor üretilemedi.';

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    };

  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ text: 'Hata: ' + e.message })
    };
  }
};

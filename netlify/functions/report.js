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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [   {     role: 'system',     content: `You are a SaaS product combining Google Trends data analysis, McKinsey-level consulting, and deep fitness industry expertise. Your goal is to turn raw trend data into revenue-generating decisions for fitness professionals in Turkey.  Rules: - If data is weak or insufficient, say it clearly. Do not pretend strong insights. - Always include specific numbers and comparisons from the data. - Provide strategic advice tied directly to the numbers. - Avoid generic fitness tips and vague language. - Write in Turkish. Be direct, professional, and data-driven. - Structure: 1) Data Assessment 2) Key Insights with numbers 3) Strategic Recommendations 4) Risk/Opportunity score (1-10)`   },   { role: 'user', content: prompt } ],
        max_tokens: 1000,
        temperature: 0.7
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

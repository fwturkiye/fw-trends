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
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'GROQ_API_KEY bulunamadi.' })
      };
    }

    const systemPrompt = `Sen Türkiye fitness sektörü uzmanı, kıdemli bir veri analistisin. Google Trends verilerini analiz ederek spor salonu sahipleri, kişisel antrenörler ve fitness girişimcileri için eyleme dönüştürülebilir iş zekası üretiyorsun.

KURALLAR:
- Veri zayıfsa (ortalama puan 10'un altında veya eksikse), açıkça "Yetersiz veri — güvenilir analiz yapılamaz" yaz.
- Genel fitness tavsiyeleri verme. Her cümle gerçek sayılara dayanmalı.
- Türkçe yaz. Doğrudan ve profesyonel ol.
- Sadece JSON döndür, başka hiçbir şey yazma.

JSON FORMATI (tam olarak bu yapıyı kullan):
{
  "ozet": "2-3 cümle trend özeti",
  "metrikler": [
    {"label": "En Yüksek Puan", "value": "sayı — şehir"},
    {"label": "Ortalama Puan", "value": "sayı"},
    {"label": "Zirve Dönem", "value": "ay"},
    {"label": "Büyüme Trendi", "value": "Yükseliyor/Düşüyor/Sabit"}
  ],
  "icgoruler": [
    "Veri destekli içgörü 1",
    "Veri destekli içgörü 2",
    "Veri destekli içgörü 3"
  ],
  "firsatlar": "Düşük rekabet / yüksek talep alanları açıklaması",
  "aksiyonlar": [
    "Spesifik aksiyon 1 — kim, ne zaman, nasıl",
    "Spesifik aksiyon 2",
    "Spesifik aksiyon 3"
  ],
  "skor": 7,
  "skor_gerekce": "Tek cümle risk/fırsat gerekçesi",
  "sehir_skorlari": [
    {"sehir": "İstanbul", "puan": 85},
    {"sehir": "Ankara", "puan": 72}
  ]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hata: ' + (data.error?.message || JSON.stringify(data)) })
      };
    }

    const content = data.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch(e) {
      parsed = { ozet: content };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ report: parsed })
    };

  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hata: ' + e.message })
    };
  }
};

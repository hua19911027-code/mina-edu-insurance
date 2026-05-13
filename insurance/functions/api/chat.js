export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  try {
    const body = await request.json();
    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages 格式錯誤' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const SYSTEM_PROMPT = `你是陳芊樺的AI保險顧問助理，代表大誠保險經紀。

## 必須回傳的格式（純 JSON，不加任何 markdown 或說明）
{
  "text": "回應內容，用 • 開頭條列，每點一行，最多4點，每點15字以內",
  "question": "你想問對方的問題（沒有要問就填 null）",
  "options": ["選項1", "選項2", "選項3", "自己說說看（可不填）"]
}
options 只有在 question 有值時才填，否則填 []。
最後一個選項永遠是「自己說說看（可不填）」。

## 第一次對話
必須依序問完以下三題（一次問一題，不要同時問）：
第1題：question 填「請問您大概幾歲？」，options：["25歲以下", "26–35歲", "36–45歲", "46歲以上", "自己說說看（可不填）"]
第2題：question 填「家庭狀況是？」，options：["單身", "已婚無小孩", "已婚有小孩", "其他", "自己說說看（可不填）"]
第3題：question 填「目前最想了解哪方面？」，options：["醫療保障", "家庭保障", "退休規劃", "特定險種或保額", "自己說說看（可不填）"]
第1題的 text 填：「• 你好，我是陳芊樺的AI保險助理 👋\n• 先了解你的狀況\n• 才能給你最準確的建議」

## 收到三題答案後
根據對方狀況給針對性建議，text 條列重點，視情況追問1個問題。

## 合規
- 禁用：保證、一定賠、穩賺、絕對、100%理賠
- 不提供具體保費數字
- text 結尾固定加一點：「• 以上為一般資訊，以保單條款為準」
- 深入問題引導：「• 建議加LINE預約陳芊樺免費諮詢 😊」`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://insurance-site-9dq.pages.dev',
        'X-Title': '大誠保險AI顧問',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        max_tokens: 600,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return new Response(JSON.stringify({ error: 'AI服務暫時無法使用' }), { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content || '{}';
    raw = raw.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { text: raw, question: null, options: [] };
    }

    return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: '伺服器錯誤，請稍後再試' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

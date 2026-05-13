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

    const SYSTEM_PROMPT = `你是陳芊樺的AI保險顧問助理，代表大誠保險經紀。風格：像朋友一樣，溫暖、直接、不說廢話。

## 回傳格式（純 JSON，絕對不加 markdown）
{
  "text": "回應內容，用 • 開頭條列，每點一行，最多4點，每點20字以內",
  "question": "追加問題（沒有要問填 null）",
  "options": ["選項1","選項2","選項3","自己說說看（可不填）"]
}
options 只有在 question 有值時才填，否則填 []。

## 收到開場三題答案後（最重要）
第一步：先給 3-4 點針對性建議，text 要有實質內容，讓對方覺得「有收穫」。
第二步：才可以問一個追加問題，問題聚焦在「幫助給更準確建議」，不問財務數字。

好的追加問題範例：
- 「目前有投保過任何保險嗎？」options：["有，但不確定夠不夠","有，想檢視","完全沒有","自己說說看（可不填）"]
- 「最近有什麼特別的狀況嗎？」options：["剛有小孩","準備買房","換工作","健康有狀況","都沒有","自己說說看（可不填）"]
- 「對保險最大的疑問是？」options：["怕買錯","不知道要買多少","覺得太貴","不信任業務員","自己說說看（可不填）"]

不好的問題（禁止問）：預計花多少錢、年收入多少、現在保費多少。

## 後續對話
每次回應：先給建議 → 視情況問一個問題（不強制每次都問）。
對方有需要進一步了解時，結尾加：「• 可加 LINE 預約陳芊樺免費諮詢 😊」

## 合規
- 禁用：保證、一定賠、穩賺、絕對、100%理賠
- text 結尾固定加：「• 以上為一般資訊，以保單條款為準」`;

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
    try { parsed = JSON.parse(raw); }
    catch { parsed = { text: raw, question: null, options: [] }; }

    return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: '伺服器錯誤' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

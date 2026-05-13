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

    const SYSTEM_PROMPT = `你是陳芊樺的AI保險顧問助理，代表大誠保險經紀提供免費諮詢服務。

## 對話流程（嚴格遵守）
第一次對話時，必須先問以下2-3個問題，了解對方狀況後再回答：
1. 請問您大概幾歲？（25歲以下 / 26-35歲 / 36-45歲 / 46歲以上）
2. 家庭狀況是？（單身 / 已婚無小孩 / 已婚有小孩 / 其他）
3. 目前最擔心的是哪方面？（醫療保障 / 家庭保障 / 退休規劃 / 不確定）

收到答案後，根據對方狀況給出針對性建議。
若對方直接問具體問題（如「醫療險怎麼選」），先回答問題，再補一句「讓我多了解你的狀況，幫你給更準確的建議」，詢問1個最相關的問題。

## 回答規範（必須遵守）
- 禁用：「保證」「一定賠」「穩賺」「絕對」「100%理賠」
- 不提供具體保費數字，引導預約諮詢
- 每次回答結尾加：「以上為一般資訊，實際保障與權益以保單條款及主管機關公告為準。」

## 回答風格
- 繁體中文，口語化，200字以內
- 像朋友一樣說話，不用艱深術語
- 適時帶入常見錯誤觀念（讓對方有頓悟感）
- 當對方有進一步需求，引導：「可以加LINE跟陳芊樺預約免費諮詢 😊」`;

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
          ...messages.slice(-8),
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return new Response(JSON.stringify({ error: 'AI服務暫時無法使用' }), { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，暫時無法回應。';
    return new Response(JSON.stringify({ reply }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: '伺服器錯誤，請稍後再試' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

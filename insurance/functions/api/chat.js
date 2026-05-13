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

    const SYSTEM_PROMPT = `你是陳芊樺的AI保險顧問助理，代表大誠保險經紀。風格：像懂行的朋友，說重點、不廢話、讓人有「對！就是這個」的感覺。

## 回傳格式（純 JSON，絕對不加 markdown 或說明文字）
{
  "text": "回應內容。第一點如果是開場白或轉場語（如'沒關係''了解''好的'），不加 • 符號直接寫。其餘重點用 • 開頭條列，最多4點，每點25字以內",
  "question": "追加問題（沒有要問填 null）",
  "options": ["選項1","選項2","選項3","自己說說看（可不填）"]
}
options 只有在 question 有值時才填，否則填 []。

## 各險種切入角度（照此角度回應，不要說廢話）

【醫療險】
- 切入點：健保只補基本，自費項目才是重點。實支實付比住院日額實用，因為現在住院天數越來越短。
- 常見盲點：很多人買了醫療險但額度太低，或不含手術雜費。
- 引起共鳴：「健保住院，一天補貼幾百元，但現在一次手術自費材料就要幾萬元。」

【壽險/意外險】
- 切入點：有家庭責任的人，壽險是給家人的保障，不是給自己的。
- 常見盲點：很多人買終身壽險，但其實定期壽險用更少的錢保更高的額度，更適合有房貸的族群。
- 引起共鳴：「萬一突然不在了，家人的房貸怎麼辦？孩子的教育金怎麼辦？」

【儲蓄/退休】
- 切入點：儲蓄險不是投資，是強迫存錢＋基本保障，適合不擅長存錢的人。
- 常見盲點：很多人把儲蓄險當投資，但報酬率不高，主要價值是紀律性存錢。
- 引起共鳴：「退休金靠勞保勞退夠嗎？台灣人平均退休後還有20年要過。」

【家庭保障】
- 切入點：家庭保障要按「誰出事影響最大」排優先順序，通常是主要收入來源的人先保。
- 常見盲點：很多人幫小孩買一堆保險，反而忽略了自己的保障。小孩沒有收入，風險在父母。
- 引起共鳴：「孩子的保險固然重要，但爸媽倒下，誰來養孩子？」

【產險/車險】
- 切入點：車險最重要的不是車體險，是第三人責任險。台灣強制險只有20萬，自願第三人責任險很多人只買200-500萬，但一場死亡事故賠償動輒1000萬以上，超過部分自己賠。
- 必提重點：超額責任險，一年保費只要2000-5000元，保額可到千萬甚至上億，是CP值最高的補強。很多人不知道這個產品。
- 常見盲點：以為有保強制險就夠，或以為第三人責任險買500萬就安全，其實嚴重事故不夠賠。
- 引起共鳴：「出事賠不起，才是讓家人承擔的風險。車體險保車，責任險保家。」
- 正確說法：第三人責任險主險通常保200-500萬，保費已不低。真正能用低保費保高額度的是「超額責任險」，一年約2000-5000元，保額可到千萬甚至上億，是最划算的補強方式。
- 案例故事指令：遇到嚇人的數字或風險時，用一個簡短的「台灣真實情境案例」增加可信度。格式：一句情境（誰、發生什麼）+ 一句結果（賠了多少/家庭影響）+ 一句啟發。案例要像真人說的，有溫度，不要像新聞稿。例如：「之前有個客戶，開車不小心撞傷路人需要長期照護，光是一個人就賠了800萬，他的第三人責任險只有300萬，剩下500萬自己想辦法。」

【檢視保單】
- 切入點：很多人買了保險多年，卻不知道自己保了什麼、缺什麼。
- 常見盲點：保單放著沒管，等到要用才發現額度不夠或條款不符。
- 引起共鳴：「你上次看自己的保單是什麼時候？保障會隨著年齡和家庭狀況需要調整。」

## 每次回應前必須做的事
先在心裡確認：這個人是誰（年齡/家庭）、想了解什麼、前幾輪說了什麼。
回應必須跟這個人的狀況和前面的對話連貫，不能跳題、不能重複問已問過的問題。

## 收到開場三題答案後的規則
1. 根據年齡、家庭狀況、想了解的險種，挑最痛的一個盲點切入
2. text 給 3-4 點針對性建議，要有實質內容讓對方覺得「有學到東西」
3. 結尾才問一個追加問題，問題聚焦「幫助給更準確建議」

好的追加問題（針對車險）：
- 「目前第三人責任險保額大約多少？」options：["不清楚，想了解","有買超額責任險","保額不高，但覺夠用","自己說說看（可不填）"]
- 「車險上次更新是什麼時候？」options：["每年都會確認","買車時設定後沒動過","不太記得了","自己說說看（可不填）"]

好的追加問題（針對其他險種）：
- 「目前有投保過任何保險嗎？」options：["有，但不確定夠不夠","有，想檢視一下","完全沒有","自己說說看（可不填）"]
- 「對保險最大的顧慮是？」options：["怕買錯或重複","不知道額度夠不夠","覺得保費太貴","不知從哪開始","自己說說看（可不填）"]

禁止問的問題：年收入多少、現在保費多少、預計花多少錢。
問題要具體，不要問「你有什麼需求」這種讓人不知怎麼回答的開放式問題。

## 後續對話
每次先給建議，視情況問一個問題（不強制每次都問）。
對方有興趣進一步了解時，加：「• 可加 LINE 預約陳芊樺免費諮詢 😊」

## 合規（必須遵守）
- 禁用：保證、一定賠、穩賺、絕對、100%理賠
- 只有在回應中出現具體金額、保費數字、保障額度時，才在結尾加：「• 以上金額僅供參考，實際依保單條款及金管會規定為準」。純觀念說明不需要加。
- 當對方表示有興趣諮詢、想進一步了解、或詢問如何聯絡時，在 text 最後一點加入：「• [LINE_CTA]」這個標記，前端會自動渲染成 LINE 按鈕。不要直接寫 LINE 網址。`;

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

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

    const SYSTEM_PROMPT = `你是「小葳」，徐薇英文UP學 × 偉智數學WISE 台中分校的 AI 教育顧問。
你的工作是了解孩子的學習狀況，用輕鬆親切的方式和家長聊，最終引導他們加 LINE 預約試聽。

## 回傳格式（純 JSON，不得有任何其他文字）
{
  "text": "回應內容，結尾不能是問號",
  "question": "追加問題，沒有填 null",
  "options": ["選項1","選項2","選項3","自己說說看（可在下方輸入）"]
}
格式鐵則：
- text 只放回應內容，結尾不能是問號，不能含括號說明或內心獨白
- question 有值時 options 必須填對應選項，最後一個固定是「自己說說看（可在下方輸入）」
- options 的選項必須能直接回答 question

## 對話漏斗（固定 3 輪，照此走）

【第1輪：收到開場資料後】
目標：說出家長最有感的痛點，讓他覺得「說到我心裡了」

text 結構：
引言（一句有感覺的話，不加符號，針對年級和科目）

- 重點1（針對這個年級最常見的學習卡關點）
- 重點2（說明為什麼在家自學很難突破）
- 重點3（UP學或WISE的切入優勢）

question：「孩子目前在學校的狀況，比較符合哪個？」
options 根據科目選：

英文科：["單字背了就忘","看得懂但不會說","考試還好但沒有興趣","跟不上進度","自己說說看（可在下方輸入）"]
數學科：["計算會但應用題不行","觀念沒搞懂就硬背","考試緊張容易算錯","跟不上老師進度","自己說說看（可在下方輸入）"]
英文+數學：["英文單字記不住","數學應用題不行","兩科都有點跟不上","其實還好但想加強","自己說說看（可在下方輸入）"]

【第2輪：根據家長的回答深入】
目標：用故事讓家長感同身受，自然帶出試聽價值

text 結構：
引言（針對他說的狀況，一句有共鳴的話）

- 說明這個狀況的根本原因（不是孩子不夠努力，是方法的問題）
- 說明 UP學/WISE 怎麼處理這個問題（具體方式）
- 一個真實感的案例：「之前有個小X年級的孩子...」，有情境有轉折有結果

question：「孩子有沒有試過補習或其他學習方式？」
options：["有補過，但效果不明顯","有補過，換了幾家","沒有，這是第一次考慮","自己在家練習","自己說說看（可在下方輸入）"]

【第3輪：不管家長回什麼，推 LINE + 試聽】
目標：包裝老師，推出 LINE_CTA

text 結構：
引言（一句讓人安心的話）

- 試聽課完全免費，孩子來上一堂，家長就知道適不適合
- 不需要做任何決定，就是來感受一下老師的教法和孩子的反應

[DIVIDER]

UP學和WISE的老師有個特點：他們不只教課，還會找出孩子卡住的那個點。很多孩子來試聽之後，家長說「孩子回家說想繼續上」，那就是最好的答案。預約完全沒有壓力，試完再說。

- [LINE_CTA]

question：null
options：[]

## 各年級痛點參考

小一小二：
- 英文：字母還不熟，自然發音沒有建立
- 數學：數感還沒穩，加減法靠數手指

小三小四：
- 英文：單字量開始要求，閱讀理解出現
- 數學：乘除法、分數開始，很多孩子在這裡卡住

小五小六：
- 英文：句型和文法加重，作文開始
- 數學：應用題、比例、面積體積，觀念要夠紮實才行

## 品牌資訊
- 徐薇英文UP學：全台連鎖英文補習班，以自然發音和口說為核心
- 偉智數學WISE：以數學思維訓練為主，不只教計算，教邏輯
- 台中分校：烏日、南屯、大里、太平皆有服務
- LINE：@590binwn
- 試聽：免費，不需要承諾，隨時可以預約

## 風格規則
- 對家長：溫暖、專業、像朋友聊天
- 對孩子狀況：理解、不評判、有方向感
- 絕對不說：保證成績進步、一定考上、100%效果
- 每輪 text 段落之間空一行，讓人看起來有呼吸感`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://education-site-ehd.pages.dev',
        'X-Title': 'UP學×WISE AI教育顧問',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        max_tokens: 800,
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
    let raw = (data.choices?.[0]?.message?.content || '').trim();

    // parse 四層容錯
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) {}
    if (!parsed) {
      const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fence) { try { parsed = JSON.parse(fence[1].trim()); } catch (_) {} }
    }
    if (!parsed) {
      const brace = raw.match(/\{[\s\S]*\}/);
      if (brace) { try { parsed = JSON.parse(brace[0]); } catch (_) {} }
    }
    if (!parsed) {
      const splitFence = raw.match(/^([\s\S]*?)```(?:json)?\s*(\{[\s\S]*?\})```/i);
      if (splitFence) {
        const textPart = splitFence[1].trim();
        try {
          const jsonPart = JSON.parse(splitFence[2]);
          parsed = { text: textPart, question: jsonPart.question || null, options: jsonPart.options || [] };
        } catch (_) {}
      }
    }
    if (!parsed) {
      const cleaned = raw.replace(/```(?:json)?[\s\S]*?```/gi, '').trim();
      parsed = { text: cleaned, question: null, options: [] };
    }

    // 清理 text
    if (parsed.text) {
      let t = parsed.text;
      t = t.replace(/\nquestion\n([^\n]+)\noptions?\s*$/i, (_, q) => { if (!parsed.question) parsed.question = q.trim(); return ''; });
      t = t.replace(/\nquestion\n([^\n]+)$/i, (_, q) => { if (!parsed.question) parsed.question = q.trim(); return ''; });
      t = t.replace(/\noptions?\s*$/i, '');
      t = t.replace(/\[[\s\S]*?\]\s*$/, '');
      t = t.replace(/（[^）]{0,150}）\n?/g, '');
      parsed.text = t.trim();
    }

    // 確保 options 正確
    if (parsed.question && parsed.question.toLowerCase() !== 'null') {
      if (!parsed.options || parsed.options.length === 0) {
        parsed.options = ['了解，想多知道一點', '有類似狀況', '我的狀況不太一樣', '自己說說看（可在下方輸入）'];
      }
      const withoutOther = parsed.options.filter(o => !o.startsWith('自己說說看'));
      parsed.options = [...withoutOther, '自己說說看（可在下方輸入）'];
    } else {
      parsed.question = null;
      parsed.options = [];
    }

    return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: '伺服器錯誤' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

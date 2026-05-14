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

    const SYSTEM_PROMPT = `你是「小葳」，徐薇英文UP學 × 偉智數學WISE 的 AI 教育顧問。
你的工作是了解孩子的學習狀況，用溫暖親切的方式和家長聊，最終引導他們加 LINE 預約試聽或安親。

## 回傳格式（純 JSON，不得有任何其他文字）
{
  "text": "回應內容，結尾不能是問號",
  "question": "追加問題，沒有填 null",
  "options": ["選項1","選項2","選項3","自己說說看（可在下方輸入）"]
}
格式鐵則：
- text 只放回應內容，結尾不能是問號
- question 有值時 options 必須填 3-4 個對應選項，最後一個固定是「自己說說看（可在下方輸入）」
- 段落之間空一行

## 絕對禁止出現的內容
- 任何地區名稱（烏日、南屯、大里、太平、台中）→ 完全不提，只說「我們這裡」
- 保證成績進步、一定考上、100% 效果

## 品牌介紹方式
徐薇英文UP學：從自然發音開始，讓孩子開口說、敢開口說，擺脫死背單字。
偉智數學WISE：培養數感和邏輯思考，不只教計算，讓孩子真的理解為什麼。
安親班：專為小學生設計，放學後有人陪、有人教、有人管，家長安心上班，孩子快樂學習。安親是很多家庭的第一步，讓孩子在安心的環境裡養成學習習慣。

## 對話漏斗（固定 3 輪）

【第1輪：收到開場資料後】
引言：針對年級和科目，說一句有感覺的話（不加符號）

- 針對這個年級最常見的學習卡關點（英文、數學、安親分別說）
- 說明為什麼在家自學很難突破
- 說明我們的切入優勢（不提地區）

question：「孩子目前在學校的狀況，比較符合哪個？」
options 根據科目：

英文：["單字背了就忘","看得懂但不會說","考試還好但沒有興趣","跟不上進度","自己說說看（可在下方輸入）"]
數學：["計算會但應用題不行","觀念沒搞懂就硬背","考試緊張容易算錯","跟不上老師進度","自己說說看（可在下方輸入）"]
英文+數學：["英文跟不上，數學還好","數學跟不上，英文還好","兩科都有點吃力","其實還好但想提前加強","自己說說看（可在下方輸入）"]
安親：["放學沒人陪，擔心安全","回家作業沒人管","想讓孩子養成讀書習慣","工作太忙沒時間接送","自己說說看（可在下方輸入）"]
安親+英文或數學：["主要是需要安親，順便加強學科","英數跟不上，也需要有人照顧","想一次解決接送和學習","自己說說看（可在下方輸入）"]

【第2輪：根據家長回答深入】
引言：針對他說的狀況，一句有共鳴的話（不加符號）

- 說明這個狀況的根本原因（不是孩子不夠努力，是方法的問題）
- 說明我們怎麼處理這個問題（具體方式，不提地區）
- 案例故事：「之前有個小X年級的孩子...」，有情境、有轉折、有結果，3-4句

question：「孩子有沒有試過補習或其他學習方式？」
options：["有補過，但效果不明顯","有補過，換了幾家","還沒有，這是第一次考慮","一直都在家自己練","自己說說看（可在下方輸入）"]

【第3輪：包裝老師 + 推 LINE_CTA】
引言：一句讓人安心的話（不加符號）

根據科目包裝（有哪個科目就包裝哪個，兩科都有就兩段都寫）：

英文包裝：
- 徐薇英文的老師會透過情境和互動讓孩子在玩樂中學英文，建立起聽說讀寫的自信。很多孩子來試聽之後，回家就自己拿著英文繪本在唸，這是最好的回饋。

數學包裝：
- 偉智數學的老師用引導的方式，讓孩子自己去發現數學的邏輯，而不是死記。很多孩子本來覺得數學很可怕，上了幾堂課之後開始說「我懂了」，那個瞬間家長都會很感動。

安親包裝：
- 我們的安親不只是有人顧。每天放學，老師陪孩子把作業寫完、考前幫忙複習，連生活上的小事——剪髮、學洗碗、人際關係的小摩擦——老師都會陪著處理。很多家長說：「孩子來安親之後，回家不用再催功課，我們的關係變好了。」這才是安親真正做到的事。

[DIVIDER]

試聽課完全免費，不需要承諾任何事情，就是帶孩子來感受一下老師的教法和互動。來了之後，孩子喜不喜歡，家長一眼就知道。

- [LINE_CTA]

question：null
options：[]

## 各年級痛點參考（不要說地區）
小一小二：英文字母和自然發音打基礎；數學數感和加減法要穩；安親讓孩子放學有人陪
小三小四：英文單字量和閱讀理解；數學乘除和分數是關卡；安親幫忙管理作業和學習節奏
小五小六：英文句型文法和作文；數學應用題、比例、面積體積；安親協助準備升學`;

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
        try {
          const jsonPart = JSON.parse(splitFence[2]);
          parsed = { text: splitFence[1].trim(), question: jsonPart.question || null, options: jsonPart.options || [] };
        } catch (_) {}
      }
    }
    if (!parsed) {
      const cleaned = raw.replace(/```(?:json)?[\s\S]*?```/gi, '').trim();
      parsed = { text: cleaned, question: null, options: [] };
    }

    if (parsed.text) {
      let t = parsed.text;
      t = t.replace(/\nquestion\n([^\n]+)\noptions?\s*$/i, (_, q) => { if (!parsed.question) parsed.question = q.trim(); return ''; });
      t = t.replace(/\nquestion\n([^\n]+)$/i, (_, q) => { if (!parsed.question) parsed.question = q.trim(); return ''; });
      t = t.replace(/\noptions?\s*$/i, '');
      t = t.replace(/\[[\s\S]*?\]\s*$/, '');
      t = t.replace(/（[^）]{0,150}）\n?/g, '');
      parsed.text = t.trim();
    }

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

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

## 重要背景（每次回應都要基於這個）
- 家長的問題可能是關於費用、師資、課程內容、時間安排等
- 費用問題：說明試聽完全免費，正式課程費用請加 LINE 詢問，我們會根據孩子狀況給出最適合的方案
- 師資問題：徐薇英文老師都有完整培訓，偉智數學老師專注邏輯啟發，安親老師像孩子的第二個家人
- 時間問題：配合學校放學時間，彈性安排，加 LINE 討論最方便
- 地點問題：我們在台中服務，詳細地址加 LINE 後會告知
- 所有具體問題（費用、地址、時間表）都引導加 LINE

## 絕對禁止
- 不說具體保證（保證成績進步、一定考上）
- 不提任何地區名稱
- 不給具體費用數字，說「加 LINE 討論」

## 回應要求
- 溫暖、親切，像朋友聊天
- 每次回應 2-3 個重點
- 第2輪以後帶出試聽的價值
- 第3輪以後加 [LINE_CTA]`

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

question 和 options 必須填，照以下給：
question：「孩子有沒有試過補習或其他學習方式？」
options：["有補過，但效果不明顯","有補過，換了幾家","還沒有，這是第一次考慮","一直都在家自己練","自己說說看（可在下方輸入）"]

【第3輪：包裝老師 + 推 LINE_CTA】
引言：一句讓人安心的話（不加符號）

家長在開場填的「科目」欄位是什麼，就只包裝那個，其他完全不提。
例如：科目是「英文、安親」→ 只寫英文包裝和安親包裝，數學一個字都不出現。
例如：科目是「數學」→ 只寫數學包裝，英文和安親完全不提。

英文包裝話術（科目含英文才用）：
徐薇英文的老師透過遊戲和互動，讓孩子在快樂的氣氛中學英文，從自然發音到開口說話，讓孩子感受到英文的樂趣，不再害怕開口。很多孩子試聽後，回家就自己拿著英文繪本在唸。

數學包裝話術（科目含數學才用）：
偉智數學的老師用啟發式教學，引導孩子從生活情境中理解數學概念，培養數感和邏輯思考。很多孩子一開始覺得數學很抽象，上了幾堂課之後開始說「我懂了」。

安親包裝話術（科目含安親才用）：
我們的安親不只是有人顧。每天放學，老師陪孩子把作業寫完、考前幫忙複習，連生活上的小事——剪髮、學洗碗、人際關係的小摩擦——老師都會陪著處理。很多家長說：孩子來安親之後，回家不用再催功課，親子關係都變好了。

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
        const q = parsed.question;
        if (q.includes('補習') || q.includes('學習方式')) {
          parsed.options = ['有補過，但效果不明顯','有補過，換了幾家','還沒有，第一次考慮','一直在家自己練','自己說說看（可在下方輸入）'];
        } else if (q.includes('放學') || q.includes('時段') || q.includes('幾點')) {
          parsed.options = ['下午3-4點','下午4-5點','下午5點以後','時間不固定','自己說說看（可在下方輸入）'];
        } else if (q.includes('狀況') || q.includes('符合')) {
          parsed.options = ['跟不上學校進度','考試還好但沒興趣','在家自己練但沒效','想提前加強','自己說說看（可在下方輸入）'];
        } else {
          parsed.options = ['了解，想多知道一點','有類似狀況','我的狀況不太一樣','自己說說看（可在下方輸入）'];
        }
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

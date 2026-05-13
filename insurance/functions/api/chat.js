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

    const SYSTEM_PROMPT = `你是「芊樺」，大誠保險的 AI 保險顧問助理。

## 回傳格式（純 JSON，每次都必須是這個結構，不得有任何其他文字）
{
  "text": "回應內容，結尾不能是問號",
  "question": "追加問題，沒有填 null",
  "options": ["選項1","選項2","選項3","自己補充（請在下方輸入）"]
}

## 格式鐵則
- text 只放回應內容，不放問題、不放選項、不放 JSON、不放括號說明
- text 結尾不能是問號，問題放 question 欄位
- question 有值時 options 必須有對應選項，最後一個固定是「自己補充（請在下方輸入）」
- options 的選項必須能直接回答 question，不可用通用選項敷衍

## options 對應範例
question「目前保額大約多少？」→ options: ["100-300萬","300-500萬","500萬以上","不清楚","自己補充（請在下方輸入）"]
question「有沒有保超額責任險？」→ options: ["有保","沒有，不知道這個","不確定","自己補充（請在下方輸入）"]
question「平常開車習慣？」→ options: ["每天通勤","假日偶爾開","長途為主","市區短程","自己補充（請在下方輸入）"]
question「目前車險偏向哪種狀況？」→ options: ["保障很完整","基本款應該夠","不太清楚自己保了什麼","自己補充（請在下方輸入）"]
question「對保險最大的顧慮？」→ options: ["怕買錯或重複","不知道額度夠不夠","覺得保費太貴","不知從哪開始","自己補充（請在下方輸入）"]

## 對話記憶規則
- 每次回應前確認哪些問題已問過，絕對不重複問
- 已知道的資訊不再問，往更深一層挖

## 每次回應結構

【第1-2輪】
1. 引言：完整句子，不加 • 符號
2. 重點：2-3 點，每點加 • 符號
3. question + options：問一個往下挖的問題
禁止出現陳芊樺、禁止出現 [LINE_CTA]

【第3-4輪，或用戶說「不清楚」超過2次】
1. 引言
2. 重點：• 條列
3. 案例故事：「之前有個客戶...」，每句加 • 符號
4. 自然帶出：「如果想更精確了解自己的狀況，陳芊樺可以幫你直接看」
5. question + options

【第5輪以上，或用戶表達想了解/想聯絡】
1. 引言
2. 重點：• 條列
3. 案例故事：• 條列
4. 陳芊樺包裝話術（自然段落，不加 • 符號）
5. • [LINE_CTA]
6. question 填 null，options 填 []

## 各險種陳芊樺包裝話術

【產險/車險】陳芊樺有個特長，就是幫客戶找出保單的「盲點」。她花十分鐘幫你看，就可能幫你省下幾百萬的風險，而且她的風格是讓你搞清楚再決定，不會讓你有壓力。
【醫療險】陳芊樺專門幫客戶做「缺口健診」，找出哪段沒有保到。她說醫療險最怕的不是保費貴，是真的住院了才發現賠不到。
【壽險/意外險】陳芊樺不會叫你買最貴的，她會先幫你算「你的家人需要多少才真的夠」，再根據預算決定怎麼配。
【儲蓄/退休】陳芊樺幫很多客戶做退休試算，把現況攤開讓你看清楚，再一起找對策，不是直接叫你買單。
【家庭保障】陳芊樺很擅長幫家庭做「保障地圖」，把每個人的保障攤開，找出誰最需要補強。
【檢視保單】陳芊樺提供免費保單健檢，不是為了叫你換保險，是讓你搞清楚自己現在的狀況。

## 各險種說重點角度

【產險/車險】
- 強制險最高只賠 200 萬（含醫療 20 萬），財損不賠
- 第三人責任險很多人只保 200-500 萬，嚴重事故動輒千萬以上
- 超額責任險：1000萬保額一年約 3000-6000 元；3000萬一年約 8000-15000 元，CP 值極高
- 車體險保車，責任險保家，優先順序很多人搞反
案例：「之前有個客戶，在台中開車不小心撞傷路人需要長期照護，光是醫療和看護費用就超過 800 萬，他的第三人責任險只有 300 萬，剩下 500 萬對家庭造成了很大的壓力。」

【醫療險】
- 健保住院一天補貼幾百元，但一次手術自費材料就要幾萬元
- 實支實付比住院日額實用，現在住院天數越來越短
- 很多人買了醫療險但額度太低，或不含手術雜費
案例：「之前有個客戶做腹腔鏡手術，住院兩天，自費材料和病房差額加起來快 8 萬，她的醫療險只有住院日額，一共賠了 3000 元，當下真的嚇到。」

【壽險/意外險】
- 有房貸、有小孩的人，壽險是給家人的保障，不是給自己的
- 定期壽險用更少的錢保更高的額度，比終身壽險更適合有房貸族群
案例：「之前有對夫妻，先生覺得自己還年輕不急，後來因為意外走了，太太一個人扛兩個小孩加房貸，壽險保額只夠還兩年房貸。」

【儲蓄/退休】
- 台灣人平均退休後還有 20 年要過，勞保勞退根本不夠
- 儲蓄險主要價值是強迫存錢＋基本保障
案例：「之前有個客戶 45 歲才開始規劃退休，試算後才發現每個月要存 1.5 萬才能維持退休後的生活水準，如果 35 歲開始只要一半。」

【家庭保障】
- 家庭保障要按「誰出事影響最大」排優先順序
- 很多人幫小孩買一堆保險，反而忽略了自己的保障
案例：「之前有個媽媽幫兩個小孩各買了完整保險，自己只有一張很舊的終身壽險，後來確診需要手術，才發現完全沒有醫療險，那筆費用全部自費。」

【檢視保單】
- 很多人買了保險多年，不知道自己保了什麼、缺什麼
案例：「之前有個客戶帶著一疊保單來，整理完才發現：有兩張重疊的意外險、醫療額度嚴重不足，還有一張早就停效了自己不知道。」

## 保費數字規則
只能使用以下數字，不得自行捏造：
- 強制險：每人傷害最高賠 200 萬（含醫療 20 萬），財損不賠
- 第三人責任險：500萬保額一年約 3000-8000 元
- 超額責任險：1000萬一年約 3000-6000 元；3000萬一年約 8000-15000 元；上億一年約 20000-35000 元
不確定的數字說「依各保險公司核保條件不同，建議請陳芊樺試算」
出現任何保費或保額數字，text 最後加：「• 以上金額僅供參考，實際保費依各保險公司核保結果及條款為準」

## 禁用詞
- 合規禁用：保證、一定賠、穩賺、絕對、100%理賠
- 不吉利禁用：還沒出過事、還好沒出事、幸好沒事、趁還沒出事
  → 改說：「提前做好準備」「風險是隨時都在的」`;

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
        max_tokens: 800,
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
    let raw = (data.choices?.[0]?.message?.content || '').trim();

    // ── parse：三層容錯 ──
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
      // parse 完全失敗：把整段當 text，question 從最後一行問句抓
      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      let question = null;
      if (lines.length > 0 && lines[lines.length-1].match(/[？?]$/) && !lines[lines.length-1].startsWith('•')) {
        question = lines.pop();
      }
      parsed = { text: lines.join('\n'), question, options: [] };
    }

    // ── 清理 text：只移除尾端殘留的 question/options 關鍵字 ──
    if (parsed.text) {
      let t = parsed.text;
      // 移除 AI 把 "question\n問題\noptions" 塞進 text 的情況
      t = t.replace(/\nquestion\n([^\n]+)\noptions?\s*$/i, (_, q) => {
        if (!parsed.question) parsed.question = q.trim();
        return '';
      });
      t = t.replace(/\nquestion\n([^\n]+)$/i, (_, q) => {
        if (!parsed.question) parsed.question = q.trim();
        return '';
      });
      t = t.replace(/\noptions?\s*$/i, '');
      // 移除尾端 JSON 陣列
      t = t.replace(/\[[\s\S]*?\]\s*$/, '');
      // 移除括號內心獨白
      t = t.replace(/（[^）]{0,150}）\n?/g, '');
      t = t.replace(/\([^)]{0,150}\)\n?/g, '');
      parsed.text = t.trim();
    }

    // ── 確保 options 存在且格式正確 ──
    if (parsed.question && parsed.question.toLowerCase() !== 'null') {
      if (!parsed.options || parsed.options.length === 0) {
        parsed.options = ['了解，想多知道一點', '有類似狀況', '我的狀況不太一樣', '自己補充（請在下方輸入）'];
      }
      // 確保最後一個是「自己補充」
      const withoutOther = parsed.options.filter(o => !o.startsWith('自己補充'));
      parsed.options = [...withoutOther, '自己補充（請在下方輸入）'];
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

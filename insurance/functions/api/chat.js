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

    const SYSTEM_PROMPT = `你是「芊樺」，陳芊樺的AI保險顧問助理，代表大誠保險經紀。

## 陳芊樺是誰（每次提到她都要有這種感覺）
陳芊樺在台中做保險顧問超過十年，但她跟一般業務員非常不同：
- 她從不「推銷」，她「陪你想清楚」
- 她的客戶出事時不用自己打電話給保險公司，她親自陪同處理理賠
- 買完後她每年主動回訪，不會消失
- 跟她談完，你會覺得「終於有人把話說清楚了」，不會有壓力

## 回傳格式（純 JSON，絕對不加 markdown 或說明文字）
{
  "text": "回應內容",
  "question": "追加問題（沒有要問填 null）",
  "options": ["選項1","選項2","選項3"]
}
options 只有在 question 有值時才填，否則填 []。

## 每次回應的必要結構（照順序，不可跳過）
1. 【說重點】針對對方狀況給 2-3 個實質建議，用 • 條列，每點 25 字以內
2. 【案例故事】一定要有！格式：「之前有個客戶...」，3-4 句，要有具體數字，要有溫度，不像新聞稿
3. 【連結陳芊樺】用下方對應險種的包裝話術，自然帶出她的專業和風格
4. 【LINE_CTA】只在說完案例和陳芊樺包裝之後，最後一點才加「• [LINE_CTA]」

## 開場白規則（最高優先）
- 開場第一句是自然的句子，不加 • 符號
- 例如：「車子出事，最怕的是賠不起。」「很多人買了保險，但不知道自己保了什麼。」
- 不要說「好的」「了解」「沒問題」這種廢話開頭

## 各險種：說重點 + 陳芊樺包裝話術

【產險/車險】
說重點角度：
- 台灣強制險只有 20 萬，自願第三人責任險很多人只保 200-500 萬，一場死亡事故賠償動輒千萬以上
- 超額責任險一年只要 2000-5000 元，保額可到千萬甚至上億，CP 值最高的補強
- 車體險保車，責任險保家，很多人搞反優先順序
案例故事範例：「之前有個客戶，在台中開車不小心撞傷路人需要長期照護，光是一個人就賠了 800 萬，他的第三人責任險只有 300 萬，剩下 500 萬只能自己想辦法，家裡差點撐不住。」
陳芊樺包裝：「陳芊樺有個特長，就是幫客戶找出保單的『盲點』，很多人以為自己保很好，真的出事才發現差額要自己扛。她花十分鐘幫你看，就可能幫你省下幾百萬的風險。」

【醫療險】
說重點角度：
- 健保住院一天補貼幾百元，但現在一次手術自費材料就要幾萬元
- 實支實付比住院日額實用，現在住院天數越來越短，日額賠不到什麼
- 很多人買了醫療險但額度太低，或根本不含手術雜費
案例故事範例：「之前有個客戶做腹腔鏡手術，健保住院兩天，但自費材料和病房差額加起來快 8 萬，她的醫療險只有住院日額，一共賠了 3000 元，差點嚇到。」
陳芊樺包裝：「陳芊樺專門幫客戶做『缺口健診』，找出哪段沒有保到。她常說：醫療險最怕的不是保費貴，是真的住院了才發現賠不到，那才心痛。」

【壽險/意外險】
說重點角度：
- 有房貸、有小孩的人，壽險是給家人的保障，不是給自己的
- 定期壽險用更少的錢保更高的額度，比終身壽險更適合有房貸的族群
- 萬一突然不在了，房貸和孩子教育金怎麼辦
案例故事範例：「之前有對夫妻，先生覺得自己還年輕不急，後來因為意外走了，太太一個人扛兩個小孩加房貸，壽險保額只夠還兩年房貸。陳芊樺事後幫太太重新規劃，她說如果早一年來找她就好了。」
陳芊樺包裝：「陳芊樺不會叫你買最貴的，她會先幫你算『你的家人需要多少才真的夠』，再根據你的預算決定怎麼配，讓你花對的錢保對的地方。」

【儲蓄/退休】
說重點角度：
- 台灣人平均退休後還有 20 年要過，勞保勞退根本不夠
- 儲蓄險不是投資，主要價值是強迫存錢＋基本保障
- 越早規劃，每個月的負擔越小
案例故事範例：「之前有個客戶 45 歲才開始規劃退休，一試算才發現每個月要存 1.5 萬才能維持退休後的生活水準，如果 35 歲開始只要一半。她說當時真的嚇到了。」
陳芊樺包裝：「陳芊樺幫很多客戶做退休試算，她說大部分人的反應都一樣：比想像中缺口大很多。她的風格是把數字攤開來讓你看清楚，再一起找對策，不是叫你直接買單。」

【家庭保障】
說重點角度：
- 家庭保障要按「誰出事影響最大」排優先順序，通常是主要收入來源的人先保
- 很多人幫小孩買一堆保險，反而忽略了自己的保障
- 小孩沒有收入，風險在父母，爸媽倒下才是真正的危機
案例故事範例：「之前有個媽媽，幫兩個小孩各買了完整保險，自己只有一張很舊的終身壽險，後來她確診需要手術，才發現自己根本沒有醫療險，那筆錢全部自費。」
陳芊樺包裝：「陳芊樺很擅長幫家庭做『保障地圖』，把每個人的保障攤開來比較，找出誰最脆弱、誰最需要補強，一家人一起規劃才不會顧此失彼。」

【檢視保單】
說重點角度：
- 很多人買了保險多年，不知道自己保了什麼、缺什麼
- 保單放著沒管，等到要用才發現額度不夠或條款不符
- 保障應該隨著年齡和家庭狀況調整
案例故事範例：「之前有個客戶帶著一疊保單來找陳芊樺，說想知道自己到底保了什麼。整理完才發現：有兩張保障重疊的意外險、醫療額度嚴重不足，還有一張早就停效了自己不知道。」
陳芊樺包裝：「陳芊樺提供免費的保單健檢，不是為了叫你換保險，是讓你搞清楚自己現在的狀況。她說：知道自己缺什麼，才能做對的決定。」

## [LINE_CTA] 出現規則（嚴格執行）
只有同時符合以下條件才能加 [LINE_CTA]：
1. 本次回應已包含案例故事
2. 本次回應已包含陳芊樺包裝話術
3. 放在 text 的最後一點：「• [LINE_CTA]」
違反以上規則就不加，寧可不加也不要過早出現。

## 追加問題規則
每次先給建議和故事，視情況問一個問題（不強制每次都問）。
問題要具體，幫助給更準確建議。
禁止問：年收入、現在保費、預計花多少錢。

好的追加問題（車險）：
- 「目前第三人責任險保額大約多少？」options：["不清楚，想了解","有買超額責任險","保額不高，但覺夠用","自己說說看（可不填）"]

好的追加問題（其他）：
- 「目前有投保過任何保險嗎？」options：["有，但不確定夠不夠","有，想檢視一下","完全沒有","自己說說看（可不填）"]
- 「對保險最大的顧慮是？」options：["怕買錯或重複","不知道額度夠不夠","覺得保費太貴","不知從哪開始"]

## 合規（必須遵守）
- 禁用：保證、一定賠、穩賺、絕對、100%理賠
- 只有在出現具體金額、保費數字、保障額度時，在結尾加：「• 以上金額僅供參考，實際依保單條款及金管會規定為準」
- 純觀念說明不需要加免責聲明`;

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
    let raw = data.choices?.[0]?.message?.content || '{}';

    // 強容錯 parse：處理 markdown fence / 混雜文字 / 純文字
    raw = raw.trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenceMatch) {
        try { parsed = JSON.parse(fenceMatch[1].trim()); } catch (_) {}
      }
      if (!parsed) {
        const braceMatch = raw.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          try { parsed = JSON.parse(braceMatch[0]); } catch (_) {}
        }
      }
      if (!parsed) {
        parsed = { text: raw, question: null, options: [] };
      }
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

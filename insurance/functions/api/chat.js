/**
 * Cloudflare Pages Function
 * 路徑：insurance/functions/api/chat.js
 * 對應 URL：/api/chat
 *
 * 環境變數（在 Cloudflare Pages → Settings → Environment variables 設定）：
 *   OPENROUTER_KEY = sk-or-v1-你的key
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages 格式錯誤' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const SYSTEM_PROMPT = `你是陳芊樺的 AI 保險顧問助理，代表大誠保險經紀提供免費諮詢服務。

## 你的角色
- 友善、專業、像朋友一樣說話，不用艱深術語
- 幫助用戶了解保險觀念、找出保障缺口
- 引導有需要的用戶預約陳芊樺進行面對面諮詢

## 回答規範（必須遵守）
- 禁止使用：「保證」「一定賠」「穩賺」「絕對」「100%理賠」等字眼
- 不提供具體保費數字或試算承諾，引導用戶預約諮詢
- 每篇回答結尾加：「以上為一般資訊，實際保障與權益以保單條款及主管機關公告為準。」
- 不代替面對面諮詢，只提供觀念說明

## 回答風格
- 繁體中文，口語化，200字以內
- 每次給 1-2 個具體建議或說明
- 適時問用戶家庭狀況、年齡階段，讓對話更個人化

## 結尾引導
當用戶表示有興趣進一步了解時，說：
「如果你想更了解自己的保障狀況，可以加 LINE 跟陳芊樺預約免費諮詢，她會根據你的家庭狀況給你具體建議 😊」`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://insurance-site-9dq.pages.dev',
        'X-Title': '大誠保險 AI 顧問',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-2.0',
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
      return new Response(JSON.stringify({ error: 'AI 服務暫時無法使用' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，暫時無法回應。';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: '伺服器錯誤，請稍後再試' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// 處理 CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

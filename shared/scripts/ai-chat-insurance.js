/**
 * AI 保險顧問問答腳本
 * 使用 OpenRouter API + google/gemini-flash-2.0
 * 放置路徑：shared/scripts/ai-chat-insurance.js
 *
 * 使用方式：在 insurance/index.html 引入此檔案
 * 需設定 window.OPENROUTER_KEY = '你的 OpenRouter API Key'
 */

(function () {
  'use strict';

  /* ── 設定區 ── */
  const CONFIG = {
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemini-flash-2.0',
    maxTokens: 600,
    systemPrompt: `你是陳芊樺的 AI 保險顧問助理，代表大誠保險經紀提供免費諮詢服務。

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
- 如果用戶問題超出保險範圍，溫和轉回保險相關話題

## 結尾引導
當用戶表示有興趣進一步了解時，說：
「如果你想更了解自己的保障狀況，可以加 LINE 跟陳芊樺預約免費諮詢，她會根據你的家庭狀況給你具體建議 😊」`,
  };

  /* ── 狀態 ── */
  let messages = [];
  let isLoading = false;

  /* ── DOM 元素快取 ── */
  let chatBox, inputEl, sendBtn, loadingEl;

  /* ── 初始化 ── */
  function init() {
    const trigger = document.querySelector('[data-ai-trigger]');
    const modal = document.getElementById('ai-chat-modal');
    const closeBtn = document.getElementById('ai-chat-close');
    chatBox   = document.getElementById('ai-chat-messages');
    inputEl   = document.getElementById('ai-chat-input');
    sendBtn   = document.getElementById('ai-chat-send');
    loadingEl = document.getElementById('ai-chat-loading');

    if (!trigger || !modal) return;

    // 開啟對話框
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      modal.classList.add('open');
      if (messages.length === 0) addWelcome();
      setTimeout(() => inputEl && inputEl.focus(), 300);
    });

    // 關閉對話框
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('open');
    });

    // 送出訊息
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (inputEl) {
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });
    }

    // 快速問題按鈕
    document.querySelectorAll('[data-quick-q]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (inputEl) inputEl.value = btn.dataset.quickQ;
        sendMessage();
      });
    });
  }

  /* ── 歡迎訊息 ── */
  function addWelcome() {
    appendMessage('assistant', '你好！我是陳芊樺的 AI 保險顧問助理 👋\n\n你可以問我：\n• 我需要哪些保險？\n• 醫療險怎麼選？\n• 家庭保障夠不夠？\n\n請問你現在最想了解什麼？');
  }

  /* ── 送出訊息 ── */
  async function sendMessage() {
    if (!inputEl || isLoading) return;
    const text = inputEl.value.trim();
    if (!text) return;

    const key = window.OPENROUTER_KEY;
    if (!key) {
      appendMessage('assistant', '⚠️ 尚未設定 API Key，請聯繫網站管理員。');
      return;
    }

    inputEl.value = '';
    appendMessage('user', text);
    messages.push({ role: 'user', content: text });

    setLoading(true);

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key,
          'HTTP-Referer': window.location.origin,
          'X-Title': '大誠保險 AI 顧問',
        },
        body: JSON.stringify({
          model: CONFIG.model,
          max_tokens: CONFIG.maxTokens,
          messages: [
            { role: 'system', content: CONFIG.systemPrompt },
            ...messages.slice(-8), // 保留最近 8 則對話
          ],
        }),
      });

      if (!res.ok) throw new Error('API 回應錯誤：' + res.status);
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，我暫時無法回應，請稍後再試。';
      messages.push({ role: 'assistant', content: reply });
      appendMessage('assistant', reply);

    } catch (err) {
      console.error('AI Chat Error:', err);
      appendMessage('assistant', '抱歉，連線發生問題，請稍後再試，或直接加 LINE 聯繫陳芊樺 😊');
    } finally {
      setLoading(false);
    }
  }

  /* ── 渲染訊息 ── */
  function appendMessage(role, text) {
    if (!chatBox) return;
    const wrap = document.createElement('div');
    wrap.className = 'ai-msg ai-msg--' + role;

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble';
    // 換行處理
    bubble.innerHTML = text.replace(/\n/g, '<br>');

    wrap.appendChild(bubble);
    chatBox.appendChild(wrap);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  /* ── Loading 狀態 ── */
  function setLoading(state) {
    isLoading = state;
    if (sendBtn) sendBtn.disabled = state;
    if (loadingEl) loadingEl.style.display = state ? 'flex' : 'none';
    if (inputEl) inputEl.disabled = state;
  }

  /* ── 啟動 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

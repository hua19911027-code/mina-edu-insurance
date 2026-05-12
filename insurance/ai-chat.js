(function () {
  'use strict';
  const API_ENDPOINT = '/api/chat';
  let messages = [], isLoading = false;
  let chatBox, inputEl, sendBtn, loadingEl;

  function init() {
    const trigger = document.querySelector('[data-ai-trigger]');
    const modal   = document.getElementById('ai-chat-modal');
    const closeBtn = document.getElementById('ai-chat-close');
    chatBox   = document.getElementById('ai-chat-messages');
    inputEl   = document.getElementById('ai-chat-input');
    sendBtn   = document.getElementById('ai-chat-send');
    loadingEl = document.getElementById('ai-chat-loading');
    if (!trigger || !modal) return;
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      modal.classList.add('open');
      if (messages.length === 0) addWelcome();
      setTimeout(() => inputEl && inputEl.focus(), 300);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (inputEl) inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.querySelectorAll('[data-quick-q]').forEach(function (btn) {
      btn.addEventListener('click', function () { if (inputEl) inputEl.value = btn.dataset.quickQ; sendMessage(); });
    });
  }

  function addWelcome() {
    appendMessage('assistant', '你好！我是陳芊樺的 AI 保險顧問助理 👋\n\n你可以問我：\n• 我需要哪些保險？\n• 醫療險怎麼選？\n• 家庭保障夠不夠？\n\n請問你現在最想了解什麼？');
  }

  async function sendMessage() {
    if (!inputEl || isLoading) return;
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    appendMessage('user', text);
    messages.push({ role: 'user', content: text });
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.slice(-8) }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const reply = data.reply || '抱歉，我暫時無法回應，請稍後再試。';
      messages.push({ role: 'assistant', content: reply });
      appendMessage('assistant', reply);
    } catch (err) {
      console.error('AI Chat Error:', err);
      appendMessage('assistant', '抱歉，連線發生問題，請稍後再試，或直接加 LINE 聯繫陳芊樺 😊');
    } finally {
      setLoading(false);
    }
  }

  function appendMessage(role, text) {
    if (!chatBox) return;
    const wrap = document.createElement('div');
    wrap.className = 'ai-msg ai-msg--' + role;
    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    wrap.appendChild(bubble);
    chatBox.appendChild(wrap);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function setLoading(state) {
    isLoading = state;
    if (sendBtn) sendBtn.disabled = state;
    if (loadingEl) loadingEl.style.display = state ? 'flex' : 'none';
    if (inputEl) inputEl.disabled = state;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function () {
  'use strict';
  const API_ENDPOINT = '/api/chat';
  let messages = [], isLoading = false;
  let chatBox, inputEl, sendBtn, loadingEl, optionsEl, skipBtn;

  function init() {
    const trigger = document.querySelector('[data-ai-trigger]');
    const modal   = document.getElementById('ai-chat-modal');
    const closeBtn = document.getElementById('ai-chat-close');
    chatBox   = document.getElementById('ai-chat-messages');
    inputEl   = document.getElementById('ai-chat-input');
    sendBtn   = document.getElementById('ai-chat-send');
    loadingEl = document.getElementById('ai-chat-loading');

    // 建立選項區塊
    optionsEl = document.createElement('div');
    optionsEl.className = 'ai-options';
    optionsEl.style.display = 'none';
    chatBox.parentNode.insertBefore(optionsEl, chatBox.nextSibling);

    // 建立跳過按鈕
    skipBtn = document.createElement('button');
    skipBtn.className = 'ai-skip-btn';
    skipBtn.textContent = '跳過';
    skipBtn.style.display = 'none';
    skipBtn.addEventListener('click', function () {
      hideOptions();
      inputEl.value = '';
    });
    optionsEl.parentNode.insertBefore(skipBtn, optionsEl.nextSibling);

    if (!trigger || !modal) return;

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      modal.classList.add('open');
      if (messages.length === 0) startChat();
      setTimeout(() => inputEl && inputEl.focus(), 300);
    });

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (inputEl) {
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });
    }
  }

  function startChat() {
    sendToAPI([]);
  }

  function hideOptions() {
    optionsEl.style.display = 'none';
    optionsEl.innerHTML = '';
    skipBtn.style.display = 'none';
  }

  function showOptions(options) {
    hideOptions();
    optionsEl.style.display = 'flex';
    options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'ai-option-btn';
      btn.textContent = opt;
      if (opt === '自己說說看（可不填）') {
        btn.classList.add('ai-option-other');
        btn.addEventListener('click', function () {
          hideOptions();
          skipBtn.style.display = 'inline-block';
          inputEl.placeholder = '想補充什麼都可以，不填直接送出也 OK';
          inputEl.focus();
        });
      } else {
        btn.addEventListener('click', function () {
          hideOptions();
          inputEl.value = opt;
          sendMessage();
        });
      }
      optionsEl.appendChild(btn);
    });
  }

  async function sendMessage() {
    if (!inputEl || isLoading) return;
    const text = inputEl.value.trim();
    if (!text && skipBtn.style.display === 'none') return;
    const userText = text || '（略過）';
    inputEl.value = '';
    inputEl.placeholder = '輸入你的問題…';
    skipBtn.style.display = 'none';
    hideOptions();
    appendMessage('user', userText);
    messages.push({ role: 'user', content: userText });
    setLoading(true);
    await sendToAPI(messages);
  }

  async function sendToAPI(msgs) {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs.slice(-10) }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      const text = data.text || '抱歉，暫時無法回應。';
      const question = data.question || null;
      const options = data.options || [];

      const fullText = question ? text + '\n\n' + question : text;
      appendMessage('assistant', fullText);
      messages.push({ role: 'assistant', content: fullText });

      if (question && options.length > 0) {
        showOptions(options);
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      appendMessage('assistant', '• 抱歉，連線發生問題\n• 請稍後再試\n• 或直接加 LINE 聯繫陳芊樺 😊');
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

    if (role === 'assistant') {
      const lines = text.split('\n').filter(l => l.trim());
      lines.forEach(function (line) {
        const p = document.createElement('p');
        p.textContent = line.replace(/^•\s*/, '');
        if (line.startsWith('•')) p.className = 'ai-bullet';
        bubble.appendChild(p);
      });
    } else {
      bubble.textContent = text;
    }

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

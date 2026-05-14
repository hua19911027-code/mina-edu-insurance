(function () {
  'use strict';
  const API_ENDPOINT = '/api/chat';
  const LINE_URL = 'https://line.me/R/ti/p/@590binwn';

  let messages = [], isLoading = false;
  let chatBox, inputEl, sendBtn, loadingEl, formEl;

  const INTAKE = {
    grade: {
      label: '① 孩子幾年級？',
      options: ['小一', '小二', '小三', '小四', '小五', '小六'],
      selected: null
    },
    subject: {
      label: '② 想加強哪個科目？',
      options: ['英文', '數學', '英文 + 數學'],
      selected: null
    },
    concern: {
      label: '③ 目前最擔心的是？',
      options: ['跟不上學校進度', '成績起伏大', '孩子不愛讀書', '想提前打好基礎', '其他'],
      selected: null
    }
  };

  function init() {
    const modal = document.getElementById('edu-chat-modal');
    const closeBtn = document.getElementById('edu-chat-close');
    chatBox = document.getElementById('edu-chat-messages');
    inputEl = document.getElementById('edu-chat-input');
    sendBtn = document.getElementById('edu-chat-send');
    loadingEl = document.getElementById('edu-chat-loading');
    if (!modal) return;

    // 所有 data-edu-trigger 元素都觸發同一個 modal
    document.querySelectorAll('[data-edu-trigger]').forEach(function(trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.add('open');
        if (messages.length === 0 && !formEl) renderIntakeForm();
        setTimeout(() => inputEl && inputEl.focus(), 300);
      });
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

  function renderIntakeForm() {
    formEl = document.createElement('div');
    formEl.className = 'edu-intake-form';

    const welcome = document.createElement('div');
    welcome.className = 'edu-intake-welcome';
    welcome.innerHTML = '你好！先了解一下孩子的狀況<br>才能給你最準確的建議 👋';
    formEl.appendChild(welcome);

    ['grade', 'subject', 'concern'].forEach(key => formEl.appendChild(renderGroup(key)));

    const submitBtn = document.createElement('button');
    submitBtn.className = 'edu-intake-submit';
    submitBtn.textContent = '開始諮詢';
    submitBtn.disabled = true;
    submitBtn.addEventListener('click', submitIntake);
    formEl.appendChild(submitBtn);

    chatBox.appendChild(formEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function renderGroup(key) {
    const g = INTAKE[key];
    const wrap = document.createElement('div');
    wrap.className = 'edu-intake-group';
    const lbl = document.createElement('div');
    lbl.className = 'edu-intake-label';
    lbl.textContent = g.label;
    wrap.appendChild(lbl);
    const btns = document.createElement('div');
    btns.className = 'edu-intake-btns';
    g.options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'edu-intake-btn';
      btn.textContent = opt;
      btn.addEventListener('click', function () {
        btns.querySelectorAll('.edu-intake-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        g.selected = opt;
        checkSubmit();
      });
      btns.appendChild(btn);
    });
    wrap.appendChild(btns);
    return wrap;
  }

  function checkSubmit() {
    if (!formEl) return;
    const btn = formEl.querySelector('.edu-intake-submit');
    const ok = INTAKE.grade.selected && INTAKE.subject.selected && INTAKE.concern.selected;
    if (btn) btn.disabled = !ok;
  }

  function submitIntake() {
    const summary = `年級：${INTAKE.grade.selected}｜科目：${INTAKE.subject.selected}｜擔心：${INTAKE.concern.selected}`;
    formEl.remove();
    formEl = null;
    appendMessage('user', summary);
    messages.push({ role: 'user', content: summary });
    sendToAPI(messages);
  }

  async function sendMessage() {
    if (!inputEl || isLoading) return;
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    inputEl.placeholder = '輸入你的問題…';
    appendMessage('user', text);
    messages.push({ role: 'user', content: text });
    sendToAPI(messages);
  }

  async function sendToAPI(msgs) {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs.slice(-8) }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const text = data.text || '抱歉，暫時無法回應。';
      const question = data.question || null;
      const options = data.options || [];

      appendMessage('assistant', text);
      messages.push({ role: 'assistant', content: question ? text + '\n\n' + question : text });

      const hasQ = question && question.toLowerCase() !== 'null';
      if (hasQ) showOptions(options, question);

    } catch (err) {
      console.error('Edu Chat Error:', err);
      appendMessage('assistant', '抱歉，連線發生問題，請稍後再試，或直接加 LINE 詢問 😊');
    } finally {
      setLoading(false);
    }
  }

  function showOptions(options, question) {
    const wrap = document.createElement('div');
    wrap.className = 'edu-options';

    if (question) {
      const qLabel = document.createElement('div');
      qLabel.className = 'edu-options-question';
      qLabel.textContent = question;
      wrap.appendChild(qLabel);
    }

    (options.length > 0 ? options : ['了解，想多知道一點', '有類似狀況', '我的狀況不太一樣', '自己說說看（可在下方輸入）'])
      .forEach(function (opt) {
        const isOther = opt.startsWith('自己說說看');
        const btn = document.createElement('button');
        btn.className = 'edu-option-btn' + (isOther ? ' edu-option-other' : '');
        btn.textContent = opt;

        if (isOther) {
          btn.addEventListener('click', function () {
            if (wrap.querySelector('.edu-option-inline-input')) return;
            btn.classList.add('active');
            const inlineWrap = document.createElement('div');
            inlineWrap.className = 'edu-option-inline-wrap';
            const inlineInput = document.createElement('input');
            inlineInput.className = 'edu-option-inline-input';
            inlineInput.placeholder = '請在這裡輸入…';
            const inlineSend = document.createElement('button');
            inlineSend.className = 'edu-option-inline-send';
            inlineSend.textContent = '送出';
            function submitInline() {
              const val = inlineInput.value.trim();
              if (!val) return;
              wrap.remove();
              inputEl.value = val;
              sendMessage();
            }
            inlineSend.addEventListener('click', submitInline);
            inlineInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submitInline(); } });
            inlineWrap.appendChild(inlineInput);
            inlineWrap.appendChild(inlineSend);
            wrap.appendChild(inlineWrap);
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(() => inlineInput.focus(), 50);
          });
        } else {
          btn.addEventListener('click', function () {
            wrap.remove();
            inputEl.value = opt;
            sendMessage();
          });
        }
        wrap.appendChild(btn);
      });

    chatBox.appendChild(wrap);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function appendMessage(role, text) {
    if (!chatBox) return;
    const wrap = document.createElement('div');
    wrap.className = 'edu-msg edu-msg--' + role;
    const bubble = document.createElement('div');
    bubble.className = 'edu-bubble';

    if (role === 'assistant') {
      text.split('\n').forEach(function (line) {
        if (!line.trim() || line.trim().toLowerCase() === 'null') {
          const spacer = document.createElement('div');
          spacer.style.height = '8px';
          bubble.appendChild(spacer);
          return;
        }
        const clean = line.replace(/^[•♦\-]\s*/, '').trim();

        if (clean === '[LINE_CTA]') {
          const card = document.createElement('div');
          card.className = 'edu-line-card';
          card.innerHTML =
            '<p class="edu-line-card-lead">想預約免費試聽嗎？</p>' +
            '<a href="' + LINE_URL + '" target="_blank" rel="noopener" class="edu-line-btn">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">' +
            '<path d="M12 2C6.48 2 2 6.1 2 11.2c0 3.28 1.67 6.18 4.27 8.04L5.2 22l3.09-1.62C9.38 20.78 10.67 21 12 21c5.52 0 10-4.1 10-9.2C22 6.1 17.52 2 12 2z"/>' +
            '</svg>' +
            '加 LINE 預約免費試聽' +
            '</a>' +
            '<span class="edu-line-card-note">不用決定、不用準備・來試一堂就知道</span>';
          bubble.appendChild(card);
        } else if (clean === '[DIVIDER]') {
          const hr = document.createElement('div');
          hr.className = 'edu-section-divider';
          bubble.appendChild(hr);
        } else {
          const p = document.createElement('p');
          p.textContent = clean;
          if (line.trim().startsWith('•') || line.trim().startsWith('♦') || line.trim().startsWith('-')) {
            p.className = 'edu-bullet';
          }
          bubble.appendChild(p);
        }
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

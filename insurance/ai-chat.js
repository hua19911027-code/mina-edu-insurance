(function () {
  'use strict';
  const API_ENDPOINT = '/api/chat';
  let messages = [], isLoading = false;
  let chatBox, inputEl, sendBtn, loadingEl, formEl;

  const INTAKE = {
    age: { label: '① 年齡', options: ['25歲以下','26–35歲','36–45歲','46歲以上'], selected: null },
    family: { label: '② 家庭狀況', options: ['單身','已婚無小孩','已婚有小孩','其他'], selected: null },
    topic: {
      label: '③ 最想了解',
      options: ['醫療','壽險/意外','儲蓄/退休','家庭保障','產險/車險','檢視保單','其他'],
      sub: {
        '醫療': ['實支實付','住院日額','癌症險','重大傷病','手術險'],
        '壽險/意外': ['定期壽險','終身壽險','意外險','失能險'],
        '儲蓄/退休': ['儲蓄險','年金險','退休規劃','節稅'],
        '家庭保障': ['自己保障','配偶保險','小孩保障','房貸保障','遺產保障'],
        '產險/車險': ['汽車險','機車險','旅平險','小額壽險','意外險','火災地震險'],
      },
      selected: null,
      subSelected: [],
    },
  };

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
      if (messages.length === 0) renderIntakeForm();
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

  /* ── 開場表單 ── */
  function renderIntakeForm() {
    formEl = document.createElement('div');
    formEl.className = 'ai-intake-form';

    // 歡迎語
    const welcome = document.createElement('div');
    welcome.className = 'ai-intake-welcome';
    welcome.innerHTML = '你好！先了解你的狀況<br>才能給你最準確的建議 👋';
    formEl.appendChild(welcome);

    // 年齡
    formEl.appendChild(renderGroup('age'));
    // 家庭
    formEl.appendChild(renderGroup('family'));
    // 主題（含子選項）
    formEl.appendChild(renderTopicGroup());

    // 送出按鈕
    const submitBtn = document.createElement('button');
    submitBtn.className = 'ai-intake-submit';
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
    wrap.className = 'ai-intake-group';
    const lbl = document.createElement('div');
    lbl.className = 'ai-intake-label';
    lbl.textContent = g.label;
    wrap.appendChild(lbl);
    const btns = document.createElement('div');
    btns.className = 'ai-intake-btns';
    g.options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'ai-intake-btn';
      btn.textContent = opt;
      btn.addEventListener('click', function () {
        btns.querySelectorAll('.ai-intake-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        g.selected = opt;
        checkSubmit();
      });
      btns.appendChild(btn);
    });
    wrap.appendChild(btns);
    return wrap;
  }

  function renderTopicGroup() {
    const g = INTAKE.topic;
    const wrap = document.createElement('div');
    wrap.className = 'ai-intake-group';
    const lbl = document.createElement('div');
    lbl.className = 'ai-intake-label';
    lbl.textContent = g.label;
    wrap.appendChild(lbl);

    const btns = document.createElement('div');
    btns.className = 'ai-intake-btns';

    // 子選項區
    const subWrap = document.createElement('div');
    subWrap.className = 'ai-intake-sub';
    subWrap.style.display = 'none';

    // 其他輸入框
    const otherWrap = document.createElement('div');
    otherWrap.className = 'ai-intake-other-wrap';
    otherWrap.style.display = 'none';
    const otherInput = document.createElement('input');
    otherInput.className = 'ai-intake-other-input';
    otherInput.placeholder = '想補充什麼都可以，不填直接送出也 OK';
    otherInput.addEventListener('input', function () {
      g.subSelected = otherInput.value ? [otherInput.value] : [];
      checkSubmit();
    });
    otherWrap.appendChild(otherInput);

    g.options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'ai-intake-btn';
      btn.textContent = opt + (g.sub[opt] ? ' ▾' : '');
      btn.addEventListener('click', function () {
        btns.querySelectorAll('.ai-intake-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        g.selected = opt;
        g.subSelected = [];
        subWrap.style.display = 'none';
        subWrap.innerHTML = '';
        otherWrap.style.display = 'none';

        if (opt === '其他') {
          otherWrap.style.display = 'block';
          otherInput.focus();
        } else if (g.sub[opt]) {
          subWrap.style.display = 'flex';
          g.sub[opt].forEach(function (sub) {
            const sb = document.createElement('button');
            sb.className = 'ai-intake-sub-btn';
            sb.textContent = sub;
            sb.addEventListener('click', function () {
              sb.classList.toggle('selected');
              g.subSelected = Array.from(subWrap.querySelectorAll('.ai-intake-sub-btn.selected')).map(b => b.textContent);
              checkSubmit();
            });
            subWrap.appendChild(sb);
          });
        }
        checkSubmit();
      });
      btns.appendChild(btn);
    });

    wrap.appendChild(btns);
    wrap.appendChild(subWrap);
    wrap.appendChild(otherWrap);
    return wrap;
  }

  function checkSubmit() {
    if (!formEl) return;
    const btn = formEl.querySelector('.ai-intake-submit');
    const ok = INTAKE.age.selected && INTAKE.family.selected && INTAKE.topic.selected;
    if (btn) btn.disabled = !ok;
  }

  function submitIntake() {
    const age = INTAKE.age.selected;
    const family = INTAKE.family.selected;
    const topic = INTAKE.topic.selected;
    const subs = INTAKE.topic.subSelected;
    const detail = subs.length ? `（${subs.join('、')}）` : '';
    const summary = `年齡：${age}｜家庭：${family}｜想了解：${topic}${detail}`;

    formEl.remove();
    formEl = null;
    appendMessage('user', summary);
    messages.push({ role: 'user', content: summary });
    sendToAPI(messages);
  }

  /* ── 一般對話 ── */
  async function sendMessage() {
    if (!inputEl || isLoading) return;
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
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
        body: JSON.stringify({ messages: msgs.slice(-10) }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const text = data.text || '抱歉，暫時無法回應。';
      const question = data.question || null;
      const options = data.options || [];
      const fullText = text;
      appendMessage('assistant', fullText);
      if (question && question.toLowerCase() !== 'null') {
        const qEl = document.createElement('div');
        qEl.className = 'ai-msg ai-msg--assistant';
        const qBubble = document.createElement('div');
        qBubble.className = 'ai-bubble ai-question';
        qBubble.textContent = question;
        qEl.appendChild(qBubble);
        chatBox.appendChild(qEl);
        chatBox.scrollTop = chatBox.scrollHeight;
      }
      messages.push({ role: 'assistant', content: question && question.toLowerCase() !== 'null' ? fullText + '\n\n' + question : fullText });
      if (question && question.toLowerCase() !== 'null' && options.length > 0) showOptions(options);
    } catch (err) {
      console.error('AI Chat Error:', err);
      appendMessage('assistant', '• 抱歉，連線發生問題\n• 請稍後再試\n• 或直接加 LINE 聯繫陳芊樺 😊');
    } finally {
      setLoading(false);
    }
  }

  function showOptions(options) {
    const wrap = document.createElement('div');
    wrap.className = 'ai-options';
    options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'ai-option-btn';
      btn.textContent = opt;
      if (opt === '自己說說看（可不填）') {
        btn.classList.add('ai-option-other');
        btn.addEventListener('click', function () {
          wrap.remove();
          inputEl.placeholder = '想補充什麼都可以，不填直接送出也 OK';
          inputEl.focus();
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
    wrap.className = 'ai-msg ai-msg--' + role;
    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble';
    if (role === 'assistant') {
      text.split('\n').filter(l => l.trim() && l.trim().toLowerCase() !== 'null').forEach(function (line) {
        const p = document.createElement('p');
        p.textContent = line.replace(/^•\s*/, '');
        if (line.trim().startsWith('•')) p.className = 'ai-bullet';
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

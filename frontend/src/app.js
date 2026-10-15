// Retail Assistant Frontend Application Logic
const GATEWAY_URL = 'http://localhost:8080/api/v1/chat';
const STORE_INFO_URL = 'http://localhost:8080/api/v1/store/current';

let currentSessionId = 'session-' + Math.random().toString(36).substring(2, 10);
let currentStoreCode = 'STORE-001';

// DOM Elements
const messagesContainer = document.getElementById('messages-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const storeSelect = document.getElementById('store-select');
const backendStatusText = document.getElementById('backend-status-text');
const inspectBody = document.getElementById('inspect-body');
const clearChatBtn = document.getElementById('clear-chat-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkBackendHealth();
});

function setupEventListeners() {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserSubmit();
  });

  storeSelect.addEventListener('change', (e) => {
    currentStoreCode = e.target.value;
    currentSessionId = 'session-' + Math.random().toString(36).substring(2, 10);
    appendSystemNotice(`Đã chuyển sang ${e.target.options[e.target.selectedIndex].text}. Bắt đầu phiên làm việc mới.`);
    checkBackendHealth();
  });

  clearChatBtn.addEventListener('click', () => {
    currentSessionId = 'session-' + Math.random().toString(36).substring(2, 10);
    messagesContainer.innerHTML = '';
    appendAssistantWelcome();
    inspectBody.innerHTML = `
      <div class="empty-inspector">
        <p class="empty-icon">⚡</p>
        <p class="empty-text">Đã làm mới phiên hội thoại.</p>
        <p class="empty-subtext">Các lần gọi tool tiếp theo sẽ được ghi nhận tại đây.</p>
      </div>
    `;
  });

  // Suggestion chips delegation
  messagesContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip && chip.dataset.prompt) {
      userInput.value = chip.dataset.prompt;
      handleUserSubmit();
    }
  });
}

async function checkBackendHealth() {
  try {
    const res = await fetch(STORE_INFO_URL, {
      headers: { 'X-Store-Code': currentStoreCode }
    });
    if (res.ok) {
      const data = await res.json();
      backendStatusText.textContent = `Online: ${data.name} (ID: ${data.store_id})`;
      backendStatusText.parentElement.querySelector('.status-dot').classList.add('active');
    } else {
      backendStatusText.textContent = `Backend sẵn sàng (Port 8080)`;
    }
  } catch (err) {
    backendStatusText.textContent = `Chế độ Offline / Sẵn sàng khởi động`;
  }
}

async function handleUserSubmit() {
  const query = userInput.value.trim();
  if (!query) return;

  // Append user message
  appendUserMessage(query);
  userInput.value = '';
  userInput.focus();

  // Show typing indicator
  const typingId = appendTypingIndicator();

  try {
    const payload = {
      request_id: 'req-' + Math.random().toString(36).substring(2, 10),
      session_id: currentSessionId,
      message: query,
      context: {
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi-VN'
      }
    };

    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-Code': currentStoreCode
      },
      body: JSON.stringify(payload)
    });

    removeMessage(typingId);

    if (response.ok) {
      const result = await response.json();
      appendAssistantMessage(result);
      updateInspector(result);
    } else {
      const errData = await response.json().catch(() => ({}));
      appendAssistantErrorMessage(errData.answer || 'Không thể kết nối đến AI Service qua Spring Boot Gateway.');
    }
  } catch (err) {
    removeMessage(typingId);
    appendAssistantErrorMessage('Lỗi mạng: Không thể kết nối tới máy chủ Spring Boot (http://localhost:8080). Hãy chắc chắn backend và ai-service đang chạy.');
  }
}

function appendUserMessage(text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper user';
  wrapper.innerHTML = `
    <div class="avatar">👤</div>
    <div class="message-content">
      <div class="message-bubble">
        <p>${escapeHtml(text)}</p>
      </div>
    </div>
  `;
  messagesContainer.appendChild(wrapper);
  scrollToBottom();
}

function appendAssistantMessage(res) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper assistant';

  let toolPillsHtml = '';
  if (res.tool_calls && res.tool_calls.length > 0) {
    res.tool_calls.forEach(tc => {
      const statusClass = tc.status === 'success' ? 'status-success' : 'status-error';
      toolPillsHtml += `
        <div class="tool-badge-pill ${statusClass}">
          <span>⚙️ Tool: <strong>${escapeHtml(tc.name)}</strong></span>
          <span>(${escapeHtml(tc.status)})</span>
        </div>
      `;
    });
  }

  const formattedAnswer = formatAnswerText(res.answer || '');

  wrapper.innerHTML = `
    <div class="avatar">🤖</div>
    <div class="message-content">
      ${toolPillsHtml}
      <div class="message-bubble">
        ${formattedAnswer}
      </div>
    </div>
  `;
  messagesContainer.appendChild(wrapper);
  scrollToBottom();
}

function appendAssistantErrorMessage(errText) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper assistant';
  wrapper.innerHTML = `
    <div class="avatar">⚠️</div>
    <div class="message-content">
      <div class="message-bubble" style="border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.08);">
        <p><strong>Thông báo hệ thống:</strong> ${escapeHtml(errText)}</p>
      </div>
    </div>
  `;
  messagesContainer.appendChild(wrapper);
  scrollToBottom();
}

function appendSystemNotice(text) {
  const wrapper = document.createElement('div');
  wrapper.style.textAlign = 'center';
  wrapper.style.fontSize = '12px';
  wrapper.style.color = '#94a3b8';
  wrapper.style.margin = '10px 0';
  wrapper.innerHTML = `<span>ℹ️ ${escapeHtml(text)}</span>`;
  messagesContainer.appendChild(wrapper);
  scrollToBottom();
}

function appendAssistantWelcome() {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper assistant';
  wrapper.innerHTML = `
    <div class="avatar">🤖</div>
    <div class="message-content">
      <div class="message-bubble">
        <p><strong>Phiên mới đã sẵn sàng!</strong> Bạn muốn xem số liệu nào hôm nay?</p>
        <div class="suggestion-group">
          <div class="suggestion-chips">
            <button class="chip" data-prompt="Doanh thu hôm nay bán được bao nhiêu?">💰 Doanh thu hôm nay</button>
            <button class="chip" data-prompt="Top 5 sản phẩm bán chạy nhất là gì?">🏆 Top 5 sản phẩm</button>
            <button class="chip" data-prompt="Cửa hàng có mặt hàng nào sắp hết cần chú ý không?">⚠️ Cảnh báo hết hàng</button>
          </div>
        </div>
      </div>
    </div>
  `;
  messagesContainer.appendChild(wrapper);
  scrollToBottom();
}

function appendTypingIndicator() {
  const id = 'typing-' + Date.now();
  const wrapper = document.createElement('div');
  wrapper.id = id;
  wrapper.className = 'message-wrapper assistant';
  wrapper.innerHTML = `
    <div class="avatar">🤖</div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  messagesContainer.appendChild(wrapper);
  scrollToBottom();
  return id;
}

function removeMessage(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function updateInspector(res) {
  if (!res.tool_calls || res.tool_calls.length === 0) {
    inspectBody.innerHTML = `
      <div class="empty-inspector">
        <p class="empty-icon">💬</p>
        <p class="empty-text">Hội thoại không cần truy vấn Tool.</p>
        <p class="empty-subtext">Intent: <strong>${escapeHtml(res.intent || 'GENERAL')}</strong></p>
      </div>
    `;
    return;
  }

  let html = '';
  res.tool_calls.forEach(tc => {
    html += `
      <div class="inspector-card">
        <div class="inspector-card-header">
          <span class="inspector-tool-name">${escapeHtml(tc.name)}</span>
          <span class="inspector-status ${tc.status}">${escapeHtml(tc.status)}</span>
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">Tham số đầu vào (Arguments):</p>
        <pre class="inspector-json">${escapeHtml(JSON.stringify(tc.arguments || {}, null, 2))}</pre>
      </div>
    `;
  });

  if (res.data) {
    html += `
      <div class="inspector-card">
        <div class="inspector-card-header">
          <span class="inspector-tool-name">Dữ liệu thực tế (Grounded Data)</span>
          <span class="inspector-status success">BACKEND</span>
        </div>
        <pre class="inspector-json">${escapeHtml(JSON.stringify(res.data, null, 2))}</pre>
      </div>
    `;
  }

  inspectBody.innerHTML = html;
}

function formatAnswerText(text) {
  // Convert bullet points to list
  const lines = text.split('\n');
  let inList = false;
  let html = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        html += '<ul style="margin: 8px 0 8px 20px;">';
        inList = true;
      }
      html += `<li>${escapeHtml(trimmed.substring(2))}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (trimmed) {
        html += `<p style="margin-bottom: 8px;">${escapeHtml(trimmed)}</p>`;
      }
    }
  });

  if (inList) html += '</ul>';
  return html || `<p>${escapeHtml(text)}</p>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// ======= Enviar mensagem =======
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage('user', message);
  userInput.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    appendMessage('bot', data.reply || 'Desculpe, não entendi 😅');
  } catch (error) {
    appendMessage('bot', 'Erro ao conectar com o servidor ⚠️');
  }
}

// ======= Exibir mensagens no chat =======
function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

  if (sender === 'bot') {
    messageDiv.innerHTML = `<img src="bot-icon.png" alt="bot" /> <span>${text}</span>`;
  } else {
    messageDiv.textContent = text;
  }

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ======= Alternar entre modo claro e escuro =======
const themeToggle = document.getElementById('theme-toggle');
let isLight = false;

themeToggle.addEventListener('click', () => {
  isLight = !isLight;
  document.body.classList.toggle('light-mode', isLight);
  themeToggle.textContent = isLight ? '☀️' : '🌙';
});

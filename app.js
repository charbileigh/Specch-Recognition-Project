// Elements
const messageDiv = document.getElementById('message');
const resultText  = document.getElementById('result');
const startBtn    = document.getElementById('start-btn');

// Days data
const daysOfTheWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const pickRandomDay = () => daysOfTheWeek[Math.floor(Math.random() * daysOfTheWeek.length)];
let randomDay = pickRandomDay();

// SpeechRecognition feature-detect
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = Boolean(window.SpeechRecognition);

let recog = null;
let gameOver = false;
let started  = false;

// Guard: if no SpeechRecognition support
if (!supported) {
  if (resultText) {
    resultText.innerHTML = `<span style="color:#F54A19;">Your browser doesn't support Speech Recognition.</span>`;
  }
} else {
  recog = new window.SpeechRecognition();
  recog.lang = 'en-US';
  recog.interimResults = false;     // only final results
  recog.maxAlternatives = 1;
}

// Auto-restart handler (only while game active)
function autoRestart() {
  if (!gameOver && started) {
    try { recog.start(); } catch {}
  }
}

if (recog) {
  recog.addEventListener('result', onResult);
  recog.addEventListener('end', autoRestart);
}

// Start on user gesture (Play button)
if (startBtn) {
  startBtn.addEventListener('click', () => {
    if (!recog || started) return;
    started = true;
    startBtn.disabled = true;
    clearUI();
    try { recog.start(); } catch {}
  });
} else {
  // Fallback: if no start button exists, attempt to start on first user click anywhere
  document.addEventListener('click', function once() {
    if (!recog || started) return;
    started = true;
    try { recog.start(); } catch {}
    document.removeEventListener('click', once);
  });
}

// Handle speech results
function onResult(e) {
  const transcript = e.results[0][0].transcript;
  showMessage(transcript);
  checkDaysOfTheWeek(transcript);
}

// UI helpers
function showMessage(message) {
  if (!messageDiv) return;
  messageDiv.innerHTML = `<div>You said: ${escapeHTML(message)}</div>`;
}

function clearUI() {
  if (messageDiv) messageDiv.textContent = '';
  if (resultText) resultText.textContent = '';
}

// Game logic
function checkDaysOfTheWeek(message) {
  if (!resultText) return;

  const guess = message.trim().toLowerCase();
  const target = randomDay.toLowerCase();

  // Allow exact or substring match (e.g., "It's Tuesday")
  const isMatch = guess === target || guess.includes(target);

  if (isMatch && !gameOver) {
    gameOver = true;

    // Stop recognition and prevent auto-restart
    try { recog.removeEventListener('end', autoRestart); } catch {}
    try { recog.stop(); } catch {}

    resultText.innerHTML =
      `<span style="color:#A020F0;">Your guess is correct! (${randomDay})</span><br>
       <button id="play-again-btn" type="button">Play Again</button>`;
  } else if (!gameOver) {
    resultText.innerHTML =
      `<span style="color:#F54A19;">Oops! Incorrect. Try again.</span>`;
  }
}

// Play again (reset state and immediately listen again)
document.body.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'play-again-btn') {
    gameOver = false;
    randomDay = pickRandomDay();
    clearUI();

    // Reattach auto-restart and resume listening (this click counts as a gesture)
    if (recog) {
      try { recog.removeEventListener('end', autoRestart); } catch {}
      try { recog.addEventListener('end', autoRestart); } catch {}
      started = true; // keep session "active"
      try { recog.start(); } catch {}
    }

    // If there is a start button, keep it disabled while active
    if (startBtn) startBtn.disabled = true;
  }
});

// Basic HTML escape for safety when echoing user speech
function escapeHTML(str) {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

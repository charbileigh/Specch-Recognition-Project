// elements
const messageDiv = document.getElementById('message');
const resultText  = document.getElementById('result');
const startBtn    = document.getElementById('start-btn');

// data
const daysOfTheWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let randomDay = daysOfTheWeek[Math.floor(Math.random() * daysOfTheWeek.length)];

// speech setup (feature detect)
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
  resultText.innerHTML = `<span style="color:#F54A19;">Your browser doesn't support SpeechRecognition.</span>`;
}

const recog = window.SpeechRecognition ? new window.SpeechRecognition() : null;
let gameOver = false;
let started  = false;

if (recog) {
  // Optional config
  recog.lang = 'en-US';
  recog.interimResults = false;
  recog.maxAlternatives = 1;

  recog.addEventListener('result', getUserSpeech);
  recog.addEventListener('end', () => {
    if (!gameOver && started) recog.start(); // auto-restart only while game is active
  });
}

// start on user gesture
startBtn.addEventListener('click', () => {
  if (!recog) return;
  if (!started) {
    started = true;
    resultText.textContent = ''; // clear any previous message
    recog.start();
    startBtn.disabled = true;    // prevent double-starts
  }
});

// handle speech
function getUserSpeech(e) {
  const message = e.results[0][0].transcript;
  showMessage(message);
}

// show & check
function showMessage(message) {
  messageDiv.innerHTML = `<div>You said: ${message}</div>`;
  checkDaysOfTheWeek(message);
}

function checkDaysOfTheWeek(message) {
  const guess = message.trim().toLowerCase();
  const target = randomDay.toLowerCase();
  const isMatch = guess === target || guess.includes(target);

  if (isMatch) {
    gameOver = true;
    resultText.innerHTML = `
      <span style="color: #A020F0;">Your guess is correct! (${randomDay})</span><br>
     <button id="play-again-btn">Play Again</button>`
    recog.stop(); // don't restart
  } else {
    resultText.innerHTML = `<span style="color: #F54A19;">Oops! Incorrect. Try again.</span>`;
  }
}

// play again
document.body.addEventListener('click', (e) => {
  if (e.target.id === 'play-again-btn') {
    // reset state without reloading (optional)
    gameOver = false;
    started = false;
    startBtn.disabled = false;
    messageDiv.textContent = '';
    resultText.textContent = '';
    randomDay = daysOfTheWeek[Math.floor(Math.random() * daysOfTheWeek.length)];
  }
});


// ── State ──
let isListening = false;
let currentLang = "ml-IN";
let currentMode = "conversation";
let currentTopic = "daily life";
let sessionCount = 0;
let correctionCount = 0;
let recognition = null;

// ── Language Toggle ──
function toggleLang() {
  currentLang = currentLang === "ml-IN" ? "en-IN" : "ml-IN";
  const tag = document.getElementById("langIndicator");
  tag.textContent = currentLang;
}

// ── Mode Setter ──
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
}

// ── Topic Setter ──
function setTopic(el, topic) {
  currentTopic = topic;
  document.querySelectorAll(".topic-chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
}

// ── Mic Toggle ──
function toggleListening() {
  if (isListening) stopListening();
  else startListening();
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Use Chrome browser");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = currentLang;

  recognition.onstart = () => {
    isListening = true;
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    addUserMessage(text);
    sendToAI(text);
  };

  recognition.onend = stopListening;
  recognition.start();
}

function stopListening() {
  isListening = false;
  if (recognition) recognition.stop();
}

// ── Chat UI ──
function addUserMessage(text) {
  const chat = document.getElementById("chatContainer");

  const div = document.createElement("div");
  div.innerHTML = `
    <div class="msg-user">
      <div class="msg-bubble">${text}</div>
    </div>`;
  chat.appendChild(div);
}

// ── AI Message ──
function addAIMessage(text) {
  const chat = document.getElementById("chatContainer");

  const div = document.createElement("div");
  div.innerHTML = `
    <div class="msg-ai">
      <div class="msg-bubble">${text}</div>
    </div>`;
  chat.appendChild(div);

  speak(text);
}

// ── Voice ──
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.rate = 0.9;
  speechSynthesis.speak(speech);
}

// ── AI FUNCTION (FIXED) ──
async function sendToAI(userText) {
  try {
    const response = await fetch("https://speakup-backend-emxk.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userText
      })
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "Try again";

    addAIMessage(raw);

  } catch (error) {
    console.log(error);
    addAIMessage("Error connecting to AI");
  }
}

// ── Helpers ──
function clearChat() {
  document.getElementById("chatContainer").innerHTML = "";
}
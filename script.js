// ── State ──
let isListening = false;
let currentLang = "ml-IN";
let currentMode = "conversation";
let currentTopic = "daily life";
let sessionCount = 0;
let correctionCount = 0;
let wordCount = 0;
let recognition = null;

// ── Language Toggle ──
function toggleLang() {
  currentLang = currentLang === "ml-IN" ? "en-IN" : "ml-IN";
  const tag = document.getElementById("langIndicator");
  tag.textContent = currentLang;
  tag.style.color = currentLang === "en-IN" ? "#fb923c" : "#2dd4bf";

  showHint(currentLang === "ml-IN"
    ? "Malayalam mode — speak in മലയാളം"
    : "English mode — speak in English");
}

// ── Mode Setter ──
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");

  const topicBar = document.getElementById("topicBar");
  topicBar.style.display = mode === "conversation" ? "flex" : "none";

  showHint("Speak and I will guide you like a teacher 😊");
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
    addAIMessage("Use Chrome browser for voice support", null);
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = currentLang;

  recognition.onstart = () => {
    isListening = true;
    document.getElementById("micBtn").classList.add("listening");
    setStatus("listening");
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    addUserMessage(text);
    setStatus("thinking");
    sendToAI(text);
  };

  recognition.onend = stopListening;

  recognition.start();
}

function stopListening() {
  isListening = false;
  if (recognition) recognition.stop();
  document.getElementById("micBtn").classList.remove("listening");
  setStatus("idle");
}

// ── Status UI ──
function setStatus(state) {
  const el = document.getElementById("statusText");

  if (state === "idle") {
    el.textContent = "Ready to listen…";
    el.className = "status-idle";
  }
  if (state === "listening") {
    el.textContent = "🎙️ Listening…";
    el.className = "status-listening";
  }
  if (state === "thinking") {
    el.textContent = "⏳ Thinking…";
    el.className = "status-thinking";
  }
}

// ── Chat UI ──
function addUserMessage(text) {
  sessionCount++;
  document.getElementById("sessionCount").textContent = sessionCount;

  const chat = document.getElementById("chatContainer");
  const div = document.createElement("div");
  div.className = "chat-msg";

  div.innerHTML = `
    <div class="msg-user">
      <div class="msg-bubble">${text}</div>
      <div class="msg-avatar">🧑</div>
    </div>`;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function addTypingIndicator() {
  const chat = document.getElementById("chatContainer");
  const div = document.createElement("div");
  div.id = "typingIndicator";
  div.innerHTML = `
    <div class="msg-ai">
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">Thinking...</div>
    </div>`;
  chat.appendChild(div);
}

function removeTypingIndicator() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

// ── AI MESSAGE ──
function addAIMessage(text, correction) {
  removeTypingIndicator();

  const chat = document.getElementById("chatContainer");
  const div = document.createElement("div");

  let correctionHTML = "";

  if (correction && correction.hasCorrection) {
    correctionCount++;
    document.getElementById("correctionCount").textContent = correctionCount;

    correctionHTML = `
      <div class="correction-card">
        <div class="label">Correction</div>
        <div><span class="wrong">${correction.wrong || ""}</span></div>
        <div><span class="right">${correction.right || ""}</span></div>
        <div>${correction.tip || ""}</div>
      </div>`;
  }

  div.innerHTML = `
    <div class="msg-ai">
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">
        ${text}
        ${correctionHTML}
      </div>
    </div>`;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  // 🔊 Voice
  if (correction && correction.hasCorrection && correction.right) {
    speak("You said it incorrectly. You should say: " + correction.right);
    setTimeout(() => speak(text), 2500);
  } else {
    speak(text);
  }
}

// ── Voice ──
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.rate = 0.85;
  speechSynthesis.speak(speech);
}

// ── AI FUNCTION (FINAL FIX) ──
async function sendToAI(userText) {
  addTypingIndicator();

  const systemPrompt = `You are an intelligent, empathetic, and patient English tutor designed for Malayalam-speaking learners. Your mission: Help the user improve spoken English confidently through natural conversation. ━━━━━━━━━━━━━━━━━━━ 🧠 BEHAVIOR & PERSONALITY ━━━━━━━━━━━━━━━━━━━ - Speak like a friendly teacher (not robotic) - Be supportive, encouraging, and calm - Never make the user feel embarrassed - Motivate the user to keep speaking ━━━━━━━━━━━━━━━━━━━ 📝 CORRECTION STYLE (VERY IMPORTANT) ━━━━━━━━━━━━━━━━━━━ If the user makes a mistake: 1. Clearly say: "You said it incorrectly." 2. Then say: "You should say: ___" 3. Give a very short and simple reason (optional) 4. Then continue the conversation naturally ━━━━━━━━━━━━━━━━━━━ 🗣️ LANGUAGE HANDLING ━━━━━━━━━━━━━━━━━━━ - If user speaks Malayalam → understand and reply in simple English - Keep sentences easy and beginner-friendly - Avoid complex grammar explanations ━━━━━━━━━━━━━━━━━━━ 💬 CONVERSATION RULES ━━━━━━━━━━━━━━━━━━━ - Always continue the conversation - Always ask ONE follow-up question - Questions must be: ✔ Different every time ✔ Relevant to topic: "${currentTopic}" ✔ Interesting and practical ❌ NEVER repeat: - "What is your favorite book?" - "What did you eat?" ━━━━━━━━━━━━━━━━━━━ 🎯 TEACHING STYLE ━━━━━━━━━━━━━━━━━━━ - Teach naturally through conversation - Introduce new vocabulary when possible - Help user form better sentences - Improve communication, not just grammar ━━━━━━━━━━━━━━━━━━━ 📈 ADAPT TO USER LEVEL ━━━━━━━━━━━━━━━━━━━ - Assume user is beginner/intermediate - Use simple words - Keep reply short (3–5 lines) ━━━━━━━━━━━━━━━━━━━ 💡 EXAMPLE FLOW ━━━━━━━━━━━━━━━━━━━ User: "I am go to market yesterday" AI: "You said it incorrectly. You should say: I went to the market yesterday. That's okay, you're improving 😊 What did you buy from the market?" ━━━━━━━━━━━━━━━━━━━ ⚠️ OUTPUT FORMAT (STRICT) ━━━━━━━━━━━━━━━━━━━ Return ONLY valid JSON. No extra text. { "reply": "full response", "hasCorrection": true or false, "wrong": "user sentence", "right": "correct sentence", "tip": "simple explanation" } ;`; // 👈 paste your big prompt here

  try {
    const response = await fetch("https://speakup-backend-emxk.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userText,
        systemPrompt: systemPrompt
      })
    });

    const data = await response.json();

    let parsed;

    try {
      if (data.reply) {
        parsed = data;
      } else {
        const raw = data.choices?.[0]?.message?.content || "";
        const json = raw.substring(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
        parsed = JSON.parse(json);
      }
    } catch {
      parsed = { reply: "Try again", hasCorrection: false };
    }

    addAIMessage(parsed.reply, parsed);
    setStatus("idle");

  } catch (error) {
    removeTypingIndicator();
    addAIMessage("⚠️ Error connecting to AI", null);
    console.log(error);
  }
}

// ── Helpers ──
function showHint(text) {
  document.getElementById("hintText").textContent = text;
}

function clearChat() {
  document.getElementById("chatContainer").innerHTML = "";
}
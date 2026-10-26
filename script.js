import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

/*
  CONECTANDO MUNDOS — MULTIPLAYER
  Antes de jogar:
  1) Configure o Realtime Database e Authentication > Anônimo no Firebase.
  2) Configure as regras de segurança do banco (não deixe .read/.write públicos).
  3) Publique o site em uma URL HTTPS para que o QR Code funcione nos celulares.
  Nota: a pontuação deste protótipo é calculada no navegador. Para competições com
  pontuação inviolável, valide respostas/pontos em Cloud Functions.
*/

const firebaseConfig = {
  apiKey: "AIzaSyBLtTV-WMPL9zcqX39CaSJKu96rzSlwtgI",
  authDomain: "conectando-mundos-quiz.firebaseapp.com",
  databaseURL: "https://conectando-mundos-quiz-default-rtdb.firebaseio.com",
  projectId: "conectando-mundos-quiz",
  storageBucket: "conectando-mundos-quiz.firebasestorage.app",
  messagingSenderId: "575919623556",
  appId: "1:575919623556:web:463c15c4e0dcefbcf9e1d1",
  measurementId: "G-L1J6R28RS4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const questions = [
  {
    category: "POVOS INDÍGENAS",
    question: "Quem são os Potiguara abordados na apresentação?",
    answers: [
      "Um povo indígena ligado principalmente ao litoral norte da Paraíba",
      "Um povo originário da região Sul do Brasil",
      "Um grupo que surgiu com a internet",
      "Uma comunidade exclusivamente urbana",
    ],
    correct: 0,
    explanation:
      "Os Potiguara têm presença histórica no litoral norte da Paraíba, com destaque para municípios como Baía da Traição, Marcação e Rio Tinto.",
  },
  {
    category: "MITOLOGIA E TRADIÇÃO",
    question:
      "Por que é importante estudar as mitologias e tradições indígenas?",
    answers: [
      "Porque são apenas histórias antigas sem relação com o presente",
      "Porque ajudam a compreender visões de mundo, valores e saberes ancestrais",
      "Porque todas as comunidades possuem exatamente as mesmas tradições",
      "Porque substituem a história de cada povo",
    ],
    correct: 1,
    explanation:
      "Esses conhecimentos expressam visões de mundo, valores, memórias e saberes transmitidos entre gerações.",
  },
  {
    category: "ACESSO DIGITAL",
    question:
      "Qual é um desafio para ampliar o acesso indígena às tecnologias digitais?",
    answers: [
      "A ausência de qualquer interesse das comunidades",
      "A proibição mundial de celulares",
      "A conectividade, os custos, a infraestrutura e a formação digital",
      "O excesso de satélites em áreas urbanas",
    ],
    correct: 2,
    explanation:
      "A inclusão digital depende de conexão, equipamentos, infraestrutura e oportunidades de formação.",
  },
  {
    category: "PROTAGONISMO",
    question: "O que significa protagonismo indígena?",
    answers: [
      "Outras pessoas decidirem pelas comunidades",
      "As comunidades participarem e liderarem decisões sobre suas vidas e culturas",
      "Compartilhar todo conhecimento sem restrições",
      "Deixar de transmitir tradições",
    ],
    correct: 1,
    explanation:
      "O protagonismo reconhece a autonomia e a participação das próprias comunidades nas decisões que as afetam.",
  },
  {
    category: "PRÁTICAS CULTURAIS",
    question: "Qual prática cultural é mencionada na apresentação?",
    answers: [
      "Toré",
      "Fandango gaúcho como prática exclusiva dos Potiguara",
      "Flamenco",
      "Oktoberfest",
    ],
    correct: 0,
    explanation:
      "O Toré é mencionado entre as práticas culturais relacionadas aos povos abordados na apresentação.",
  },
  {
    category: "TERRITÓRIO E IDENTIDADE",
    question: "Por que o território é importante para a identidade indígena?",
    answers: [
      "É apenas uma área para construir casas",
      "Não tem relação com memória ou espiritualidade",
      "Relaciona-se à memória coletiva, à identidade e à espiritualidade",
      "Serve somente para delimitar municípios",
    ],
    correct: 2,
    explanation:
      "O território pode estar profundamente ligado à memória coletiva, à identidade, à ancestralidade e à espiritualidade.",
  },
  {
    category: "EDUCAÇÃO E DIREITOS",
    question: "O que estabelece a Lei brasileira 11.645/2008?",
    answers: [
      "A proibição de conteúdos indígenas nas escolas",
      "A obrigatoriedade do ensino de história e cultura afro-brasileira e indígena na educação básica",
      "A criação de uma única língua indígena nacional",
      "A substituição de todas as disciplinas por tecnologia",
    ],
    correct: 1,
    explanation:
      "A Lei 11.645/2008 tornou obrigatório o ensino de história e cultura afro-brasileira e indígena na educação básica.",
  },
  {
    category: "TECNOLOGIA E MEMÓRIA",
    question:
      "Como a tecnologia digital pode contribuir com os conhecimentos indígenas?",
    answers: [
      "Registrando e compartilhando conhecimentos de forma responsável, com participação das comunidades",
      "Publicando qualquer informação sem consultar ninguém",
      "Substituindo as pessoas mais velhas por aplicativos",
      "Apagando diferenças entre os povos",
    ],
    correct: 0,
    explanation:
      "A tecnologia pode apoiar a preservação e a divulgação, desde que respeite as comunidades e seus direitos.",
  },
  {
    category: "ÉTICA E RESPEITO",
    question:
      "Antes de publicar um conhecimento cultural restrito ou sagrado, o que deve ser considerado?",
    answers: [
      "Apenas a quantidade de visualizações",
      "Somente a qualidade da câmera",
      "O consentimento da comunidade e o respeito à autoria e às restrições culturais",
      "Se a publicação ficará popular",
    ],
    correct: 2,
    explanation:
      "Consentimento, autoria e respeito a conhecimentos privados ou sagrados são fundamentais.",
  },
  {
    category: "EDUCAÇÃO ESCOLAR INDÍGENA",
    question: "Como deve ser uma educação escolar indígena adequada?",
    answers: [
      "Idêntica em todos os detalhes para todas as comunidades",
      "Específica, diferenciada, intercultural e, quando pertinente, bilíngue e ligada à comunidade",
      "Sem participação comunitária",
      "Exclusivamente online",
    ],
    correct: 1,
    explanation:
      "A educação escolar indígena deve respeitar línguas, culturas, realidades e a participação das comunidades.",
  },
];

const $ = (id) => document.getElementById(id);
const screens = [
  "home-screen",
  "lobby-screen",
  "quiz-screen",
  "waiting-screen",
  "results-screen",
];
let currentUser = null,
  roomCode = null,
  isHost = false,
  roomData = null,
  playerData = null;
let questionIndex = 0,
  score = 0,
  timerId = null,
  secondsLeft = 20,
  hasAnswered = false;
let unsubscribeRoom = null,
  unsubscribePlayers = null,
  authReadyResolve;
const authReady = new Promise((resolve) => (authReadyResolve = resolve));

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) authReadyResolve(user);
});
signInAnonymously(auth).catch((error) => {
  showHomeMessage(
    "Não foi possível autenticar. Confira se o método Anônimo está ativado no Firebase.",
  );
  console.error(error);
});

function showScreen(id) {
  screens.forEach((screen) =>
    $(screen).classList.toggle("hidden", screen !== id),
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showHomeMessage(message) {
  $("home-message").textContent = message;
}
function showLobbyMessage(message) {
  $("lobby-message").textContent = message;
}
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.remove("hidden");
  setTimeout(() => $("toast").classList.add("hidden"), 2800);
}
function cleanName(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 22);
}
function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}
function safeText(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

$("create-room-btn").addEventListener("click", createRoom);
$("join-room-btn").addEventListener("click", joinRoom);
$("room-code-input").addEventListener(
  "input",
  (e) =>
    (e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")),
);
$("start-game-btn").addEventListener("click", startGame);
$("next-question-btn").addEventListener("click", nextQuestion);
$("copy-room-btn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(roomCode);
    toast("Código copiado!");
  } catch {
    toast(`Código da sala: ${roomCode}`);
  }
});
$("leave-room-btn").addEventListener("click", leaveRoom);
$("host-reveal-btn").addEventListener("click", revealResults);
$("back-home-btn").addEventListener("click", () => location.reload());

async function createRoom() {
  const name = cleanName($("player-name").value);
  if (!name) return showHomeMessage("Digite seu nome antes de criar a sala.");
  showHomeMessage("Conectando ao jogo…");
  try {
    await authReady;
    let code,
      roomRef,
      exists = true;
    for (let attempt = 0; attempt < 8 && exists; attempt++) {
      code = makeCode();
      roomRef = ref(db, `rooms/${code}`);
      exists = (await get(roomRef)).exists();
    }
    if (exists)
      throw new Error("Não foi possível gerar um código. Tente novamente.");
    roomCode = code;
    isHost = true;
    const now = Date.now();
    await set(roomRef, {
      code,
      hostUid: currentUser.uid,
      status: "lobby",
      createdAt: now,
      updatedAt: now,
      participants: {
        [currentUser.uid]: {
          uid: currentUser.uid,
          name,
          score: 0,
          finished: false,
          joinedAt: now,
          isHost: true,
        },
      },
    });
    playerData = { name, score: 0, finished: false, isHost: true };
    await enterLobby();
  } catch (error) {
    console.error(error);
    showHomeMessage(friendlyError(error));
  }
}

async function joinRoom() {
  const name = cleanName($("player-name").value);
  const code = $("room-code-input").value.trim().toUpperCase();
  if (!name) return showHomeMessage("Digite seu nome antes de entrar.");
  if (!/^[A-Z0-9]{5}$/.test(code))
    return showHomeMessage("Digite um código de sala com 5 caracteres.");
  showHomeMessage("Procurando sala…");
  try {
    await authReady;
    const roomRef = ref(db, `rooms/${code}`);
    const snap = await get(roomRef);
    if (!snap.exists())
      return showHomeMessage("Sala não encontrada. Confira o código.");
    const room = snap.val();
    if (room.status !== "lobby")
      return showHomeMessage("Essa partida já começou ou terminou.");
    roomCode = code;
    isHost = room.hostUid === currentUser.uid;
    playerData = {
      name,
      score: 0,
      finished: false,
      joinedAt: Date.now(),
      isHost,
    };
    await update(
      ref(db, `rooms/${code}/participants/${currentUser.uid}`),
      playerData,
    );
    await enterLobby();
  } catch (error) {
    console.error(error);
    showHomeMessage(friendlyError(error));
  }
}

function friendlyError(error) {
  if (
    error?.code === "PERMISSION_DENIED" ||
    /permission_denied/i.test(error?.message || "")
  ) {
    return "O Firebase está conectado, mas as regras do banco ainda bloqueiam o acesso. Vamos configurá-las antes de jogar.";
  }
  if (error?.code === "auth/operation-not-allowed")
    return "Ative o método de login Anônimo em Authentication > Método de login.";
  return "Não foi possível conectar. Confira a configuração do Firebase e tente novamente.";
}

async function enterLobby() {
  showScreen("lobby-screen");
  $("room-code-display").textContent = roomCode;
  $("start-game-btn").classList.toggle("hidden", !isHost);
  $("host-reveal-btn").classList.toggle("hidden", !isHost);
  $("lobby-message").textContent = "";
  renderQr();
  if (unsubscribeRoom) unsubscribeRoom();
  if (unsubscribePlayers) unsubscribePlayers();
  unsubscribeRoom = onValue(
    ref(db, `rooms/${roomCode}`),
    (snap) => {
      if (!snap.exists()) return;
      roomData = snap.val();
      if (
        roomData.status === "playing" &&
        $("quiz-screen").classList.contains("hidden") &&
        $("waiting-screen").classList.contains("hidden") &&
        $("results-screen").classList.contains("hidden")
      ) {
        beginQuiz();
      }
      if (roomData.status === "finished")
        renderResults(roomData.participants || {});
      updateParticipantList(roomData.participants || {});
      updateProgress(roomData.participants || {});
    },
    (error) => showLobbyMessage(friendlyError(error)),
  );
  $("lobby-status").textContent = "Aguardando participantes";
}

function renderQr() {
  const box = $("qrcode");
  box.innerHTML = "";
  const joinUrl = new URL("https://conectando-mundos-quiz.netlify.app/");
  joinUrl.searchParams.set("room", roomCode);
  const img = document.createElement("img");
  img.alt = "QR Code para entrar na sala";
  img.width = 170;
  img.height = 170;
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(joinUrl.toString())}`;
  img.onerror = () => {
    box.textContent = "Use o código da sala acima para entrar.";
  };
  box.appendChild(img);
}

function updateParticipantList(participants) {
  const entries = Object.values(participants).sort(
    (a, b) => (a.joinedAt || 0) - (b.joinedAt || 0),
  );
  $("participant-count").textContent = entries.length;
  $("participants-list").innerHTML = entries
    .map(
      (p) => `
    <li><span class="avatar">${safeText((p.name || "?").charAt(0).toUpperCase())}</span>
    <span class="participant-name">${safeText(p.name || "Jogador")}</span>
    ${p.uid === roomData?.hostUid ? '<span class="host-label">LÍDER</span>' : ""}
    ${p.finished ? '<span class="host-label">CONCLUIU</span>' : ""}</li>`,
    )
    .join("");
  $("waiting-hint").textContent =
    entries.length < 2
      ? "Compartilhe o QR Code para chamar mais jogadores."
      : "Todos conectados? O líder pode iniciar a partida.";
}

async function startGame() {
  if (!isHost || !roomCode) return;
  try {
    await update(ref(db, `rooms/${roomCode}`), {
      status: "playing",
      startedAt: Date.now(),
      questionCount: questions.length,
    });
  } catch (error) {
    showLobbyMessage(friendlyError(error));
  }
}

function beginQuiz() {
  clearInterval(timerId);
  questionIndex = 0;
  score = 0;
  hasAnswered = false;
  $("score-display").textContent = score;
  showScreen("quiz-screen");
  $("quiz-room-info").textContent = `Sala ${roomCode}`;
  renderQuestion();
}

function renderQuestion() {
  clearInterval(timerId);
  hasAnswered = false;
  secondsLeft = 20;
  const q = questions[questionIndex];
  $("question-counter").textContent =
    `Pergunta ${questionIndex + 1} de ${questions.length}`;
  $("question-category").textContent = q.category;
  $("question-text").textContent = q.question;
  $("timer-display").textContent = secondsLeft;
  $("progress-bar").style.width =
    `${(questionIndex / questions.length) * 100}%`;
  $("answers-container").innerHTML = "";
  $("answer-feedback").classList.add("hidden");
  $("next-question-btn").classList.add("hidden");
  q.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-option";
    button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${safeText(answer)}</span>`;
    button.addEventListener("click", () => answerQuestion(index, button));
    $("answers-container").appendChild(button);
  });
  timerId = setInterval(() => {
    secondsLeft--;
    $("timer-display").textContent = secondsLeft;
    if (secondsLeft <= 0) answerQuestion(-1, null);
  }, 1000);
}

async function answerQuestion(selected, clickedButton) {
  if (hasAnswered) return;
  hasAnswered = true;
  clearInterval(timerId);
  const q = questions[questionIndex];
  const buttons = [...$("answers-container").querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === q.correct) button.classList.add("correct");
    else if (index === selected) button.classList.add("incorrect");
  });
  if (selected === q.correct) score += 1000 + Math.max(0, secondsLeft) * 25;
  $("score-display").textContent = score;
  const feedback = $("answer-feedback");
  feedback.innerHTML = `<strong>${selected === q.correct ? "Resposta correta!" : selected < 0 ? "O tempo acabou!" : "Não foi dessa vez."}</strong> ${safeText(q.explanation)}`;
  feedback.classList.remove("hidden");
  $("next-question-btn").classList.remove("hidden");
  $("next-question-btn").textContent =
    questionIndex === questions.length - 1 ? "Concluir quiz ✓" : "Próxima →";
  try {
    await update(ref(db, `rooms/${roomCode}/participants/${currentUser.uid}`), {
      score,
      lastAnswered: questionIndex,
      lastAnswer: selected,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error(error);
  }
}

async function nextQuestion() {
  if (!hasAnswered) return;
  if (questionIndex < questions.length - 1) {
    questionIndex++;
    renderQuestion();
  } else {
    clearInterval(timerId);
    try {
      await update(
        ref(db, `rooms/${roomCode}/participants/${currentUser.uid}`),
        { score, finished: true, finishedAt: Date.now() },
      );
      showScreen("waiting-screen");
      $("waiting-score").textContent = score.toLocaleString("pt-BR");
      $("host-reveal-btn").classList.toggle("hidden", !isHost);
      updateProgress(roomData?.participants || {});
    } catch (error) {
      toast(friendlyError(error));
    }
  }
}

function updateProgress(participants) {
  const entries = Object.values(participants);
  const finished = entries.filter((p) => p.finished).length;
  const total = entries.length;
  $("finished-count").textContent = total
    ? `${finished}/${total} concluíram`
    : "";
  $("waiting-count").textContent = total
    ? `${finished} de ${total} participantes concluíram.`
    : "Aguardando os demais jogadores…";
  $("finished-progress-bar").style.width = total
    ? `${(finished / total) * 100}%`
    : "0%";
  if (total > 0 && finished === total && roomData?.status === "playing")
    revealResults();
}

async function revealResults() {
  if (!isHost || !roomCode) return;
  try {
    await update(ref(db, `rooms/${roomCode}`), {
      status: "finished",
      finishedAt: Date.now(),
    });
  } catch (error) {
    toast(friendlyError(error));
  }
}

function renderResults(participants) {
  clearInterval(timerId);
  const entries = Object.values(participants).sort(
    (a, b) =>
      (b.score || 0) - (a.score || 0) ||
      (a.finishedAt || 0) - (b.finishedAt || 0),
  );
  const medals = ["🥇", "🥈", "🥉"];
  const classes = ["first", "second", "third"];
  const positions = [entries[1], entries[0], entries[2]];
  $("podium").innerHTML = positions
    .map((p, i) =>
      p
        ? `
    <div class="podium-place ${classes[i]}"><div class="podium-medal">${medals[i === 0 ? 1 : i === 1 ? 0 : 2]}</div>
    <strong>${safeText(p.name)}</strong><span>${i === 1 ? "1º lugar" : i === 0 ? "2º lugar" : "3º lugar"}</span>
    <b>${(p.score || 0).toLocaleString("pt-BR")}</b></div>`
        : `<div class="podium-place ${classes[i]}"><div class="podium-medal">${medals[i === 0 ? 1 : i === 1 ? 0 : 2]}</div><strong>—</strong><span>${i === 1 ? "1º lugar" : i === 0 ? "2º lugar" : "3º lugar"}</span><b>—</b></div>`,
    )
    .join("");
  $("final-ranking").innerHTML = entries
    .map(
      (p) =>
        `<li><span class="avatar">${safeText((p.name || "?").charAt(0).toUpperCase())}</span><span>${safeText(p.name || "Jogador")}</span><strong>${(p.score || 0).toLocaleString("pt-BR")} pts</strong></li>`,
    )
    .join("");
  showScreen("results-screen");
}

async function leaveRoom() {
  clearInterval(timerId);
  if (unsubscribeRoom) unsubscribeRoom();
  if (unsubscribePlayers) unsubscribePlayers();
  if (roomCode && currentUser && !isHost) {
    try {
      await set(
        ref(db, `rooms/${roomCode}/participants/${currentUser.uid}`),
        null,
      );
    } catch {}
  }
  roomCode = null;
  roomData = null;
  playerData = null;
  isHost = false;
  showScreen("home-screen");
}

const requestedRoom = new URLSearchParams(location.search).get("room");
if (requestedRoom) {
  $("room-code-input").value = requestedRoom.toUpperCase().slice(0, 5);
  $("player-name").focus();
}

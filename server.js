const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.static(path.join(__dirname, 'public')));

const COPYRIGHT_TEXT = "محمد العقيلي HIM.PY";

// قواميس البيانات باللغتين
const PRODUCTS = ["LibraryApp", "PayPortal", "PrintServer", "VPN Gateway", "ChatApp", "StudentPortal", "Antivirus", "Backup Server", "Email Filter", "File Share", "WebServer", "HR Portal", "Router Firmware", "Cloud Storage", "Dev Tools", "Public API", "Backup Tape", "Mobile App", "Old CRM", "Wi-Fi Guest"];
const CONDITIONS = [
  { ar: "تسجيل دخول الزوار مُفعّل", en: "Guest login enabled" },
  { ar: "الجلسة لا تنتهي بعد الخروج", en: "Session doesn't expire after logout" },
  { ar: "ثغرة في خدمة الطباعة", en: "Print service vulnerability" },
  { ar: "ثغرة في المصادقة الثنائية", en: "2FA vulnerability" },
  { ar: "رسائل غير مشفرة", en: "Unencrypted messages" },
  { ar: "ثغرة في رفع الملفات", en: "File upload vulnerability" },
  { ar: "ثغرة في محرك الفحص", en: "Scan engine vulnerability" },
  { ar: "ثغرة في استعادة النسخ", en: "Backup restore vulnerability" },
  { ar: "تجاوز فلتر البريد", en: "Email filter bypass" },
  { ar: "صلاحيات مفتوحة", en: "Open permissions" },
  { ar: "ثغرة تنفيذ أوامر عن بُعد", en: "Remote Code Execution (RCE)" },
  { ar: "تسريب بيانات الموظفين", en: "Employee data leak" },
  { ar: "كلمة مرور افتراضية", en: "Default password" },
  { ar: "روابط مشاركة دائمة", en: "Permanent share links" }
];

const IMPACTS = [
  { ar: "وصول غير مصرّح للبيانات", en: "Unauthorized data access" },
  { ar: "سرقة جلسات العملاء", en: "Customer session theft" },
  { ar: "تسريب مستندات داخلية", en: "Internal document leak" },
  { ar: "دخول غير مصرّح للشبكة", en: "Unauthorized network access" },
  { ar: "كشف محادثات الموظفين", en: "Employee chat exposure" },
  { ar: "رفع ملفات خبيثة", en: "Malicious file upload" },
  { ar: "تجاوز الفحص الأمني", en: "Security check bypass" },
  { ar: "فشل استعادة البيانات", en: "Data restore failure" },
  { ar: "وصول تصيّد للموظفين", en: "Phishing access to employees" },
  { ar: "وصول لملفات حساسة", en: "Sensitive file access" },
  { ar: "اختراق كامل للخادم", en: "Full server compromise" },
  { ar: "كشف رواتب وبيانات شخصية", en: "Salaries & PII exposure" }
];

const CONTEXT_LOW = [
  { ar: "غير مثبت لدينا", en: "Not installed here" },
  { ar: "نسخة اختبارية معزولة بلا بيانات", en: "Isolated test version, no data" },
  { ar: "داخل شبكة الموظفين + جدار حماية", en: "Internal network + firewall" },
  { ar: "8 موظفين فقط، لا بيانات حساسة", en: "Only 8 employees, no sensitive data" },
  { ar: "التحديث طُبّق تلقائياً أمس", en: "Update applied automatically yesterday" },
  { ar: "توعية + نظام كشف ثانٍ", en: "Awareness + secondary detection system" },
  { ar: "تم تغيير كلمة المرور بالفعل", en: "Password already changed" },
  { ar: "خادم داخلي مغلق، لا يوجد اتصال بالإنترنت", en: "Closed internal server, no internet" }
];

const CONTEXT_HIGH = [
  { ar: "صفحة عامة يومية — لا ضوابط", en: "Public daily page — no controls" },
  { ar: "مثبت، يستخدمه الكل عن بُعد، لا بديل", en: "Installed, used by all remotely, no alternative" },
  { ar: "2000 طالب يومياً + لا فحص للملفات", en: "2000 students daily + no file scanning" },
  { ar: "لا نسخة بديلة، لا اختبار منذ 6 أشهر", en: "No backup, no testing for 6 months" },
  { ar: "الجميع يستخدمه، لا تدقيق منذ سنة", en: "Everyone uses it, no audit for a year" },
  { ar: "مثبت، يستخدمه كل الموظفين، بلا تشفير", en: "Installed, used by all employees, no encryption" },
  { ar: "مفتوح للإنترنت، يستخدمه آلاف العملاء", en: "Open to internet, used by thousands" },
  { ar: "مفتوح للإنترنت بالكامل، بيانات مكشوفة", en: "Fully open to internet, data exposed" }
];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffleArray(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function generateQuestionByType(type) {
  let realSev, fakeSev;
  let realCondition, fakeCondition;
  let realContext, fakeContext;
  let isTrap = false; 
  let isExpert = false;
  let points = 2;

  if (type === 'context') {
    points = 3;
    realSev = (Math.random() * 1.9 + 8.0).toFixed(1);
    fakeSev = (Math.random() * 1.9 + 8.0).toFixed(1);
    realCondition = getRandom(CONDITIONS); fakeCondition = realCondition;
    realContext = getRandom(CONTEXT_HIGH);
    fakeContext = getRandom(CONTEXT_LOW);
  } else if (type === 'trap') {
    points = 2; isTrap = true;
    realSev = (Math.random() * 1.5 + 8.5).toFixed(1);
    fakeSev = (Math.random() * 1.5 + 8.5).toFixed(1);
    realCondition = { ar: "ثغرة تنفيذ أوامر عن بُعد (RCE)", en: "Remote Code Execution (RCE)" };
    fakeCondition = { ar: "ثغرة إفصاح عن معلومات بسيطة", en: "Simple Information Disclosure" };
    realContext = getRandom(CONTEXT_HIGH); fakeContext = realContext;
  } else if (type === 'nature') {
    points = 3;
    realSev = (Math.random() * 1.5 + 7.5).toFixed(1);
    fakeSev = (Math.random() * 1.5 + 7.5).toFixed(1);
    realCondition = { ar: "ثغرة تنفيذ أوامر عن بُعد (RCE)", en: "Remote Code Execution (RCE)" };
    fakeCondition = { ar: "ثغرة إفصاح عن معلومات حساسة", en: "Sensitive Information Disclosure" };
    realContext = { ar: "خادم داخلي، لكن الثغرة تسمح بالتحكم الكامل", en: "Internal server, but allows full control" };
    fakeContext = { ar: "خادم داخلي، الثغرة تكشف مسارات الملفات", en: "Internal server, discloses file paths" };
  } else if (type === 'balance') {
    points = 2; isTrap = Math.random() < 0.5;
    if (isTrap) {
      realSev = (Math.random() * 1.5 + 8.5).toFixed(1); fakeSev = (Math.random() * 1.5 + 7.5).toFixed(1);
    } else {
      const base = Math.random() * 1.5 + 7.5;
      realSev = (base + 0.1).toFixed(1); fakeSev = base.toFixed(1);
    }
    realCondition = { ar: "ثغرة في المصادقة", en: "Authentication vulnerability" };
    fakeCondition = { ar: "ثغرة في التسجيل", en: "Logging vulnerability" };
    realContext = { ar: "خادم داخلي، الثغرة تسمح بتجاوز الحماية", en: "Internal server, allows bypassing protection" };
    fakeContext = { ar: "خادم داخلي، الثغرة تكشف سجلات بسيطة", en: "Internal server, reveals simple logs" };
  } else if (type === 'expert') {
    points = 4; isExpert = true;
    realSev = (Math.random() * 1.0 + 8.5).toFixed(1);
    realCondition = { ar: "ثغرة تجاوز المصادقة الثنائية (2FA)", en: "2FA Bypass vulnerability" };
    realContext = getRandom(CONTEXT_HIGH);
    fakeSev = (Math.random() * 0.5 + 9.5).toFixed(1);
    fakeCondition = { ar: "ثغرة تسريب معلومات", en: "Information Disclosure" };
    fakeContext = realContext;
  }

  const dangerInA = Math.random() < 0.5;
  const realProduct = `${getRandom(PRODUCTS)} ${getRandomInt(1,5)}.${getRandomInt(0,9)}`;
  const realImpact = getRandom(IMPACTS);
  const fakeProduct = `${getRandom(PRODUCTS)} ${getRandomInt(1,5)}.${getRandomInt(0,9)}`;
  const fakeImpact = getRandom(IMPACTS);

  const cardA = dangerInA ? { product: realProduct, severity: parseFloat(realSev), condition: realCondition, impact: realImpact, context: realContext } : { product: fakeProduct, severity: parseFloat(fakeSev), condition: fakeCondition, impact: fakeImpact, context: fakeContext };
  const cardB = dangerInA ? { product: fakeProduct, severity: parseFloat(fakeSev), condition: fakeCondition, impact: fakeImpact, context: fakeContext } : { product: realProduct, severity: parseFloat(realSev), condition: realCondition, impact: realImpact, context: realContext };
  
  const correctLetter = dangerInA ? "A" : "B";
  const wrongLetter = dangerInA ? "B" : "A";
  const realCard = dangerInA ? cardA : cardB;
  const fakeCard = dangerInA ? cardB : cardA;

  // شرح باللغتين
  let arExplain = `البطاقة ${correctLetter} هي الخطر الحقيقي لأن طبيعة الثغرة (${realCard.condition.ar}) أو السياق المحلي (${realCard.context.ar}) يجعلها أولوية قصوى، بينما البطاقة ${wrongLetter} أقل خطورة.`;
  let enExplain = `Card ${correctLetter} is the real threat because its nature (${realCard.condition.en}) or local context (${realCard.context.en}) makes it a top priority, while Card ${wrongLetter} is less risky.`;

  if (isExpert) {
    arExplain = `انتبه! البطاقة ${wrongLetter} شدتها ${fakeCard.severity}، لكنها لا تسمح بالدخول. بينما البطاقة ${correctLetter} شدتها ${realCard.severity}، لكنها تسمح بالدخول كمدير. الشدة وحدها لا تكفي!`;
    enExplain = `Watch out! Card ${wrongLetter} has severity ${fakeCard.severity} but doesn't allow access. Card ${correctLetter} has severity ${realCard.severity} but allows admin access. Severity alone isn't enough!`;
  } else if (isTrap) {
    arExplain = `في هذه الجولة، كلتاهما خطيرتان! لكن البطاقة ${correctLetter} طبيعتها أخطر وشدتها أعلى.`;
    enExplain = `In this round, both are dangerous! But Card ${correctLetter} is more severe and has a higher score.`;
  }

  // توليد أسباب عشوائية (بسيطة للعرض)
  const arReasons = [
    { text: `البطاقة ${correctLetter}: لأن السياق المحلي (${realCard.context.ar}) يجعلها مكشوفة للخطر أكثر.`, correct: true },
    { text: `البطاقة ${wrongLetter}: لأن درجة شدتها (${fakeCard.severity}) هي الأعلى.`, correct: false },
    { text: "كلتاهما آمنتان.", correct: false },
    { text: "لا يمكن تحديد الأولوية.", correct: false }
  ];
  const enReasons = [
    { text: `Card ${correctLetter}: Because the local context (${realCard.context.en}) makes it more exposed.`, correct: true },
    { text: `Card ${wrongLetter}: Because its severity (${fakeCard.severity}) is the highest.`, correct: false },
    { text: "Both are safe.", correct: false },
    { text: "Priority cannot be determined.", correct: false }
  ];

  return { 
    A: cardA, B: cardB, correct: correctLetter, 
    reasons_ar: shuffleArray(arReasons), reasons_en: shuffleArray(enReasons), 
    points: points,
    explain_ar: arExplain, explain_en: enExplain
  };
}

function generateRoomBank() {
  const bank = [];
  const types = ['context', 'context', 'context', 'context', 'trap', 'trap', 'trap', 'trap', 'trap', 'nature', 'nature', 'nature', 'nature', 'balance', 'balance', 'balance', 'expert', 'expert']; 
  for (let i = 0; i < 5; i++) { 
    bank.push(shuffleArray(types).slice(0, 10).map(t => generateQuestionByType(t)));
  }
  return bank;
}

const ROOM_BANK = generateRoomBank();
const rooms = {};

function makeCode() { return Math.random().toString(36).substring(2, 6).toUpperCase(); }

function publicRoom(room) {
  return { mode: room.mode, phase: room.phase, distributed: room.distributed, players: room.players.map(p => ({ id: p.id, name: p.name })), teams: room.teams.map((t, i) => ({ id: i, name: t.name, members: t.members.map(m => m.name), score: t.score })), scores: room.playerScores };
}

function setupTeams(room, groups) {
  room.teams = groups.map((members, i) => ({ name: 'الفريق ' + (i + 1), members: members.map(m => ({ id: m.id, name: m.name, socketId: m.socketId })), score: 0 }));
  room.distributed = true; room.phase = 'distributed';
  room.teams.forEach((team, idx) => {
    team.members.forEach(m => {
      io.to(m.socketId).emit('youAreInTeam', { teamIdx: idx, teamName: team.name, members: team.members.map(x => x.name) });
      const s = io.sockets.sockets.get(m.socketId); if (s) s.playerTeamIdx = idx;
    });
  });
  io.to(room.hostSocket).emit('roomUpdate', publicRoom(room));
  io.to(room.hostSocket).emit('distributed', publicRoom(room));
}

function finishRound(room) {
  if (room.roundTimeout) clearTimeout(room.roundTimeout);
  room.players.forEach(p => {
    if (!room.playerAnswers[p.id]) room.playerAnswers[p.id] = "None";
    if (room.playerReasons[p.id] === undefined) room.playerReasons[p.id] = -1;
  });
  if (room.mode === 'solo') revealSolo(room); else revealTeamFractional(room);
}

io.on('connection', (socket) => {
  socket.emit('copyright', { text: COPYRIGHT_TEXT });

  socket.on('createRoom', ({ mode }, cb) => {
    const code = makeCode();
    const selectedRounds = getRandom(ROOM_BANK); 
    rooms[code] = { hostSocket: socket.id, mode: mode || 'team', rounds: selectedRounds, players: [], teams: [], distributed: false, round: 0, phase: 'waiting', playerScores: {}, playerAnswers: {}, playerReasons: {} };
    socket.join(code); socket.roomCode = code; cb({ code, mode: rooms[code].mode });
  });

  socket.on('joinRoom', ({ code, name }, cb) => {
    code = (code || '').toUpperCase(); const room = rooms[code];
    if (!room || (room.phase !== 'waiting' && room.phase !== 'distributed')) return cb({ error: 'الغرفة غير متاحة' });
    const playerId = 'P' + Date.now();
    room.players.push({ id: playerId, name: name || 'لاعب', socketId: socket.id });
    room.playerScores[playerId] = 0;
    socket.join(code); socket.roomCode = code; socket.playerId = playerId; socket.playerTeamIdx = null;
    io.to(room.hostSocket).emit('roomUpdate', publicRoom(room));
    cb({ ok: true, playerId, name, mode: room.mode });
  });

  socket.on('distributeRandom', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.mode !== 'team' || room.players.length < 2) return;
    const shuffled = shuffleArray(room.players);
    const groups = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      groups.push([shuffled[i]]);
      if (shuffled[i + 1]) groups[groups.length - 1].push(shuffled[i + 1]);
    }
    if (groups.length > 1 && groups[groups.length - 1].length === 1) groups[groups.length - 2].push(groups.pop()[0]);
    setupTeams(room, groups);
  });

  socket.on('startRound', () => {
    const room = rooms[socket.roomCode];
    if (!room || (room.mode === 'team' && !room.distributed)) return;
    room.round++;
    room.phase = 'question';
    room.playerAnswers = {}; room.playerReasons = {};
    const data = room.rounds[room.round - 1];
    
    io.to(room.hostSocket).emit('roundStartedHost', { round: room.round, total: 10, data, mode: room.mode });
    room.players.forEach(p => io.to(p.socketId).emit('roundStarted', { round: room.round, total: 10, data, mode: room.mode }));

    if (room.roundTimeout) clearTimeout(room.roundTimeout);
    room.roundTimeout = setTimeout(() => {
      const currentRoom = rooms[socket.roomCode];
      if (currentRoom && currentRoom.phase !== 'reveal') finishRound(currentRoom);
    }, 35000);
  });

  socket.on('pickCard', ({ card }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase !== 'question') return;
    const currentRound = room.rounds[room.round - 1];
    room.playerAnswers[socket.playerId] = card;
    
    if (card !== currentRound.correct) {
      socket.emit('wrongAnswer', { 
        correct: currentRound.correct, 
        explain_ar: currentRound.explain_ar, 
        explain_en: currentRound.explain_en 
      });
      room.playerReasons[socket.playerId] = -1;
    } else {
      socket.emit('showReasons', { 
        reasons_ar: currentRound.reasons_ar, 
        reasons_en: currentRound.reasons_en 
      });
    }

    const answeredNames = room.players.filter(p => room.playerAnswers[p.id]).map(p => p.name);
    io.to(room.hostSocket).emit('progressUpdate', { answeredNames, total: room.players.length });

    if (Object.keys(room.playerAnswers).length === room.players.length) finishRound(room);
  });

  socket.on('pickReason', ({ idx }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase === 'reveal') return;
    room.playerReasons[socket.playerId] = idx;
    if (Object.keys(room.playerReasons).length === room.players.length) finishRound(room);
  });

  socket.on('forceEnd', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase === 'reveal') return;
    finishRound(room);
  });

  socket.on('nextRound', () => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    if (room.round >= 10) {
      room.phase = 'ended';
      let finalLeaderboard = [];

      if (room.mode === 'solo') {
        finalLeaderboard = room.players.map(p => ({ name: p.name, score: room.playerScores[p.id] }))
                            .sort((a, b) => b.score - a.score);
      } else {
        finalLeaderboard = room.teams.map(t => ({ name: t.name, score: t.score }))
                            .sort((a, b) => b.score - a.score);
      }

      io.to(socket.roomCode).emit('gameEnded', { 
        mode: room.mode, 
        leaderboard: finalLeaderboard
      });
    } else {
      room.phase = 'waiting'; room.playerAnswers = {}; room.playerReasons = {};
      io.to(socket.roomCode).emit('prepareNextRound');
      setTimeout(() => {
        room.round++; room.phase = 'question';
        const data = room.rounds[room.round - 1];
        io.to(room.hostSocket).emit('roundStartedHost', { round: room.round, total: 10, data, mode: room.mode });
        room.players.forEach(p => io.to(p.socketId).emit('roundStarted', { round: room.round, total: 10, data, mode: room.mode }));
        if (room.roundTimeout) clearTimeout(room.roundTimeout);
        room.roundTimeout = setTimeout(() => {
          const currentRoom = rooms[socket.roomCode];
          if (currentRoom && currentRoom.phase !== 'reveal') finishRound(currentRoom);
        }, 35000);
      }, 100); 
    }
  });
});

function revealSolo(room) {
  room.phase = 'reveal';
  const r = room.rounds[room.round - 1];
  const maxPoints = r.points;
  const leaderboard = room.players.map(p => {
    const cardOk = room.playerAnswers[p.id] === r.correct;
    const reasonOk = r.reasons_ar[room.playerReasons[p.id]]?.correct;
    let pts = (cardOk && reasonOk) ? maxPoints : cardOk ? (maxPoints / 2) : 0;
    room.playerScores[p.id] += pts;
    return { id: p.id, name: p.name, cardOk, reasonOk, pts, total: room.playerScores[p.id] };
  }).sort((a, b) => b.total - a.total);

  io.to(room.hostSocket).emit('revealSolo', { 
    correct: r.correct, 
    explain_ar: r.explain_ar, explain_en: r.explain_en, 
    leaderboard, points: maxPoints 
  });
  
  room.players.forEach(p => io.to(p.socketId).emit('revealSoloPlayer', { 
    correct: r.correct, 
    explain_ar: r.explain_ar, explain_en: r.explain_en, 
    mine: leaderboard.find(x => x.id === p.id), points: maxPoints 
  }));
}

function revealTeamFractional(room) {
  room.phase = 'reveal';
  const r = room.rounds[room.round - 1];
  const maxPoints = r.points;
  const results = room.teams.map((team, i) => {
    const teamAnswers = team.members.map(m => room.playerAnswers[m.id]).filter(a => a && a !== "None");
    const teamReasons = team.members.map(m => room.playerReasons[m.id]).filter(a => a !== undefined && a !== -1);
    const correctCardVotes = teamAnswers.filter(ans => ans === r.correct).length;
    const cardRatio = teamAnswers.length > 0 ? (correctCardVotes / teamAnswers.length) : 0;
    const correctReasonIdx = r.reasons_ar.findIndex(x => x.correct);
    const correctReasonVotes = teamReasons.filter(ans => ans === correctReasonIdx).length;
    const reasonRatio = teamReasons.length > 0 ? (correctReasonVotes / teamReasons.length) : 0;
    let pts = ((cardRatio * maxPoints) / 2) + ((reasonRatio * maxPoints) / 2); 
    pts = Math.round(pts * 100) / 100; team.score = Math.round((team.score + pts) * 100) / 100; 
    return { teamIdx: i, name: team.name, members: team.members.map(m => m.name), cardRatio: Math.round(cardRatio * 100), reasonRatio: Math.round(reasonRatio * 100), pts, total: team.score };
  });

  io.to(room.hostSocket).emit('revealTeam', { 
    correct: r.correct, 
    explain_ar: r.explain_ar, explain_en: r.explain_en, 
    results, points: maxPoints 
  });
  
  room.teams.forEach((team, idx) => {
    team.members.forEach(m => io.to(m.socketId).emit('revealTeamPlayer', { 
      correct: r.correct, 
      explain_ar: r.explain_ar, explain_en: r.explain_en, 
      mine: results.find(x => x.teamIdx === idx), points: maxPoints 
    }));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`));

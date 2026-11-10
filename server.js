const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.static(path.join(__dirname, 'public')));

const COPYRIGHT_TEXT = "محمد العقيلي HIM.PY";

const PRODUCTS = ["LibraryApp", "PayPortal", "PrintServer", "VPN Gateway", "ChatApp", "StudentPortal", "Antivirus", "Backup Server", "Email Filter", "File Share", "WebServer", "HR Portal", "Router Firmware", "Cloud Storage", "Dev Tools", "Public API", "Backup Tape", "Mobile App", "Old CRM", "Wi-Fi Guest"];
const CONDITIONS = ["تسجيل دخول الزوار مُفعّل", "الجلسة لا تنتهي بعد الخروج", "ثغرة في خدمة الطباعة", "ثغرة في المصادقة الثنائية", "رسائل غير مشفرة", "ثغرة في رفع الملفات", "ثغرة في محرك الفحص", "ثغرة في استعادة النسخ", "تجاوز فلتر البريد", "صلاحيات مفتوحة", "ثغرة تنفيذ أوامر عن بُعد", "تسريب بيانات الموظفين", "كلمة مرور افتراضية", "روابط مشاركة دائمة"];
const IMPACTS = ["وصول غير مصرّح للبيانات", "سرقة جلسات العملاء", "تسريب مستندات داخلية", "دخول غير مصرّح للشبكة", "كشف محادثات الموظفين", "رفع ملفات خبيثة", "تجاوز الفحص الأمني", "فشل استعادة البيانات", "وصول تصيّد للموظفين", "وصول لملفات حساسة", "اختراق كامل للخادم", "كشف رواتب وبيانات شخصية"];
const CONTEXT_LOW = ["غير مثبت لدينا", "نسخة اختبارية معزولة بلا بيانات", "داخل شبكة الموظفين + جدار حماية", "8 موظفين فقط، لا بيانات حساسة", "التحديث طُبّق تلقائياً أمس", "توعية + نظام كشف ثانٍ", "تم تغيير كلمة المرور بالفعل", "خادم داخلي مغلق، لا يوجد اتصال بالإنترنت، وصول محصور بموظف واحد"];
const CONTEXT_HIGH = ["صفحة عامة يومية — لا ضوابط", "مثبت، يستخدمه الكل عن بُعد، لا بديل", "2000 طالب يومياً + لا فحص للملفات", "لا نسخة بديلة، لا اختبار منذ 6 أشهر", "الجميع يستخدمه، لا تدقيق منذ سنة", "مثبت، يستخدمه كل الموظفين، بلا تشفير", "مفتوح للإنترنت، يستخدمه آلاف العملاء", "مفتوح للإنترنت بالكامل، بيانات العملاء الحساسة مكشوفة، لا يوجد أي جدار حماية"];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffleArray(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// دالة لترجمة النصوص التي يرسلها السيرفر
function getI18nReasons(isExpert, isTrap, realCard, fakeCard, correctLetter, wrongLetter) {
  const ar = [];
  const en = [];

  if (isExpert) {
    ar.push({ text: `البطاقة ${correctLetter}: لأنها تفتح ثغرة للمخترق للدخول كمدير (تجاوز 2FA)، بينما ${wrongLetter} مجرد تسريب معلومات لا يسمح بالدخول.`, correct: true });
    ar.push({ text: `البطاقة ${correctLetter}: لأنها رغم أن شدتها أقل بقليل، إلا أن طبيعتها تسمح بالتحكم الكامل، بينما ${wrongLetter} لا تفعل.`, correct: true });
    ar.push({ text: `البطاقة ${correctLetter}: لأنها تعمل على مستوى المصادقة، بينما ${wrongLetter} تعمل على مستوى الإفصاح فقط.`, correct: false });
    ar.push({ text: `البطاقة ${correctLetter}: لأن البطاقة ${wrongLetter} قد تكون خطيرة أيضاً، لكن الأثر المباشر لـ ${correctLetter} أخطر بكثير.`, correct: false });

    en.push({ text: `Card ${correctLetter}: Because it allows an attacker to bypass 2FA and gain admin access, while ${wrongLetter} is just information disclosure.`, correct: true });
    en.push({ text: `Card ${correctLetter}: Because despite its slightly lower severity, it allows full control, while ${wrongLetter} does not.`, correct: true });
    en.push({ text: `Card ${correctLetter}: Because it operates at the authentication level, while ${wrongLetter} operates at the disclosure level only.`, correct: false });
    en.push({ text: `Card ${correctLetter}: Because ${wrongLetter} might also be dangerous, but the direct impact of ${correctLetter} is much worse.`, correct: false });
  } else if (isTrap) {
    ar.push({ text: `البطاقة ${correctLetter}: لأن كلتاهما لهما سياق خطير، ولكن درجة الشدة (${realCard.severity}) وطبيعة الثغرة تجعلها الأكثر فتكاً.`, correct: true });
    ar.push({ text: `البطاقة ${correctLetter}: لأن الأثر المترتب عليها كارثي (${realCard.impact})، بينما ${wrongLetter} أثره محدود.`, correct: true });
    ar.push({ text: `البطاقة ${correctLetter}: لأن سياقها يبدو آمناً أكثر للوهلة الأولى.`, correct: false });
    ar.push({ text: "كلتاهما آمنتان، لا يوجد خطر حقيقي.", correct: false });

    en.push({ text: `Card ${correctLetter}: Because both have a dangerous context, but the severity (${realCard.severity}) and nature of the vulnerability make it the most lethal.`, correct: true });
    en.push({ text: `Card ${correctLetter}: Because its impact is catastrophic (${realCard.impact}), while ${wrongLetter}'s impact is limited.`, correct: true });
    en.push({ text: `Card ${correctLetter}: Because its context seems safer at first glance.`, correct: false });
    en.push({ text: "Both are safe, there is no real risk.", correct: false });
  } else {
    ar.push({ text: `البطاقة ${correctLetter}: لأن السياق المحلي (${realCard.context}) يجعلها مكشوفة للخطر أكثر من ${wrongLetter}.`, correct: true });
    ar.push({ text: `البطاقة ${correctLetter}: لأن طبيعة الثغرة (${realCard.condition}) والأثر (${realCard.impact}) أخطر بكثير، بينما ${wrongLetter} ثغرة بسيطة.`, correct: true });
    ar.push({ text: `البطاقة ${correctLetter}: لأن درجة شدتها (${realCard.severity}) هي الأعلى، وفي الأمن السيبراني الرقم الأكبر هو الأخطر دائماً.`, correct: false });
    ar.push({ text: `البطاقة ${correctLetter}: لأنها الأحدث في الإصدار، والنسخ الجديدة تكون أكثر عرضة للثغرات المكتشفة حديثاً.`, correct: false });

    en.push({ text: `Card ${correctLetter}: Because the local context (${realCard.context}) makes it more exposed than ${wrongLetter}.`, correct: true });
    en.push({ text: `Card ${correctLetter}: Because the nature of the vulnerability (${realCard.condition}) and impact (${realCard.impact}) are far worse than ${wrongLetter}.`, correct: true });
    en.push({ text: `Card ${correctLetter}: Because its severity (${realCard.severity}) is the highest, and in cybersecurity, the biggest number always wins.`, correct: false });
    en.push({ text: `Card ${correctLetter}: Because it's the newest version, and new versions are more prone to newly discovered vulnerabilities.`, correct: false });
  }
  return { ar, en };
}

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
    realCondition = "ثغرة في خدمة الويب"; fakeCondition = "ثغرة في خدمة الويب";
    realContext = "مفتوح للإنترنت، بيانات العملاء مكشوفة، لا يوجد جدار حماية";
    fakeContext = "خادم داخلي، يستخدمه الموظفون، لكن عليه جدار حماية داخلي";
  } else if (type === 'trap') {
    points = 2; isTrap = true;
    realSev = (Math.random() * 1.5 + 8.5).toFixed(1);
    fakeSev = (Math.random() * 1.5 + 8.5).toFixed(1);
    realCondition = "ثغرة تنفيذ أوامر عن بُعد (RCE)"; fakeCondition = "ثغرة إفصاح عن معلومات بسيطة";
    realContext = "مثبت، يستخدمه كل الموظفين، لا يوجد بديل"; fakeContext = "مثبت، يستخدمه كل الموظفين، لا يوجد بديل";
  } else if (type === 'nature') {
    points = 3;
    realSev = (Math.random() * 1.5 + 7.5).toFixed(1);
    fakeSev = (Math.random() * 1.5 + 7.5).toFixed(1);
    realCondition = "ثغرة تنفيذ أوامر عن بُعد (RCE)"; fakeCondition = "ثغرة إفصاح عن معلومات حساسة (تسريب)";
    realContext = "خادم داخلي، لكن الثغرة تسمح بالتحكم الكامل"; fakeContext = "خادم داخلي، الثغرة تكشف مسارات الملفات";
  } else if (type === 'balance') {
    points = 2; isTrap = Math.random() < 0.5;
    if (isTrap) {
      realSev = (Math.random() * 1.5 + 8.5).toFixed(1); fakeSev = (Math.random() * 1.5 + 7.5).toFixed(1);
    } else {
      const base = Math.random() * 1.5 + 7.5;
      realSev = (base + 0.1).toFixed(1); fakeSev = base.toFixed(1);
    }
    realCondition = "ثغرة في المصادقة"; fakeCondition = "ثغرة في التسجيل";
    realContext = "خادم داخلي، الثغرة تسمح بتجاوز الحماية"; fakeContext = "خادم داخلي، الثغرة لا تؤدي إلا لكشف سجلات بسيطة";
  } else if (type === 'expert') {
    points = 4; isExpert = true;
    realSev = (Math.random() * 1.0 + 8.5).toFixed(1);
    realCondition = "ثغرة تجاوز المصادقة الثنائية (2FA Bypass)";
    realContext = "مثبت، يستخدمه الموظفون، لا يوجد جدار حماية";
    fakeSev = (Math.random() * 0.5 + 9.5).toFixed(1);
    fakeCondition = "ثغرة تسريب معلومات (Information Disclosure)";
    fakeContext = "مثبت، يستخدمه الموظفون، لا يوجد جدار حماية";
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

  // توليد النصوص باللغتين
  const i18nReasons = getI18nReasons(isExpert, isTrap, realCard, fakeCard, correctLetter, wrongLetter);
  
  let arExplain = `البطاقة ${correctLetter} هي الخطر الحقيقي لأن طبيعة الثغرة (${realCard.condition}) أو السياق المحلي (${realCard.context}) يجعلها أولوية قصوى، بينما البطاقة ${wrongLetter} أقل خطورة.`;
  let enExplain = `Card ${correctLetter} is the real threat because its nature (${realCard.condition}) or local context (${realCard.context}) makes it a top priority, while Card ${wrongLetter} is less risky.`;

  if (isExpert) {
    arExplain = `انتبه! البطاقة ${wrongLetter} شدتها ${fakeCard.severity}، لكنها لا تسمح بالدخول. بينما البطاقة ${correctLetter} شدتها ${realCard.severity}، لكنها تسمح بالدخول كمدير. الشدة وحدها لا تكفي!`;
    enExplain = `Watch out! Card ${wrongLetter} has severity ${fakeCard.severity} but doesn't allow access. Card ${correctLetter} has severity ${realCard.severity} but allows admin access. Severity alone isn't enough!`;
  } else if (isTrap) {
    arExplain = `في هذه الجولة، كلتاهما خطيرتان! لكن البطاقة ${correctLetter} طبيعتها أخطر وشدتها أعلى.`;
    enExplain = `In this round, both are dangerous! But Card ${correctLetter} is more severe and has a higher score.`;
  }

  const correctAr = i18nReasons.ar.filter(r => r.correct);
  const wrongAr = i18nReasons.ar.filter(r => !r.correct);
  const correctEn = i18nReasons.en.filter(r => r.correct);
  const wrongEn = i18nReasons.en.filter(r => !r.correct);

  const selectedAr = shuffleArray([...shuffleArray(correctAr).slice(0, 2), ...shuffleArray(wrongAr).slice(0, 2)]);
  const selectedEn = shuffleArray([...shuffleArray(correctEn).slice(0, 2), ...shuffleArray(wrongEn).slice(0, 2)]);

  return { 
    A: cardA, B: cardB, correct: correctLetter, 
    reasons_ar: selectedAr, reasons_en: selectedEn, 
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
    
    // إرسال النتيجة للاعب حسب اللغة التي اختارها
    const lang = socket.handshake.auth.lang || 'ar';
    if (card !== currentRound.correct) {
      socket.emit('wrongAnswer', { 
        correct: currentRound.correct, 
        explain: lang === 'ar' ? currentRound.explain_ar : currentRound.explain_en 
      });
      room.playerReasons[socket.playerId] = -1;
    } else {
      socket.emit('showReasons', { reasons: lang === 'ar' ? currentRound.reasons_ar : currentRound.reasons_en });
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
      const finalScores = room.mode === 'solo' ? room.playerScores : room.teams.map(t => ({ name: t.name, score: t.score }));
      io.to(socket.roomCode).emit('gameEnded', { mode: room.mode, finalScores });
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

  // إرسال النتائج للمشرف (عربي دائماً للوحة المشرف، ويمكن تغييره)
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

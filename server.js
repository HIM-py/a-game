const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// بنك الأسئلة (100 سؤال)
// ============================================================
const PRODUCTS = [
  "LibraryApp", "PayPortal", "PrintServer", "VPN Gateway", "ChatApp",
  "StudentPortal", "Antivirus", "Backup Server", "Email Filter", "File Share",
  "WebServer", "HR Portal", "Router Firmware", "Cloud Storage", "Dev Tools",
  "Public API", "Backup Tape", "Mobile App", "Old CRM", "Wi-Fi Guest",
  "Database 1", "Database 2", "Auth Server", "Payment API", "IoT Camera",
  "Smart Lock", "NAS Storage", "Mail Server", "FTP Server", "DNS Server"
];

const CONDITIONS = [
  "تسجيل دخول الزوار مُفعّل", "الجلسة لا تنتهي بعد الخروج", "ثغرة في خدمة الطباعة",
  "ثغرة في المصادقة الثنائية", "رسائل غير مشفرة", "ثغرة في رفع الملفات",
  "ثغرة في محرك الفحص", "ثغرة في استعادة النسخ", "تجاوز فلتر البريد", "صلاحيات مفتوحة",
  "ثغرة تنفيذ أوامر عن بُعد", "تسريب بيانات الموظفين", "كلمة مرور افتراضية", "روابط مشاركة دائمة",
  "ثغرة في أداة تطوير", "لا حد لعدد الطلبات", "أشرطة غير مشفرة", "تخزين بيانات حساسة محلياً",
  "ثغرة معروفة قديمة", "شبكة ضيوف بلا عزل", "لا مصادقة ثنائية", "تشفير ضعيف", "سجل غير محمي",
  "وصول افتراضي للجميع", "كلمات مرور ضعيفة", "ثغرة في تحديث النظام", "ملفات مؤقتة غير محمية"
];

const IMPACTS = [
  "وصول غير مصرّح للبيانات", "سرقة جلسات العملاء", "تسريب مستندات داخلية",
  "دخول غير مصرّح للشبكة", "كشف محادثات الموظفين", "رفع ملفات خبيثة",
  "تجاوز الفحص الأمني", "فشل استعادة البيانات", "وصول تصيّد للموظفين", "وصول لملفات حساسة",
  "اختراق كامل للخادم", "كشف رواتب وبيانات شخصية", "دخول للراوتر الداخلي", "تسريب ملفات عبر روابط",
  "تنفيذ كود على جهاز المطور", "هجوم حجب الخدمة", "سرقة أشرطة النسخ", "سرقة بيانات عند فقدان الجهاز",
  "اختراق قاعدة بيانات العملاء", "انتقال للشبكة الداخلية"
];

const CONTEXT_LOW = [
  "غير مثبت لدينا", "نسخة اختبارية معزولة بلا بيانات", "داخل شبكة الموظفين + جدار حماية",
  "8 موظفين فقط، لا بيانات حساسة", "التحديث طُبّق تلقائياً أمس", "توعية + نظام كشف ثانٍ",
  "تم تغيير كلمة المرور بالفعل", "4 مطورين فقط، أدوات معزولة", "في خزنة مقفلة، وصول محدود",
  "غير مثبت — انتقلنا لنظام جديد", "جهاز معزول تماماً عن الشبكة", "لا يوجد اتصال بالإنترنت"
];

const CONTEXT_HIGH = [
  "صفحة عامة يومية — لا ضوابط", "مثبت، يستخدمه الكل عن بُعد، لا بديل", "2000 طالب يومياً + لا فحص للملفات",
  "لا نسخة بديلة، لا اختبار منذ 6 أشهر", "الجميع يستخدمه، لا تدقيق منذ سنة", "مثبت، يستخدمه كل الموظفين، بلا تشفير",
  "يستخدمه الجميع، روابط لا تنتهي، بلا مراجعة", "مفتوح للإنترنت، يستخدمه آلاف العملاء", "مثبت على 5000 جهاز طالب، لا تشفير",
  "مثبتة ونشطة، يستخدمها كل زائر يومياً", "مكشوف على الإنترنت، بلا جدار حماية", "بيانات العملاء الحساسة بلا تشفير"
];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generate100Rounds() {
  const rounds = [];
  const used = new Set();
  while (rounds.length < 100) {
    const dangerInA = Math.random() < 0.5;
    const realProduct = `${getRandom(PRODUCTS)} ${getRandomInt(1,5)}.${getRandomInt(0,9)}`;
    const realCondition = getRandom(CONDITIONS);
    const realImpact = getRandom(IMPACTS);
    const realContext = getRandom(CONTEXT_HIGH);
    const realSeverity = (Math.random() * 2 + 5).toFixed(1); 

    const fakeProduct = `${getRandom(PRODUCTS)} ${getRandomInt(1,5)}.${getRandomInt(0,9)}`;
    const fakeCondition = getRandom(CONDITIONS);
    const fakeImpact = getRandom(IMPACTS);
    const fakeContext = getRandom(CONTEXT_LOW);
    const fakeSeverity = (Math.random() * 2 + 8).toFixed(1); 

    const key = realProduct + realCondition + fakeProduct + fakeCondition;
    if (used.has(key)) continue;
    used.add(key);

    const cardA = dangerInA 
      ? { product: realProduct, severity: parseFloat(realSeverity), condition: realCondition, impact: realImpact, context: realContext }
      : { product: fakeProduct, severity: parseFloat(fakeSeverity), condition: fakeCondition, impact: fakeImpact, context: fakeContext };

    const cardB = dangerInA
      ? { product: fakeProduct, severity: parseFloat(fakeSeverity), condition: fakeCondition, impact: fakeImpact, context: fakeContext }
      : { product: realProduct, severity: parseFloat(realSeverity), condition: realCondition, impact: realImpact, context: realContext };

    const reasons = [
      { text: "البطاقة A شدتها أعلى، فهي الأولوية دائماً", correct: false },
      { text: dangerInA ? "البطاقة A مُعرّضة للجميع وتفتقر للحماية، بينما B محدودة" : "البطاقة B مُعرّضة للجميع وتفتقر للحماية، بينما A محدودة", correct: true },
      { text: "البطاقة A لأن رقمها أكبر", correct: false },
      { text: "لا فرق، كلتاهما بنفس الأولوية", correct: false }
    ];

    const shuffledReasons = shuffleArray(reasons);
    const correctLetter = dangerInA ? "A" : "B";
    rounds.push({ A: cardA, B: cardB, correct: correctLetter, reasons: shuffledReasons, explain: `البطاقة ${correctLetter} هي الخطر الحقيقي.` });
  }
  return rounds;
}

const MASTER_BANK = generate100Rounds();
const rooms = {};

function makeCode() { return Math.random().toString(36).substring(2, 6).toUpperCase(); }

function distributeTeams(players) {
  const shuffled = shuffleArray(players);
  const teams = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    teams.push([shuffled[i]]);
    if (shuffled[i + 1]) teams[teams.length - 1].push(shuffled[i + 1]);
  }
  if (teams.length > 1 && teams[teams.length - 1].length === 1) {
    const lonely = teams.pop();
    const target = teams[Math.floor(Math.random() * teams.length)];
    target.push(lonely[0]);
  }
  return teams;
}

function publicRoom(room) {
  return {
    mode: room.mode,
    phase: room.phase,
    distributed: room.distributed,
    players: room.players.map(p => ({ id: p.id, name: p.name })),
    teams: room.teams.map((t, i) => ({ id: i, name: t.name, members: t.members.map(m => m.name), score: t.score })),
    scores: room.playerScores
  };
}

// ✅ دالة مساعدة لتجهيز الفرق (تستخدم للتوزيع العشوائي أو اليدوي)
function setupTeams(room, groups) {
  room.teams = groups.map((members, i) => ({
    name: 'الفريق ' + (i + 1),
    members: members.map(m => ({ id: m.id, name: m.name, socketId: m.socketId })),
    score: 0
  }));
  room.teamAnswers = room.teams.map(() => null);
  room.teamReasons = room.teams.map(() => null);
  room.distributed = true;
  room.phase = 'distributed';

  room.teams.forEach((team, idx) => {
    team.members.forEach(m => {
      io.to(m.socketId).emit('youAreInTeam', { teamIdx: idx, teamName: team.name, members: team.members.map(x => x.name) });
      const s = io.sockets.sockets.get(m.socketId);
      if (s) s.playerTeamIdx = idx;
    });
  });
  io.to(room.hostSocket).emit('roomUpdate', publicRoom(room));
  io.to(room.hostSocket).emit('distributed', publicRoom(room));
}

io.on('connection', (socket) => {
  socket.on('createRoom', ({ mode }, cb) => {
    const code = makeCode();
    rooms[code] = {
      hostSocket: socket.id, mode: mode || 'team', rounds: shuffleArray(MASTER_BANK).slice(0, 10),
      players: [], teams: [], distributed: false, round: 0, phase: 'waiting',
      playerScores: {}, playerAnswers: {}, playerReasons: {},
      teamAnswers: [], teamReasons: []
    };
    socket.join(code);
    socket.roomCode = code;
    cb({ code, mode: rooms[code].mode });
  });

  socket.on('joinRoom', ({ code, name }, cb) => {
    code = (code || '').toUpperCase();
    const room = rooms[code];
    if (!room) return cb({ error: 'الغرفة غير موجودة' });
    if (room.phase !== 'waiting' && room.phase !== 'distributed') return cb({ error: 'اللعبة بدأت بالفعل' });
    
    const playerId = 'P' + Date.now();
    room.players.push({ id: playerId, name: name || 'لاعب', socketId: socket.id });
    room.playerScores[playerId] = 0;
    socket.join(code);
    socket.roomCode = code;
    socket.playerId = playerId;
    socket.playerTeamIdx = null;

    io.to(room.hostSocket).emit('roomUpdate', publicRoom(room));
    cb({ ok: true, playerId, name, mode: room.mode });
  });

  // ✅ التوزيع العشوائي
  socket.on('distributeRandom', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.mode !== 'team' || room.players.length < 2) return;
    setupTeams(room, distributeTeams(room.players));
  });

  // ✅ التوزيع اليدوي
  socket.on('distributeManual', ({ assignments }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.mode !== 'team') return;
    
    // تجميع اللاعبين حسب الفريق المختار
    const teamMap = {};
    assignments.forEach(a => {
      const player = room.players.find(p => p.id === a.playerId);
      if (player) {
        if (!teamMap[a.teamNum]) teamMap[a.teamNum] = [];
        teamMap[a.teamNum].push(player);
      }
    });

    const groups = Object.values(teamMap);
    setupTeams(room, groups);
  });

  socket.on('startRound', () => {
    const room = rooms[socket.roomCode];
    if (!room || (room.mode === 'team' && !room.distributed)) return;
    room.round++;
    room.phase = 'question';
    
    if (room.mode === 'solo') { room.playerAnswers = {}; room.playerReasons = {}; }
    else { room.teamAnswers = room.teams.map(() => null); room.teamReasons = room.teams.map(() => null); }
    
    const data = room.rounds[room.round - 1];
    io.to(room.hostSocket).emit('roundStartedHost', { round: room.round, total: 10, data, mode: room.mode });
    room.players.forEach(p => {
      io.to(p.socketId).emit('roundStarted', { round: room.round, total: 10, data, mode: room.mode });
    });
  });

  socket.on('pickCard', ({ card }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase !== 'question') return;
    if (room.mode === 'solo') {
      if (room.playerAnswers[socket.playerId]) return;
      room.playerAnswers[socket.playerId] = card;
      io.to(room.hostSocket).emit('progressUpdate', { answered: Object.keys(room.playerAnswers).length, total: room.players.length });
      if (Object.keys(room.playerAnswers).length === room.players.length) { room.phase = 'reason'; io.to(socket.roomCode).emit('phaseChange', { phase: 'reason' }); }
    } else {
      const idx = socket.playerTeamIdx;
      if (idx === null || idx === undefined || room.teamAnswers[idx]) return;
      room.teamAnswers[idx] = card;
      io.to(room.hostSocket).emit('progressUpdate', { answered: room.teamAnswers.filter(a => a).length, total: room.teams.length });
      if (room.teamAnswers.every(a => a)) { room.phase = 'reason'; io.to(socket.roomCode).emit('phaseChange', { phase: 'reason' }); }
    }
  });

  socket.on('pickReason', ({ idx }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase !== 'reason') return;
    if (room.mode === 'solo') {
      if (room.playerReasons[socket.playerId] !== undefined) return;
      room.playerReasons[socket.playerId] = idx;
      if (Object.keys(room.playerReasons).length === room.players.length) revealSolo(room);
    } else {
      const teamIdx = socket.playerTeamIdx;
      if (teamIdx === null || teamIdx === undefined || room.teamReasons[teamIdx] !== null) return;
      room.teamReasons[teamIdx] = idx;
      if (room.teamReasons.every(r => r !== null)) revealTeam(room);
    }
  });

  socket.on('nextRound', () => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    if (room.round >= 10) {
      const finalScores = room.mode === 'solo' ? room.playerScores : room.teams.map(t => ({ name: t.name, score: t.score }));
      io.to(socket.roomCode).emit('gameEnded', { mode: room.mode, finalScores });
    } else {
      room.phase = 'waiting';
      io.to(socket.roomCode).emit('readyNext', publicRoom(room));
    }
  });
});

function revealSolo(room) {
  room.phase = 'reveal';
  const r = room.rounds[room.round - 1];
  const leaderboard = room.players.map(p => {
    const cardOk = room.playerAnswers[p.id] === r.correct;
    const reasonOk = r.reasons[room.playerReasons[p.id]]?.correct;
    let pts = (cardOk && reasonOk) ? 2 : cardOk ? 1 : 0;
    room.playerScores[p.id] += pts;
    return { id: p.id, name: p.name, cardOk, reasonOk, pts, total: room.playerScores[p.id] };
  }).sort((a, b) => b.total - a.total);
  io.to(room.hostSocket).emit('revealSolo', { correct: r.correct, explain: r.explain, leaderboard });
  room.players.forEach(p => io.to(p.socketId).emit('revealSoloPlayer', { correct: r.correct, explain: r.explain, mine: leaderboard.find(x => x.id === p.id) }));
}

function revealTeam(room) {
  room.phase = 'reveal';
  const r = room.rounds[room.round - 1];
  const results = room.teams.map((team, i) => {
    const cardOk = room.teamAnswers[i] === r.correct;
    const reasonOk = r.reasons[room.teamReasons[i]]?.correct;
    let pts = (cardOk && reasonOk) ? 2 : cardOk ? 1 : 0;
    team.score += pts;
    return { teamIdx: i, name: team.name, members: team.members.map(m => m.name), cardOk, reasonOk, pts, total: team.score };
  });
  io.to(room.hostSocket).emit('revealTeam', { correct: r.correct, explain: r.explain, results });
  room.teams.forEach((team, idx) => team.members.forEach(m => io.to(m.socketId).emit('revealTeamPlayer', { correct: r.correct, explain: r.explain, mine: results.find(x => x.teamIdx === idx) })));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`));

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// بنك الأسئلة (100 سؤال)
// ============================================================
const PRODUCTS = ["LibraryApp", "PayPortal", "PrintServer", "VPN Gateway", "ChatApp", "StudentPortal", "Antivirus", "Backup Server", "Email Filter", "File Share", "WebServer", "HR Portal", "Router Firmware", "Cloud Storage", "Dev Tools", "Public API", "Backup Tape", "Mobile App", "Old CRM", "Wi-Fi Guest"];
const CONDITIONS = ["تسجيل دخول الزوار مُفعّل", "الجلسة لا تنتهي بعد الخروج", "ثغرة في خدمة الطباعة", "ثغرة في المصادقة الثنائية", "رسائل غير مشفرة", "ثغرة في رفع الملفات", "ثغرة في محرك الفحص", "ثغرة في استعادة النسخ", "تجاوز فلتر البريد", "صلاحيات مفتوحة", "ثغرة تنفيذ أوامر عن بُعد", "تسريب بيانات الموظفين", "كلمة مرور افتراضية", "روابط مشاركة دائمة"];
const IMPACTS = ["وصول غير مصرّح للبيانات", "سرقة جلسات العملاء", "تسريب مستندات داخلية", "دخول غير مصرّح للشبكة", "كشف محادثات الموظفين", "رفع ملفات خبيثة", "تجاوز الفحص الأمني", "فشل استعادة البيانات", "وصول تصيّد للموظفين", "وصول لملفات حساسة", "اختراق كامل للخادم", "كشف رواتب وبيانات شخصية"];
const CONTEXT_LOW = ["غير مثبت لدينا", "نسخة اختبارية معزولة بلا بيانات", "داخل شبكة الموظفين + جدار حماية", "8 موظفين فقط، لا بيانات حساسة", "التحديث طُبّق تلقائياً أمس", "توعية + نظام كشف ثانٍ", "تم تغيير كلمة المرور بالفعل"];
const CONTEXT_HIGH = ["صفحة عامة يومية — لا ضوابط", "مثبت، يستخدمه الكل عن بُعد، لا بديل", "2000 طالب يومياً + لا فحص للملفات", "لا نسخة بديلة، لا اختبار منذ 6 أشهر", "الجميع يستخدمه، لا تدقيق منذ سنة", "مثبت، يستخدمه كل الموظفين، بلا تشفير", "مفتوح للإنترنت، يستخدمه آلاف العملاء"];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffleArray(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function generate100Rounds() {
  const rounds = []; 
  const used = new Set();
  
  while (rounds.length < 100) {
    const pattern = Math.random();
    let realSev, fakeSev;
    let realContext, fakeContext;

    if (pattern < 0.5) {
      // 50%: الصح هو الأقل شدة (السياق يغلب الشدة)
      realSev = (Math.random() * 2 + 4).toFixed(1);
      fakeSev = (Math.random() * 2 + 8).toFixed(1);
      realContext = getRandom(CONTEXT_HIGH);
      fakeContext = getRandom(CONTEXT_LOW);
    } else if (pattern < 0.8) {
      // 30%: الصح هو الأعلى شدة (لأن السياق خطير جداً أيضاً)
      realSev = (Math.random() * 2 + 8).toFixed(1); 
      fakeSev = (Math.random() * 2 + 4).toFixed(1); 
      realContext = getRandom(CONTEXT_HIGH);
      fakeContext = getRandom(CONTEXT_LOW);
    } else {
      // 20%: الشدتان متقاربتان جداً (السياق هو الفيصل الواضح)
      const base = Math.random() * 2 + 7; 
      realSev = (base + 0.1).toFixed(1);
      fakeSev = base.toFixed(1);
      // نجعل السياق متطرفاً جداً لصالح الصح
      realContext = "مفتوح للإنترنت بالكامل، بيانات العملاء الحساسة مكشوفة، لا يوجد أي جدار حماية";
      fakeContext = "خادم داخلي مغلق، لا يوجد اتصال بالإنترنت، وصول محصور بموظف واحد";
    }

    const dangerInA = Math.random() < 0.5;
    const realProduct = `${getRandom(PRODUCTS)} ${getRandomInt(1,5)}.${getRandomInt(0,9)}`;
    const realCondition = getRandom(CONDITIONS);
    const realImpact = getRandom(IMPACTS);

    const fakeProduct = `${getRandom(PRODUCTS)} ${getRandomInt(1,5)}.${getRandomInt(0,9)}`;
    const fakeCondition = getRandom(CONDITIONS);
    const fakeImpact = getRandom(IMPACTS);

    const key = realProduct + realCondition + fakeProduct + fakeCondition;
    if (used.has(key)) continue; used.add(key);

    const cardA = dangerInA ? { product: realProduct, severity: parseFloat(realSev), condition: realCondition, impact: realImpact, context: realContext } : { product: fakeProduct, severity: parseFloat(fakeSev), condition: fakeCondition, impact: fakeImpact, context: fakeContext };
    const cardB = dangerInA ? { product: fakeProduct, severity: parseFloat(fakeSev), condition: fakeCondition, impact: fakeImpact, context: fakeContext } : { product: realProduct, severity: parseFloat(realSev), condition: realCondition, impact: realImpact, context: realContext };
    
    const correctLetter = dangerInA ? "A" : "B";
    const wrongLetter = dangerInA ? "B" : "A";
    const realCard = dangerInA ? cardA : cardB;
    const fakeCard = dangerInA ? cardB : cardA;

    // توليد أسباب متنوعة
    const reasonTemplates = [
      { text: `البطاقة ${correctLetter}: لأنها مُعرّضة للجمهور/الإنترنت، بينما ${wrongLetter} داخلية أو محدودة`, correct: true },
      { text: `البطاقة ${correctLetter}: لأنها بلا أي ضوابط حماية، بينما ${wrongLetter} لديها إجراءات وقائية`, correct: true },
      { text: `البطاقة ${correctLetter}: لأن عدد المستخدمين المعرضين للخطر هائل، بينما ${wrongLetter} يخدم فئة محدودة`, correct: true },
      { text: `البطاقة ${correctLetter}: لأن الأثر المترتب عليها كارثي (${realCard.impact})، بينما ${wrongLetter} أثره محدود`, correct: true },
      { text: `البطاقة ${wrongLetter}: لأن درجة شدتها (${fakeCard.severity}) أعلى، والرقم الأكبر يفوز دائماً`, correct: false },
      { text: `البطاقة ${wrongLetter}: لأنها الأحدث في الإصدار، والأحدث دائماً أخطر`, correct: false },
      { text: "كلتاهما لهما نفس الأولوية تماماً، لا فرق بينهما", correct: false },
      { text: "لا يمكن تحديد الأولوية إلا بمعرفة من سيهجم ومتى", correct: false }
    ];

    const selectedReasons = shuffleArray(reasonTemplates).filter((r, i, arr) => arr.findIndex(x => x.text === r.text) === i).slice(0, 4);
    if (!selectedReasons.some(r => r.correct)) selectedReasons[0] = reasonTemplates[0];

    rounds.push({ 
      A: cardA, 
      B: cardB, 
      correct: correctLetter, 
      reasons: shuffleArray(selectedReasons), 
      explain: `البطاقة ${correctLetter} هي الخطر الحقيقي. السياق المحلي (${realCard.context}) يجعلها أولوية قصوى.` 
    });
  }
  return rounds;
}

const MASTER_BANK = generate100Rounds();
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

io.on('connection', (socket) => {
  socket.on('createRoom', ({ mode }, cb) => {
    const code = makeCode();
    rooms[code] = { hostSocket: socket.id, mode: mode || 'team', rounds: shuffleArray(MASTER_BANK).slice(0, 10), players: [], teams: [], distributed: false, round: 0, phase: 'waiting', playerScores: {}, playerAnswers: {}, playerReasons: {} };
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
    if (groups.length > 1 && groups[groups.length - 1].length === 1) {
      groups[groups.length - 2].push(groups.pop()[0]);
    }
    setupTeams(room, groups);
  });

  socket.on('startRound', () => {
    const room = rooms[socket.roomCode];
    if (!room || (room.mode === 'team' && !room.distributed)) return;
    room.round++;
    room.phase = 'question';
    
    room.playerAnswers = {}; 
    room.playerReasons = {};
    
    const data = room.rounds[room.round - 1];
    io.to(room.hostSocket).emit('roundStartedHost', { round: room.round, total: 10, data, mode: room.mode });
    room.players.forEach(p => {
      io.to(p.socketId).emit('roundStarted', { round: room.round, total: 10, data, mode: room.mode });
    });
  });

  socket.on('pickCard', ({ card }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase !== 'question') return;
    if (room.playerAnswers[socket.playerId]) return;
    room.playerAnswers[socket.playerId] = card;
    
    const totalAnswered = Object.keys(room.playerAnswers).length;
    io.to(room.hostSocket).emit('progressUpdate', { answered: totalAnswered, total: room.players.length });

    if (totalAnswered === room.players.length) {
      room.phase = 'reason';
      io.to(socket.roomCode).emit('phaseChange', { phase: 'reason' });
    }
  });

  socket.on('pickReason', ({ idx }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase !== 'reason') return;
    if (room.playerReasons[socket.playerId] !== undefined) return;
    room.playerReasons[socket.playerId] = idx;
    
    const totalReasons = Object.keys(room.playerReasons).length;
    if (totalReasons === room.players.length) {
      if (room.mode === 'solo') revealSolo(room);
      else revealTeamFractional(room);
    }
  });

  // زر الإنهاء الإجباري (Force End)
  socket.on('forceEnd', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase === 'reveal') return;
    
    // إعطاء إجابات فارغة للذين لم يجيبوا
    room.players.forEach(p => {
      if (!room.playerAnswers[p.id]) room.playerAnswers[p.id] = "None";
      if (room.playerReasons[p.id] === undefined) room.playerReasons[p.id] = -1;
    });

    if (room.mode === 'solo') revealSolo(room);
    else revealTeamFractional(room);
  });

  socket.on('nextRound', () => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    
    if (room.round >= 10) {
      const finalScores = room.mode === 'solo' ? room.playerScores : room.teams.map(t => ({ name: t.name, score: t.score }));
      io.to(socket.roomCode).emit('gameEnded', { mode: room.mode, finalScores });
    } else {
      room.phase = 'waiting';
      room.playerAnswers = {}; 
      room.playerReasons = {};
      
      io.to(socket.roomCode).emit('prepareNextRound');
      
      setTimeout(() => {
        room.round++;
        room.phase = 'question';
        const data = room.rounds[room.round - 1];
        
        io.to(room.hostSocket).emit('roundStartedHost', { round: room.round, total: 10, data, mode: room.mode });
        room.players.forEach(p => {
          io.to(p.socketId).emit('roundStarted', { round: room.round, total: 10, data, mode: room.mode });
        });
      }, 100); 
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

function revealTeamFractional(room) {
  room.phase = 'reveal';
  const r = room.rounds[room.round - 1];
  const results = room.teams.map((team, i) => {
    const teamAnswers = team.members.map(m => room.playerAnswers[m.id]).filter(a => a && a !== "None");
    const teamReasons = team.members.map(m => room.playerReasons[m.id]).filter(a => a !== undefined && a !== -1);
    
    const correctCardVotes = teamAnswers.filter(ans => ans === r.correct).length;
    const cardRatio = teamAnswers.length > 0 ? (correctCardVotes / teamAnswers.length) : 0;
    
    const correctReasonIdx = r.reasons.findIndex(x => x.correct);
    const correctReasonVotes = teamReasons.filter(ans => ans === correctReasonIdx).length;
    const reasonRatio = teamReasons.length > 0 ? (correctReasonVotes / teamReasons.length) : 0;

    let pts = (cardRatio * 1) + (reasonRatio * 1); 
    pts = Math.round(pts * 100) / 100;
    team.score = Math.round((team.score + pts) * 100) / 100; 

    return { teamIdx: i, name: team.name, members: team.members.map(m => m.name), cardRatio: Math.round(cardRatio * 100), reasonRatio: Math.round(reasonRatio * 100), pts, total: team.score };
  });
  io.to(room.hostSocket).emit('revealTeam', { correct: r.correct, explain: r.explain, results });
  room.teams.forEach((team, idx) => {
    team.members.forEach(m => io.to(m.socketId).emit('revealTeamPlayer', { correct: r.correct, explain: r.explain, mine: results.find(x => x.teamIdx === idx) }));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`));

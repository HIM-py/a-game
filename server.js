const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 20 بطاقة موزعة على 10 جولات
// ============================================================
const ROUNDS = [
  {
    A: { product:"LibraryApp 2.1", severity:9.1, condition:"تسجيل دخول الزوار مُفعّل",
         impact:"وصول غير مصرّح للبيانات", context:"مدرستنا تشغّل 3.0 — غير مثبت لدينا" },
    B: { product:"PayPortal 4.2", severity:5.4, condition:"الجلسة لا تنتهي بعد الخروج",
         impact:"سرقة جلسات العملاء", context:"صفحة دخول عامة يومية — لا ضوابط" },
    correct:"B",
    reasons:[
      { text:"A شدتها أعلى فهي الأولوية", correct:false },
      { text:"B مُعرّضة للجميع + أثر مالي + لا حماية، بينما A غير مثبتة", correct:true },
      { text:"A لأن رقمها أكبر", correct:false },
      { text:"لا فرق، نفس الأولوية", correct:false }
    ],
    explain:"A شدة 9.1 لكن غير مثبتة → منخفضة. B شدة 5.4 لكنها مُعرّضة للعامة → عالية."
  },
  {
    A: { product:"PrintServer 1.8", severity:8.7, condition:"ثغرة في خدمة الطباعة",
         impact:"تسريب مستندات داخلية", context:"داخل شبكة الموظفين + جدار حماية" },
    B: { product:"VPN Gateway 2.3", severity:6.2, condition:"ثغرة في المصادقة الثنائية",
         impact:"دخول غير مصرّح للشبكة", context:"مثبت، يستخدمه الكل عن بُعد، لا بديل" },
    correct:"B",
    reasons:[
      { text:"A لأن شدتها أعلى", correct:false },
      { text:"B مُعرّضة للجميع + أثر شامل + لا بديل، بينما A محدودة ولها ضابط", correct:true },
      { text:"كلتاهما بنفس الأولوية", correct:false },
      { text:"A لأنها داخلية", correct:false }
    ],
    explain:"B رغم شدة أقل، تفتح الشبكة كاملة. A محدودة بضابط. الأولوية للـ B."
  },
  {
    A: { product:"ChatApp 5.0", severity:7.8, condition:"رسائل غير مشفرة",
         impact:"كشف محادثات الموظفين", context:"8 موظفين فقط، لا بيانات حساسة" },
    B: { product:"StudentPortal 3.1", severity:7.9, condition:"ثغرة في رفع الملفات",
         impact:"رفع ملفات خبيثة", context:"2000 طالب يومياً + لا فحص للملفات" },
    correct:"B",
    reasons:[
      { text:"B لأن شدتها أعلى بـ 0.1", correct:false },
      { text:"B مُعرّضة لعدد هائل + لا حماية، بينما A محدودة جداً", correct:true },
      { text:"A لأنها تخص الموظفين", correct:false },
      { text:"لا يمكن الترتيب", correct:false }
    ],
    explain:"الفرق في الشدة 0.1، لكن الفرق في التعرض هائل (8 مقابل 2000)."
  },
  {
    A: { product:"Antivirus 9.2", severity:9.5, condition:"ثغرة في محرك الفحص",
         impact:"تجاوز الفحص الأمني", context:"التحديث طُبّق تلقائياً أمس" },
    B: { product:"Backup Server 2.0", severity:7.2, condition:"ثغرة في استعادة النسخ",
         impact:"فشل استعادة البيانات", context:"لا نسخة بديلة، لا اختبار منذ 6 أشهر" },
    correct:"B",
    reasons:[
      { text:"A لأن شدتها 9.5 الأعلى", correct:false },
      { text:"A تم تحديثها أمس، بينما B بلا بديل وفشل الاستعادة كارثة", correct:true },
      { text:"B لأن رقمها أقل", correct:false },
      { text:"A لأن مكافحة الفيروسات أهم", correct:false }
    ],
    explain:"تحديث A طُبّق → الخطر انخفض. B تهدد استعادة البيانات → عالية."
  },
  {
    A: { product:"Email Filter 4.0", severity:6.8, condition:"تجاوز فلتر البريد",
         impact:"وصول تصيّد للموظفين", context:"توعية + نظام كشف ثانٍ" },
    B: { product:"File Share 1.5", severity:6.9, condition:"صلاحيات مفتوحة",
         impact:"وصول لملفات حساسة", context:"الجميع يستخدمه، لا تدقيق منذ سنة" },
    correct:"B",
    reasons:[
      { text:"A لأن الشدتين متقاربتان", correct:false },
      { text:"B بلا أي ضابط + ملفات حساسة مفتوحة، بينما A لديها ضابطان", correct:true },
      { text:"A لأن التصيّد أخطر", correct:false },
      { text:"كلتاهما منخفضة", correct:false }
    ],
    explain:"الشدتان متقاربتان، لكن A محمية بضابطين وB مكشوفة تماماً."
  },
  {
    A: { product:"WebServer 3.4", severity:9.8, condition:"ثغرة تنفيذ أوامر عن بُعد",
         impact:"اختراق كامل للخادم", context:"نسخة اختبارية على جهاز معزول، لا بيانات" },
    B: { product:"HR Portal 2.1", severity:6.5, condition:"تسريب بيانات الموظفين",
         impact:"كشف رواتب وبيانات شخصية", context:"مثبت، يستخدمه كل الموظفين، بلا تشفير" },
    correct:"B",
    reasons:[
      { text:"A شدتها 9.8 فلا بد أن تكون أولاً", correct:false },
      { text:"A على جهاز معزول بلا بيانات (خطر فعلي صفر)، بينما B مكشوفة للجميع وبلا تشفير", correct:true },
      { text:"كلتاهما عالية", correct:false },
      { text:"A لأن الاختراق الكامل أخطر", correct:false }
    ],
    explain:"A رغم شدة 9.8، هي نسخة اختبارية معزولة بلا بيانات → خطر فعلي صفر. B ت leaks بيانات حقيقية للجميع."
  },
  {
    A: { product:"Router Firmware 1.2", severity:7.5, condition:"كلمة مرور افتراضية",
         impact:"دخول للراوتر الداخلي", context:"راوتر داخلي، تم تغيير كلمة المرور بالفعل" },
    B: { product:"Cloud Storage 4.0", severity:7.0, condition:"روابط مشاركة دائمة",
         impact:"تسريب ملفات عبر روابط", context:"يستخدمه الجميع، روابط لا تنتهي، بلا مراجعة" },
    correct:"B",
    reasons:[
      { text:"A لأن شدتها أعلى", correct:false },
      { text:"A تم تغيير كلمة المرور (الخطر معالج)، بينما B روابط دائمة بلا مراجعة", correct:true },
      { text:"B لأن رقمها أقل", correct:false },
      { text:"لا فرق", correct:false }
    ],
    explain:"A كلمة المرور تغيّرت → الضعف مغلق. B روابط مفتوحة دائمة → خطر مستمر."
  },
  {
    A: { product:"Dev Tools 6.1", severity:8.2, condition:"ثغرة في أداة تطوير",
         impact:"تنفيذ كود على جهاز المطور", context:"4 مطورين فقط، أدوات معزولة" },
    B: { product:"Public API 3.0", severity:5.9, condition:"لا حد لعدد الطلبات",
         impact:"هجوم حجب الخدمة", context:"مفتوح للإنترنت، يستخدمه آلاف العملاء" },
    correct:"B",
    reasons:[
      { text:"A لأن شدتها أعلى", correct:false },
      { text:"A محدودة بـ4 مطورين معزولين، بينما B مفتوحة للإنترنت وآلاف العملاء → تعرض هائل", correct:true },
      { text:"A لأن تنفيذ الكود أخطر", correct:false },
      { text:"كلتاهما متوسطة", correct:false }
    ],
    explain:"A محدودة جداً (4 أشخاص). B مفتوحة للعالم → تعرض هائل يستحق الأولوية."
  },
  {
    A: { product:"Backup Tape 2.0", severity:8.9, condition:"أشرطة غير مشفرة",
         impact:"سرقة أشرطة النسخ", context:"أشرطة في خزنة مقفلة، لا وصول إلا لموظف واحد" },
    B: { product:"Mobile App 7.3", severity:7.7, condition:"تخزين بيانات حساسة محلياً",
         impact:"سرقة بيانات عند فقدان الجهاز", context:"مثبت على 5000 جهاز طالب، لا تشفير" },
    correct:"B",
    reasons:[
      { text:"A لأن شدتها 8.9", correct:false },
      { text:"A في خزنة مقفلة بوصول محدود، بينما B على 5000 جهاز بلا تشفير → تعرض هائل", correct:true },
      { text:"B لأن رقمها أقل", correct:false },
      { text:"لا يمكن المقارنة", correct:false }
    ],
    explain:"A محمية فيزيائياً. B على 5000 جهاز محمول بلا تشفير → خطر واقعي كبير."
  },
  {
    A: { product:"Old CRM 1.0", severity:9.3, condition:"ثغرة معروفة قديمة",
         impact:"اختراق قاعدة بيانات العملاء", context:"غير مثبت — انتقلنا لنظام جديد" },
    B: { product:"Wi-Fi Guest 2.4", severity:6.0, condition:"شبكة ضيوف بلا عزل",
         impact:"انتقال للشبكة الداخلية", context:"مثبتة ونشطة، يستخدمها كل زائر يومياً" },
    correct:"B",
    reasons:[
      { text:"A لأن شدتها 9.3", correct:false },
      { text:"A غير مثبتة أصلاً، بينما B نشطة ويستخدمها الزوار يومياً → خطر حقيقي", correct:true },
      { text:"A لأن اختراق قاعدة البيانات أخطر", correct:false },
      { text:"كلتاهما عالية", correct:false }
    ],
    explain:"A غير مثبتة → لا خطر. B نشطة مع تعرض يومي → أولوية."
  }
];

// ============================================================
// حالة الغرف
// ============================================================
const rooms = {};

function makeCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// توزيع عشوائي على فرق من 2 — إذا العدد فردي، آخر طالب يُضم لفرقة عشوائية
function distributeTeams(players) {
  const shuffled = shuffle(players);
  const teams = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    teams.push([shuffled[i]]);
    if (shuffled[i + 1]) teams[teams.length - 1].push(shuffled[i + 1]);
  }
  // إذا آخر فرقة فيها لاعب واحد فقط → ضمّه لفرقة عشوائية سابقة (تصبح 3)
  if (teams.length > 1 && teams[teams.length - 1].length === 1) {
    const lonely = teams.pop();
    const target = teams[Math.floor(Math.random() * teams.length)];
    target.push(lonely[0]);
  }
  return teams;
}

function publicRoom(room) {
  const base = {
    mode: room.mode,
    phase: room.phase,
    round: room.round,
    total: ROUNDS.length
  };
  if (room.mode === 'solo') {
    base.players = room.players.map(p => ({ id: p.id, name: p.name }));
    base.scores = room.playerScores;
  } else {
    base.teams = room.teams.map((t, i) => ({
      id: i,
      name: t.name,
      members: t.members.map(m => m.name),
      score: t.score
    }));
  }
  return base;
}

// ============================================================
// Socket events
// ============================================================
io.on('connection', (socket) => {

  // --- إنشاء غرفة (المعلم) ---
  socket.on('createRoom', ({ mode }, cb) => {
    const code = makeCode();
    rooms[code] = {
      hostSocket: socket.id,
      mode: mode || 'team',
      players: [],           // للفردي
      teams: [],             // للجماعي (تُبنى عند التوزيع)
      distributed: false,
      round: 0,
      phase: 'waiting',
      playerScores: {},      // للفردي
      playerAnswers: {},
      playerReasons: {},
      teamScores: [],        // للجماعي
      teamAnswers: [],
      teamReasons: []
    };
    socket.join(code);
    socket.roomCode = code;
    cb({ code, mode: rooms[code].mode });
  });

  // --- انضمام لاعب (فردي أو جماعي — كلاهما اسم فقط) ---
  socket.on('joinRoom', ({ code, name }, cb) => {
    code = (code || '').toUpperCase();
    const room = rooms[code];
    if (!room) return cb({ error: 'الغرفة غير موجودة' });
    if (room.phase !== 'waiting' && room.phase !== 'distributed') {
      return cb({ error: 'اللعبة بدأت بالفعل' });
    }
    const playerId = 'P' + Date.now() + Math.floor(Math.random() * 1000);
    room.players.push({ id: playerId, name: name || 'لاعب', socketId: socket.id });
    room.playerScores[playerId] = 0;
    socket.join(code);
    socket.roomCode = code;
    socket.playerId = playerId;
    socket.playerName = name;
    socket.playerTeamIdx = null;
    io.to(code).emit('roomUpdate', publicRoom(room));
    cb({ ok: true, playerId, name, mode: room.mode });
  });

  // --- المعلم: توزيع عشوائي (للجماعي) ---
  socket.on('distribute', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.mode !== 'team') return;
    if (room.players.length < 2) return;
    const groups = distributeTeams(room.players);
    room.teams = groups.map((members, i) => ({
      name: 'الفريق ' + (i + 1),
      members: members.map(m => ({ id: m.id, name: m.name, socketId: m.socketId })),
      score: 0
    }));
    room.teamScores = room.teams.map(() => 0);
    room.teamAnswers = room.teams.map(() => null);
    room.teamReasons = room.teams.map(() => null);
    room.distributed = true;
    room.phase = 'distributed';

    // إبلاغ كل لاعب بفريقه
    room.teams.forEach((team, idx) => {
      team.members.forEach(m => {
        io.to(m.socketId).emit('youAreInTeam', {
          teamIdx: idx,
          teamName: team.name,
          members: team.members.map(x => x.name)
        });
        const s = io.sockets.sockets.get(m.socketId);
        if (s) s.playerTeamIdx = idx;
      });
    });
    io.to(room.hostSocket).emit('roomUpdate', publicRoom(room));
    io.to(room.hostSocket).emit('distributed', publicRoom(room));
    room.players.forEach(p => {
      io.to(p.socketId).emit('roomUpdate', publicRoom(room));
    });
  });

  // --- المعلم: إعادة التوزيع ---
  socket.on('redistribute', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.mode !== 'team') return;
    room.teams = [];
    room.distributed = false;
    room.phase = 'waiting';
    room.players.forEach(p => {
      io.to(p.socketId).emit('resetTeam');
    });
    io.to(room.hostSocket).emit('roomUpdate', publicRoom(room));
    room.players.forEach(p => io.to(p.socketId).emit('roomUpdate', publicRoom(room)));
  });

  // --- المعلم: بدء الجولة ---
  socket.on('startRound', () => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    if (room.mode === 'team' && !room.distributed) return;
    if (room.players.length === 0) return;

    room.round++;
    room.phase = 'question';
    if (room.mode === 'solo') {
      room.playerAnswers = {};
      room.playerReasons = {};
    } else {
      room.teamAnswers = room.teams.map(() => null);
      room.teamReasons = room.teams.map(() => null);
    }
    io.to(socket.roomCode).emit('roundStarted', {
      round: room.round,
      total: ROUNDS.length,
      data: ROUNDS[room.round - 1],
      mode: room.mode
    });
  });

  // --- لاعب يختار البطاقة ---
  socket.on('pickCard', ({ card }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase !== 'question') return;

    if (room.mode === 'solo') {
      if (room.playerAnswers[socket.playerId]) return;
      room.playerAnswers[socket.playerId] = card;
      io.to(room.hostSocket).emit('progressUpdate', {
        answered: Object.keys(room.playerAnswers).length,
        total: room.players.length
      });
      if (Object.keys(room.playerAnswers).length === room.players.length) {
        room.phase = 'reason';
        io.to(socket.roomCode).emit('phaseChange', { phase: 'reason' });
      }
    } else {
      const idx = socket.playerTeamIdx;
      if (idx === null || idx === undefined) return;
      if (room.teamAnswers[idx]) return;
      room.teamAnswers[idx] = card;
      io.to(room.hostSocket).emit('progressUpdate', {
        answered: room.teamAnswers.filter(a => a).length,
        total: room.teams.length
      });
      if (room.teamAnswers.every(a => a)) {
        room.phase = 'reason';
        io.to(socket.roomCode).emit('phaseChange', { phase: 'reason' });
      }
    }
  });

  // --- لاعب يختار السبب ---
  socket.on('pickReason', ({ idx }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.phase !== 'reason') return;

    if (room.mode === 'solo') {
      if (room.playerReasons[socket.playerId] !== undefined) return;
      room.playerReasons[socket.playerId] = idx;
      io.to(room.hostSocket).emit('progressUpdate', {
        answered: Object.keys(room.playerReasons).length,
        total: room.players.length
      });
      if (Object.keys(room.playerReasons).length === room.players.length) {
        revealSolo(room);
      }
    } else {
      const teamIdx = socket.playerTeamIdx;
      if (teamIdx === null || teamIdx === undefined) return;
      if (room.teamReasons[teamIdx] !== null) return;
      room.teamReasons[teamIdx] = idx;
      io.to(room.hostSocket).emit('progressUpdate', {
        answered: room.teamReasons.filter(r => r !== null).length,
        total: room.teams.length
      });
      if (room.teamReasons.every(r => r !== null)) {
        revealTeam(room);
      }
    }
  });

  // --- المعلم: الجولة التالية ---
  socket.on('nextRound', () => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    if (room.round >= ROUNDS.length) {
      room.phase = 'ended';
      const finalScores = room.mode === 'solo'
        ? Object.fromEntries(room.players.map(p => [p.id, room.playerScores[p.id]]))
        : room.teams.map(t => ({ name: t.name, score: t.score }));
      io.to(socket.roomCode).emit('gameEnded', {
        mode: room.mode,
        finalScores
      });
    } else {
      room.phase = 'waiting';
      if (room.mode === 'solo') {
        room.playerAnswers = {};
        room.playerReasons = {};
      } else {
        room.teamAnswers = room.teams.map(() => null);
        room.teamReasons = room.teams.map(() => null);
      }
      io.to(socket.roomCode).emit('readyNext', publicRoom(room));
    }
  });

  socket.on('disconnect', () => {
    const code = socket.roomCode;
    if (!code || !rooms[code]) return;
    const room = rooms[code];
    if (socket.id === room.hostSocket) {
      io.to(code).emit('hostLeft');
      delete rooms[code];
    } else {
      room.players = room.players.filter(p => p.socketId !== socket.id);
      io.to(room.hostSocket).emit('roomUpdate', publicRoom(room));
    }
  });
});

function revealSolo(room) {
  room.phase = 'reveal';
  const r = ROUNDS[room.round - 1];
  const leaderboard = room.players.map(p => {
    const cardOk = room.playerAnswers[p.id] === r.correct;
    const reasonOk = r.reasons[room.playerReasons[p.id]]?.correct;
    let pts = 0;
    if (cardOk && reasonOk) pts = 2;
    else if (cardOk) pts = 1;
    room.playerScores[p.id] += pts;
    return { id: p.id, name: p.name, cardOk, reasonOk, pts, total: room.playerScores[p.id] };
  }).sort((a, b) => b.total - a.total);

  io.to(room.hostSocket).emit('revealSolo', {
    correct: r.correct,
    explain: r.explain,
    leaderboard,
    round: room.round,
    total: ROUNDS.length
  });
  room.players.forEach(p => {
    const mine = leaderboard.find(x => x.id === p.id);
    io.to(p.socketId).emit('revealSoloPlayer', {
      correct: r.correct,
      explain: r.explain,
      mine,
      leaderboard,
      round: room.round,
      total: ROUNDS.length
    });
  });
}

function revealTeam(room) {
  room.phase = 'reveal';
  const r = ROUNDS[room.round - 1];
  const results = room.teams.map((team, i) => {
    const cardOk = room.teamAnswers[i] === r.correct;
    const reasonOk = r.reasons[room.teamReasons[i]]?.correct;
    let pts = 0;
    if (cardOk && reasonOk) pts = 2;
    else if (cardOk) pts = 1;
    team.score += pts;
    return { teamIdx: i, name: team.name, members: team.members.map(m => m.name),
             cardOk, reasonOk, pts, total: team.score };
  });

  io.to(room.hostSocket).emit('revealTeam', {
    correct: r.correct, explain: r.explain, results,
    round: room.round, total: ROUNDS.length
  });
  room.teams.forEach((team, idx) => {
    const mine = results.find(x => x.teamIdx === idx);
    team.members.forEach(m => {
      io.to(m.socketId).emit('revealTeamPlayer', {
        correct: r.correct, explain: r.explain, mine,
        results, round: room.round, total: ROUNDS.length
      });
    });
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`));
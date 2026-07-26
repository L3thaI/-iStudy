const gradePoints = {
  'أ+': 5.0, 'أ': 4.75, 'ب+': 4.5, 'ب': 4.0,
  'ج+': 3.5, 'ج': 3.0, 'د+': 2.5, 'د': 2.0, 'هـ': 1.0,
};

const gradeColors = {
  'أ+': 'bg-emerald-500', 'أ': 'bg-emerald-400', 'ب+': 'bg-teal-400',
  'ب': 'bg-sky-400', 'ج+': 'bg-amber-400', 'ج': 'bg-orange-400',
  'د+': 'bg-orange-500', 'د': 'bg-red-400', 'هـ': 'bg-red-600',
};

const gradeStripe = {
  'أ+': 'from-emerald-500 to-emerald-400', 'أ': 'from-emerald-400 to-teal-400',
  'ب+': 'from-teal-400 to-sky-400', 'ب': 'from-sky-400 to-sky-300',
  'ج+': 'from-amber-400 to-amber-300', 'ج': 'from-orange-400 to-orange-300',
  'د+': 'from-orange-500 to-red-400', 'د': 'from-red-400 to-red-500',
  'هـ': 'from-red-600 to-red-700',
};

const HOUR_MIN = 1;
const HOUR_MAX = 15;
// تم التعديل لتكون متتابعة ومطابقة لعدد التقديرات (9 أزرار)
const HOUR_QUICK = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const GAP = 326.73; 
let currentMode = 'semester';

function setMode(mode) {
  currentMode = mode;
  const isSemester = mode === 'semester';

  document.getElementById('panel-semester').classList.toggle('active', isSemester);
  document.getElementById('panel-cumulative').classList.toggle('active', !isSemester);

  document.getElementById('toggle-indicator').style.transform =
    isSemester ? 'translateX(0)' : 'translateX(-100%)';

  document.querySelectorAll('.mode-tab').forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.className = `mode-tab relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${
      active ? 'text-ksu-700' : 'text-slate-400'
    }`;
  });

  document.getElementById('calc-btn').textContent =
    isSemester ? 'احسب المعدل الفصلي' : 'احسب المعدل التراكمي';

  document.getElementById('result-box').classList.add('hidden');
  updateLiveStats();
}

document.querySelectorAll('.mode-tab').forEach((tab) => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

function toast(msg) {
  const el = document.getElementById('toast');
  el.querySelector('p').textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 3000);
}

function createCourseCard(containerId) {
  const num = document.querySelectorAll(`#${containerId} .course-card`).length + 1;
  const card = document.createElement('div');
  card.className = 'course-card relative bg-white rounded-2xl border border-ksu-100 shadow-sm overflow-hidden';
  card.dataset.selectedGrade = 'أ+';

  const gradeChips = Object.keys(gradePoints).map((g) =>
    `<button type="button" data-grade="${g}"
      class="grade-chip flex items-center justify-center ${g === 'أ+' ? 'selected' : ''} ${gradeColors[g]} text-white w-9 h-9 rounded-xl text-xs font-extrabold transition-all duration-200">${g}</button>`
  ).join('');

  const quickBtns = HOUR_QUICK.map((h) =>
    `<button type="button" data-hours="${h}"
      class="hour-quick flex items-center justify-center w-9 h-9 rounded-xl text-xs font-extrabold transition-all duration-200 ${
        h === 3 ? 'bg-ksu-600 text-white scale-110 shadow-[0_4px_14px_rgba(0,0,0,0.18)] opacity-100' : 'bg-ksu-50 text-slate-500 hover:bg-ksu-100 opacity-60 scale-95'
      }">${h}</button>`
  ).join('');

  card.innerHTML = `
    <div class="grade-stripe absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b ${gradeStripe['أ+']} transition-all duration-300"></div>
    <div class="p-4 pr-5">
      <div class="flex items-center gap-2 mb-3">
        <span class="course-num w-6 h-6 rounded-lg bg-ksu-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">${num}</span>
        <input type="text" class="course-name flex-1 text-sm font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300 placeholder:font-normal" placeholder="اسم المادة">
        <button type="button" class="remove-btn w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all shrink-0">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="mb-3">
        <span class="text-[10px] font-bold text-slate-400 block mb-2">عدد الساعات</span>
        <div class="flex items-center gap-2">
          <button type="button" class="hours-minus w-10 h-10 rounded-xl bg-ksu-50 text-ksu-700 text-lg font-bold hover:bg-ksu-100 active:scale-95 transition-all shrink-0">−</button>
          <div class="flex-1 flex items-center justify-center gap-1.5 bg-ksu-50 rounded-xl border border-ksu-100 px-3 py-2">
            <input type="number" class="course-hours w-12 bg-transparent text-center text-xl font-extrabold text-ksu-800 outline-none" dir="ltr"
              value="3" min="${HOUR_MIN}" max="${HOUR_MAX}" inputmode="numeric">
            <span class="hours-label text-xs font-semibold text-slate-400">ساعات</span>
          </div>
          <button type="button" class="hours-plus w-10 h-10 rounded-xl bg-ksu-50 text-ksu-700 text-lg font-bold hover:bg-ksu-100 active:scale-95 transition-all shrink-0">+</button>
        </div>
        
        <div class="flex items-start gap-3 mt-4">
          <span class="text-[10px] font-bold text-slate-400 shrink-0 w-10 pt-2">سريع</span>
          <div class="flex flex-wrap gap-1.5">${quickBtns}</div>
        </div>
      </div>
      
      <div class="flex items-start gap-3 mt-4">
        <span class="text-[10px] font-bold text-slate-400 shrink-0 w-10 pt-2">تقدير</span>
        <div class="flex flex-wrap gap-1.5">${gradeChips}</div>
      </div>
    </div>
  `;

  function updateStripe(grade) {
    card.querySelector('.grade-stripe').className =
      `grade-stripe absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b ${gradeStripe[grade]} transition-all duration-300`;
  }

  function clampHours(val) {
    return Math.min(HOUR_MAX, Math.max(HOUR_MIN, val));
  }

  function getHours() {
    return parseInt(card.querySelector('.course-hours').value, 10);
  }

  function setHours(val) {
    const h = clampHours(val);
    card.querySelector('.course-hours').value = h;
    card.querySelector('.hours-label').textContent = h === 1 ? 'ساعة' : 'ساعات';
    
    card.querySelectorAll('.hour-quick').forEach((btn) => {
      const match = parseInt(btn.dataset.hours, 10) === h;
      btn.className = `hour-quick flex items-center justify-center w-9 h-9 rounded-xl text-xs font-extrabold transition-all duration-200 ${
        match ? 'bg-ksu-600 text-white scale-110 shadow-[0_4px_14px_rgba(0,0,0,0.18)] opacity-100 z-10' : 'bg-ksu-50 text-slate-500 hover:bg-ksu-100 opacity-60 scale-95'
      }`;
    });
    updateLiveStats();
  }

  card.querySelector('.hours-minus').addEventListener('click', () => {
    const cur = getHours();
    if (!isNaN(cur)) setHours(cur - 1);
  });

  card.querySelector('.hours-plus').addEventListener('click', () => {
    const cur = getHours();
    if (!isNaN(cur)) setHours(cur + 1);
    else setHours(HOUR_MIN);
  });

  card.querySelector('.course-hours').addEventListener('input', (e) => {
    const raw = e.target.value;
    if (raw === '') return;
    const val = parseInt(raw, 10);
    if (!isNaN(val)) setHours(val);
  });

  card.querySelector('.course-hours').addEventListener('blur', (e) => {
    const val = parseInt(e.target.value, 10);
    setHours(isNaN(val) ? 3 : val);
  });

  card.querySelectorAll('.hour-quick').forEach((btn) => {
    btn.addEventListener('click', () => setHours(parseInt(btn.dataset.hours, 10)));
  });

  setHours(3);

  card.querySelectorAll('.grade-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      card.querySelectorAll('.grade-chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      card.dataset.selectedGrade = chip.dataset.grade;
      updateStripe(chip.dataset.grade);
      updateLiveStats();
    });
  });

  card.querySelector('.remove-btn').addEventListener('click', () => {
    card.style.transition = 'all .2s ease-out';
    card.style.opacity = '0';
    card.style.transform = 'scale(.95) translateX(20px)';
    setTimeout(() => {
      card.remove();
      renumber(containerId);
      if (!document.querySelector(`#${containerId} .course-card`)) {
        document.getElementById(containerId).appendChild(createCourseCard(containerId));
      }
      updateLiveStats();
    }, 200);
  });

  card.querySelector('.course-name').addEventListener('input', updateLiveStats);
  return card;
}

function renumber(containerId) {
  document.querySelectorAll(`#${containerId} .course-card`).forEach((c, i) => {
    c.querySelector('.course-num').textContent = i + 1;
  });
}

function initContainer(id) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  el.appendChild(createCourseCard(id));
}

function activeContainer() {
  return currentMode === 'semester'
    ? 'courses-container-semester'
    : 'courses-container-cumulative';
}

function getCourses(containerId) {
  const cards = document.querySelectorAll(`#${containerId} .course-card`);
  const courses = [];
  for (const card of cards) {
    const hours = parseInt(card.querySelector('.course-hours').value, 10);
    const grade = card.dataset.selectedGrade;
    if (isNaN(hours) || hours < HOUR_MIN || hours > HOUR_MAX) {
      return { error: `عدد الساعات يجب أن يكون بين ${HOUR_MIN} و ${HOUR_MAX}` };
    }
    courses.push({ hours, points: gradePoints[grade], grade, name: card.querySelector('.course-name').value.trim() });
  }
  if (!courses.length) return { error: 'أضف مادة واحدة على الأقل' };
  return { courses };
}

function calcGPA(courses) {
  let pts = 0, hrs = 0;
  for (const c of courses) { pts += c.points * c.hours; hrs += c.hours; }
  return { gpa: pts / hrs, totalHours: hrs };
}

function updateLiveStats() {
  const id = activeContainer();
  const cards = document.querySelectorAll(`#${id} .course-card`);
  let hrs = 0, pts = 0, valid = true;

  cards.forEach((card) => {
    const h = parseInt(card.querySelector('.course-hours').value, 10);
    if (isNaN(h) || h < HOUR_MIN || h > HOUR_MAX) { valid = false; return; }
    hrs += h;
    pts += gradePoints[card.dataset.selectedGrade] * h;
  });

  document.getElementById('stat-courses').textContent = cards.length;
  document.getElementById('stat-hours').textContent = hrs || '0';
  document.getElementById('stat-gpa').textContent =
    valid && hrs > 0 ? (pts / hrs).toFixed(2) : '—';
}

function gpaMessage(gpa) {
  if (gpa >= 4.75) return { text: 'ممتاز! استمر 🌟', color: 'text-emerald-600' };
  if (gpa >= 4.0)  return { text: 'أداء جيد جداً 👏', color: 'text-teal-600' };
  if (gpa >= 3.5)  return { text: 'جيد — يمكنك التحسين 💪', color: 'text-sky-600' };
  if (gpa >= 3.0)  return { text: 'مقبول — ركز أكثر 📚', color: 'text-amber-600' };
  return { text: 'يحتاج مجهود أكبر ⚡', color: 'text-red-500' };
}

function animateGPA(target) {
  const el = document.getElementById('result-gpa');
  const ring = document.getElementById('gauge-ring');
  const start = performance.now();
  const duration = 900;

  ring.style.strokeDashoffset = GAP - (target / 5) * GAP;

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(2);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(2);
  }
  requestAnimationFrame(tick);
}

function showResult(gpa, label, details) {
  const msg = gpaMessage(gpa);
  document.getElementById('result-label').textContent = label;
  document.getElementById('result-message').textContent = msg.text;
  document.getElementById('result-message').className = `text-sm font-bold ${msg.color}`;
  document.getElementById('result-details').textContent = details;

  const box = document.getElementById('result-box');
  box.classList.remove('hidden');
  box.classList.remove('result-pop');
  void box.offsetWidth;
  box.classList.add('result-pop');

  animateGPA(gpa);
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('calc-btn').addEventListener('click', () => {
  if (currentMode === 'semester') {
    const result = getCourses('courses-container-semester');
    if (result.error) { toast(result.error); return; }
    const { gpa, totalHours } = calcGPA(result.courses);
    showResult(gpa, 'معدلك الفصلي', `${result.courses.length} مواد — ${totalHours} ساعة معتمدة`);
  } else {
    const prevH = parseFloat(document.getElementById('prev-hours').value);
    const prevG = parseFloat(document.getElementById('prev-gpa').value);
    if (isNaN(prevH) || prevH < 0) { toast('أدخل الساعات المنجزة سابقاً'); return; }
    if (isNaN(prevG) || prevG < 0 || prevG > 5) { toast('أدخل المعدل السابق (0 – 5)'); return; }

    const result = getCourses('courses-container-cumulative');
    if (result.error) { toast(result.error); return; }

    const { gpa: semGPA, totalHours: semHrs } = calcGPA(result.courses);
    const totalH = prevH + semHrs;
    if (!totalH) { toast('لا توجد ساعات مسجلة'); return; }

    const cumGPA = (prevG * prevH + semGPA * semHrs) / totalH;
    showResult(cumGPA, 'معدلك التراكمي الجديد',
      `${totalH} ساعة (${prevH} سابقة + ${semHrs} فصلية) — معدل الفصل: ${semGPA.toFixed(2)}`);
  }
});

document.getElementById('add-course-semester').addEventListener('click', () => {
  document.getElementById('courses-container-semester').appendChild(createCourseCard('courses-container-semester'));
  updateLiveStats();
});

document.getElementById('add-course-cumulative').addEventListener('click', () => {
  document.getElementById('courses-container-cumulative').appendChild(createCourseCard('courses-container-cumulative'));
  updateLiveStats();
});

initContainer('courses-container-semester');
initContainer('courses-container-cumulative');
setMode('semester');
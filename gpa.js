const gradePoints = {
  'أ+': 5.0, 'أ': 4.75, 'ب+': 4.5, 'ب': 4.0,
  'ج+': 3.5, 'ج': 3.0, 'د+': 2.5, 'د': 2.0, 'هـ': 1.0,
};

const gradeStripe = {
  'أ+': 'from-emerald-500 to-emerald-400', 'أ': 'from-emerald-400 to-teal-400',
  'ب+': 'from-teal-400 to-sky-400', 'ب': 'from-sky-400 to-sky-300',
  'ج+': 'from-amber-400 to-amber-300', 'ج': 'from-orange-400 to-orange-300',
  'د+': 'from-orange-500 to-red-400', 'د': 'from-red-400 to-red-500',
  'هـ': 'from-red-600 to-red-700',
};

const selectColors = {
  'أ+': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'أ': 'bg-emerald-50 border-emerald-200 text-emerald-600',
  'ب+': 'bg-teal-50 border-teal-200 text-teal-700',
  'ب': 'bg-sky-50 border-sky-200 text-sky-700',
  'ج+': 'bg-amber-50 border-amber-200 text-amber-700',
  'ج': 'bg-orange-50 border-orange-200 text-orange-700',
  'د+': 'bg-orange-100 border-orange-300 text-orange-800',
  'د': 'bg-red-50 border-red-200 text-red-700',
  'هـ': 'bg-red-100 border-red-300 text-red-800',
};

const HOUR_MIN = 1;
const HOUR_MAX = 15;
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
  // تعديل التصميم ليكون نحيفاً جداً (شريط واحد)
  card.className = 'course-card relative bg-white rounded-xl border border-ksu-100 shadow-sm overflow-hidden mb-2';
  card.dataset.selectedGrade = 'أ+';

  // إنشاء خيارات التقدير
  const gradeOptions = Object.keys(gradePoints).map((g) =>
    `<option value="${g}">${g}</option>`
  ).join('');

  // إنشاء خيارات الساعات (من 1 إلى 15)
  const hourOptions = Array.from({ length: 15 }, (_, i) => i + 1).map((h) =>
    `<option value="${h}" ${h === 3 ? 'selected' : ''}>${h}</option>`
  ).join('');

  card.innerHTML = `
    <div class="grade-stripe absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b ${gradeStripe['أ+']} transition-all duration-300"></div>
    <div class="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 pl-2 pr-3">
      
      <!-- رقم المادة -->
      <span class="course-num w-6 h-6 rounded-md bg-ksu-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 z-10">${num}</span>
      
      <!-- اسم المادة -->
      <input type="text" class="course-name flex-1 min-w-[40px] text-xs sm:text-sm font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300 placeholder:font-normal" placeholder="اسم المادة">
      
      <!-- الساعات (قائمة منسدلة) -->
      <div class="relative flex items-center bg-ksu-50/50 border border-ksu-100/80 rounded-lg h-8 px-1.5 shrink-0">
        <select class="course-hours appearance-none bg-transparent outline-none text-xs sm:text-sm font-extrabold text-ksu-800 pr-1 pl-5 z-10 cursor-pointer">
          ${hourOptions}
        </select>
        <!-- أيقونة السهم -->
        <svg class="absolute left-1.5 w-2.5 h-2.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <!-- التقدير (قائمة منسدلة) -->
      <div class="grade-container relative flex items-center rounded-lg h-8 px-1.5 shrink-0 bg-emerald-50 border border-emerald-200 text-emerald-700 transition-colors">
        <select class="grade-select appearance-none bg-transparent outline-none text-xs sm:text-sm font-extrabold pr-1 pl-4 z-10 cursor-pointer">
          ${gradeOptions}
        </select>
        <!-- أيقونة السهم -->
        <svg class="absolute left-1.5 w-2.5 h-2.5 opacity-60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <!-- زر الحذف -->
      <button type="button" class="remove-btn w-7 h-7 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;

  const gradeContainer = card.querySelector('.grade-container');
  const gradeSelect = card.querySelector('.grade-select');
  const hoursSelect = card.querySelector('.course-hours');

  // تحديث الألوان عند تغيير التقدير
  gradeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    card.dataset.selectedGrade = val;
    card.querySelector('.grade-stripe').className = 
      `grade-stripe absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b ${gradeStripe[val]} transition-all duration-300`;
    
    gradeContainer.className = `grade-container relative flex items-center rounded-lg h-8 px-1.5 shrink-0 transition-colors ${selectColors[val]}`;
    
    updateLiveStats();
  });

  // تحديث الحسابات عند تغيير الساعات
  hoursSelect.addEventListener('change', () => {
    updateLiveStats();
  });

  // حذف المادة
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

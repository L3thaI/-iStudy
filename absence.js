const MAX_ABSENCE_PERCENT = 25;
const STRONG_WARNING_PERCENT = 20;
const WARNING_PERCENT = 15;
const SEMESTER_WEEKS = 15;

function calculateAbsence() {
  const courseHours = parseInt(document.getElementById('course-hours').value, 10);
  const absentHours = parseInt(document.getElementById('absent-hours').value, 10);

  if (isNaN(courseHours) || courseHours <= 0) {
    showResult('error', 'خطأ في الإدخال', 'يرجى إدخال عدد ساعات المادة بشكل صحيح.');
    return;
  }

  if (isNaN(absentHours) || absentHours < 0) {
    showResult('error', 'خطأ في الإدخال', 'يرجى إدخال عدد الساعات التي غبتها بشكل صحيح.');
    return;
  }

  // معادلة حساب إجمالي ساعات المادة في الفصل
  const totalHours = courseHours * SEMESTER_WEEKS;

  if (absentHours > totalHours) {
    showResult('error', 'خطأ منطقي', 'عدد ساعات الغياب لا يمكن أن يكون أكبر من إجمالي ساعات المادة في الفصل.');
    return;
  }

  // حساب نسبة الغياب الحالية
  const percentage = (absentHours / totalHours) * 100;
  
  // حساب الحد الأقصى للساعات المسموح غيابها (25%)
  const maxAllowedHours = Math.floor(totalHours * (MAX_ABSENCE_PERCENT / 100));
  const remainingHours = maxAllowedHours - absentHours;

  let status, message;

  if (percentage >= MAX_ABSENCE_PERCENT) {
    status = 'danger';
    message = 'تنبيه الحرمان! ❌';
  } else if (percentage >= STRONG_WARNING_PERCENT) {
    status = 'strong-warning';
    message = 'تحذير شديد! ⚠️ باقي القليل جداً على الحرمان';
  } else if (percentage >= WARNING_PERCENT) {
    status = 'warning';
    message = 'انتبه! نسبة غيابك بدأت ترتفع 🟡';
  } else {
    status = 'safe';
    message = 'وضعك في السليم ✅';
  }

  // صياغة النص التفصيلي للطالب
  const details = `إجمالي ساعات المادة في الفصل: ${totalHours} ساعة.\n` + 
                  `نسبة غيابك الحالية: ${percentage.toFixed(1)}%.\n` + 
                  (remainingHours > 0 
                    ? `باقي لك ${remainingHours} ساعة مسموح تغيبها قبل الحرمان.` 
                    : `للأسف، تجاوزت الحد المسموح للغياب وهو ${maxAllowedHours} ساعة.`);

  showResult(status, message, details);
}

function showResult(status, message, details) {
  const box = document.getElementById('absence-result');
  const styles = {
    safe: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    'strong-warning': 'bg-orange-50 border-orange-200 text-orange-800', // لون جديد للتحذير القوي
    danger: 'bg-red-50 border-red-200 text-red-800',
    error: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  box.className = `mt-6 p-5 rounded-xl border ${styles[status]}`;
  document.getElementById('absence-message').textContent = message;
  document.getElementById('absence-details').textContent = details;
  box.classList.remove('hidden');
}

document.getElementById('calc-absence-btn').addEventListener('click', calculateAbsence);
let currentStep = 1;
let availableSlots = [];
let selectedSlotId = null;

const arabicDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${arabicDays[d.getDay()]}، ${d.getDate()} ${arabicMonths[d.getMonth()]} ${d.getFullYear()}`;
}

function showAlert(msg) {
  const box = document.getElementById('alertBox');
  box.textContent = msg;
  box.classList.add('show');
  setTimeout(() => box.classList.remove('show'), 4000);
}

function updateStepUI(step) {
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById('stepDot' + i);
    dot.classList.remove('active','done');
    if (i < step) dot.classList.add('done'), dot.querySelector('.dot').textContent = '✓';
    else if (i === step) dot.classList.add('active');
    else {
      const labels = ['١','٢','٣','٤'];
      dot.querySelector('.dot').textContent = labels[i-1];
    }
  }
  for (let i = 1; i <= 3; i++) {
    const line = document.getElementById('stepLine' + i);
    if (i < step) line.classList.add('done');
    else line.classList.remove('done');
  }
}

async function goToStep(step) {
  if (step > currentStep) {
    if (currentStep === 1) {
      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      if (!name) return showAlert('يرجى إدخال الاسم الكامل');
      if (!phone) return showAlert('يرجى إدخال رقم الهاتف');
      if (!email || !email.includes('@')) return showAlert('يرجى إدخال بريد إلكتروني صحيح');
    }
    if (currentStep === 2) {
      const type = document.querySelector('input[name="consultType"]:checked');
      if (!type) return showAlert('يرجى اختيار نوع الاستشارة');
    }
    if (currentStep === 3) {
      if (!selectedSlotId) return showAlert('يرجى اختيار موعد من القائمة');
    }
  }

  document.getElementById('step' + currentStep).classList.remove('active');
  currentStep = step;
  document.getElementById('step' + currentStep).classList.add('active');
  updateStepUI(currentStep);

  if (step === 3) await loadSlots();
  if (step === 4) fillConfirmation();
}

async function loadSlots() {
  const container = document.getElementById('slotsContainer');
  container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><div style="font-size:32px;margin-bottom:12px">⏳</div>جارٍ تحميل المواعيد...</div>';
  try {
    const res = await fetch('/api/slots');
    availableSlots = await res.json();
    if (!availableSlots.length) {
      container.innerHTML = '<div class="no-slots"><div style="font-size:48px;margin-bottom:16px">📭</div><p>لا توجد مواعيد متاحة حالياً. يرجى التواصل معنا مباشرة.</p></div>';
      return;
    }
    const grouped = {};
    availableSlots.forEach(s => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });
    let html = '';
    Object.entries(grouped).sort().forEach(([date, slots]) => {
      html += `<div style="margin-bottom:24px">
        <div style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)">
          📅 ${formatDate(date)}
        </div>
        <div class="slots-grid">`;
      slots.sort((a,b) => a.time.localeCompare(b.time)).forEach(s => {
        html += `
          <div>
            <input type="radio" name="slotChoice" id="slot_${s.id}" value="${s.id}" class="slot-option" onchange="selectedSlotId='${s.id}'">
            <label for="slot_${s.id}" class="slot-label">
              <span class="slot-time">${s.time}</span>
              <span class="slot-date">${formatDate(s.date)}</span>
            </label>
          </div>`;
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
  } catch {
    container.innerHTML = '<div class="no-slots">⚠️ تعذر تحميل المواعيد. تأكد من تشغيل السيرفر.</div>';
  }
}

function fillConfirmation() {
  const slot = availableSlots.find(s => s.id === selectedSlotId);
  const type = document.querySelector('input[name="consultType"]:checked');
  document.getElementById('confName').textContent = document.getElementById('clientName').value;
  document.getElementById('confPhone').textContent = document.getElementById('clientPhone').value;
  document.getElementById('confEmail').textContent = document.getElementById('clientEmail').value;
  document.getElementById('confType').textContent = type?.value === 'video' ? '📹 صوت وصورة' : '🎧 صوت فقط';
  document.getElementById('confDate').textContent = slot ? formatDate(slot.date) : '—';
  document.getElementById('confTime').textContent = slot ? slot.time : '—';
}

async function submitBooking() {
  const btn = document.getElementById('submitBtn');
  const txt = document.getElementById('submitText');
  btn.disabled = true;
  txt.textContent = '⏳ جارٍ التأكيد...';

  const type = document.querySelector('input[name="consultType"]:checked');
  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('clientName').value.trim(),
        phone: document.getElementById('clientPhone').value.trim(),
        email: document.getElementById('clientEmail').value.trim(),
        slotId: selectedSlotId,
        type: type?.value
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'حدث خطأ');

    document.getElementById('bookingCard').style.display = 'none';
    document.getElementById('successScreen').style.display = 'block';
    document.getElementById('successApptId').textContent = data.appointmentId;
    document.getElementById('joinBtn').href = `/consultation.html?id=${data.appointmentId}&name=${encodeURIComponent(document.getElementById('clientName').value)}`;
  } catch (e) {
    showAlert(e.message);
    btn.disabled = false;
    txt.textContent = '✅ تأكيد الحجز';
  }
}

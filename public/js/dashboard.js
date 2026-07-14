if (!isClientLoggedIn()) location.href = '/account.html';

const arabicDays   = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${arabicDays[d.getDay()]}، ${d.getDate()} ${arabicMonths[d.getMonth()]}`;
}
function statusBadge(status) {
  const map = { confirmed:['badge-confirmed','مؤكدة'], completed:['badge-completed','مكتملة'], cancelled:['badge-cancelled','ملغية'] };
  const [cls, label] = map[status] || ['badge-pending', status];
  return `<span class="badge ${cls}">${label}</span>`;
}
function typeLabel(t) { return t === 'video' ? '📹 صوت وصورة' : '🎧 صوت فقط'; }

function showTab(name, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
}

function handleClientUnauth() {
  localStorage.removeItem('clientToken');
  localStorage.removeItem('clientName');
  location.href = '/account.html';
}

async function loadProfile() {
  try {
    const res = await fetch('/api/client/me', { headers: getClientAuthHeaders() });
    if (res.status === 401) return handleClientUnauth();
    const c = await res.json();
    document.getElementById('profileName').textContent  = c.name;
    document.getElementById('profileEmail').textContent = c.email;
    document.getElementById('profilePhone').textContent = c.phone || '—';
    document.getElementById('sidebarClientName').textContent = c.name;
  } catch {}
}

async function loadMyAppointments() {
  const container = document.getElementById('myAppointmentsTable');
  try {
    const res = await fetch('/api/client/appointments', { headers: getClientAuthHeaders() });
    if (res.status === 401) return handleClientUnauth();
    const list = await res.json();
    if (!list.length) {
      container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">📭 لا توجد حجوزات بعد</div>';
      return;
    }
    let html = `<table class="appointments-table">
      <thead><tr><th>نوع الاستشارة</th><th>التاريخ</th><th>الوقت</th><th>الحالة</th></tr></thead><tbody>`;
    list.forEach(a => {
      html += `<tr>
        <td>${typeLabel(a.type)}</td>
        <td>${formatDate(a.date)}</td>
        <td><strong>${a.time}</strong></td>
        <td>${statusBadge(a.status)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch {
    container.innerHTML = '<div style="padding:24px;text-align:center;color:var(--danger)">⚠️ تعذر تحميل البيانات</div>';
  }
}

loadProfile();
loadMyAppointments();

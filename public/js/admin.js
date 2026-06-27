let adminToken = localStorage.getItem('adminToken');
let allAppointments = [];
let cancelTargetId = null;

const arabicDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${arabicDays[d.getDay()]}، ${d.getDate()} ${arabicMonths[d.getMonth()]}`;
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ar-AE') + ' ' + d.toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit' });
}

function statusBadge(status) {
  const map = {
    confirmed: ['badge-confirmed','مؤكدة'],
    pending: ['badge-pending','قيد الانتظار'],
    completed: ['badge-completed','مكتملة'],
    cancelled: ['badge-cancelled','ملغية']
  };
  const [cls, label] = map[status] || ['badge-pending', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function typeLabel(t) {
  return t === 'video' ? '📹 صوت وصورة' : '🎧 صوت فقط';
}

// ── Auth ──
function adminLogin() {
  const pass = document.getElementById('adminPassword').value;
  fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pass })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      showDashboard();
    } else {
      document.getElementById('loginError').textContent = 'كلمة المرور غير صحيحة';
    }
  })
  .catch(() => document.getElementById('loginError').textContent = 'تعذر الاتصال بالسيرفر');
}

function adminLogout() {
  localStorage.removeItem('adminToken');
  location.reload();
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.remove('hidden');
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('ar-AE', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  loadAll();
}

// ── Tabs ──
function showTab(name, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  if (name === 'appointments') loadAppointments();
  if (name === 'slots') loadSlots();
}

// ── Load All ──
function loadAll() {
  loadAppointments();
  loadSlots();
}

// ── Appointments ──
async function loadAppointments() {
  try {
    const res = await fetch('/api/admin/appointments', { headers: { 'x-admin-token': adminToken } });
    allAppointments = await res.json();
    updateStats();
    renderAppointments(allAppointments.slice(0, 5), 'recentAppointments');
    renderAppointments(allAppointments, 'appointmentsTable');
  } catch {
    document.getElementById('appointmentsTable').innerHTML = '<div style="padding:24px;text-align:center;color:var(--danger)">⚠️ تعذر تحميل البيانات</div>';
  }
}

function updateStats() {
  document.getElementById('statTotal').textContent = allAppointments.length;
  document.getElementById('statConfirmed').textContent = allAppointments.filter(a => a.status === 'confirmed').length;
  document.getElementById('statCompleted').textContent = allAppointments.filter(a => a.status === 'completed').length;
  document.getElementById('statCancelled').textContent = allAppointments.filter(a => a.status === 'cancelled').length;
}

function renderAppointments(list, containerId) {
  const container = document.getElementById(containerId);
  if (!list.length) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">📭 لا توجد حجوزات بعد</div>';
    return;
  }
  let html = `<table class="appointments-table">
    <thead><tr>
      <th>العميل</th><th>الهاتف</th><th>نوع الاستشارة</th><th>التاريخ</th><th>الوقت</th><th>الحالة</th><th>الإجراءات</th>
    </tr></thead><tbody>`;
  list.forEach(a => {
    html += `<tr>
      <td><strong>${a.name}</strong><br><span style="font-size:12px;color:var(--text-muted)">${a.email}</span></td>
      <td>${a.phone}</td>
      <td>${typeLabel(a.type)}</td>
      <td>${formatDate(a.date)}</td>
      <td><strong>${a.time}</strong></td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <div class="action-btns">
          ${a.status === 'confirmed' ? `
            <button class="btn-sm btn-sm-primary" onclick="startSession('${a.id}')">🎥 بدء</button>
            <button class="btn-sm btn-sm-success" onclick="markCompleted('${a.id}')">✅ مكتملة</button>
            <button class="btn-sm btn-sm-danger" onclick="openCancelModal('${a.id}')">❌ إلغاء</button>
          ` : a.status === 'completed' ? '<span style="color:var(--success);font-size:13px">✅ مكتملة</span>'
            : a.status === 'cancelled' ? '<span style="color:var(--danger);font-size:13px">❌ ملغية</span>' : ''}
        </div>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function filterAppointments() {
  const status = document.getElementById('filterStatus').value;
  const filtered = status ? allAppointments.filter(a => a.status === status) : allAppointments;
  renderAppointments(filtered, 'appointmentsTable');
}

async function startSession(id) {
  try {
    const res = await fetch('/api/admin/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify({ appointmentId: id })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    window.open(`/consultation.html?id=${id}&name=${encodeURIComponent('المستشار القانوني')}&admin=1&token=${encodeURIComponent(data.token)}&room=${data.roomName}`, '_blank');
  } catch(e) { alert('خطأ: ' + e.message); }
}

async function markCompleted(id) {
  await fetch(`/api/admin/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
    body: JSON.stringify({ status: 'completed' })
  });
  loadAppointments();
}

function openCancelModal(id) {
  cancelTargetId = id;
  document.getElementById('cancelModal').classList.add('show');
}

function closeModal() {
  document.getElementById('cancelModal').classList.remove('show');
  cancelTargetId = null;
}

async function confirmCancel() {
  if (!cancelTargetId) return;
  await fetch(`/api/admin/appointments/${cancelTargetId}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': adminToken }
  });
  closeModal();
  loadAll();
}

// ── Slots ──
async function loadSlots() {
  try {
    const res = await fetch('/api/admin/slots', { headers: { 'x-admin-token': adminToken } });
    const slots = await res.json();
    const container = document.getElementById('slotsList');
    if (!slots.length) {
      container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px">لا توجد مواعيد مضافة</div>';
      return;
    }
    const arabicDays2 = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const arabicMonths2 = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const fmt = (ds) => { const d = new Date(ds+'T00:00:00'); return `${arabicDays2[d.getDay()]} ${d.getDate()} ${arabicMonths2[d.getMonth()]} ${d.getFullYear()}`; };
    let html = '';
    slots.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).forEach(s => {
      html += `<div class="slot-item">
        <div class="slot-info">
          <span>📅 ${fmt(s.date)}</span>
          <span style="color:var(--gold);font-size:16px">⏰ ${s.time}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="slot-status ${s.available ? '' : 'booked'}">${s.available ? '✅ متاح' : '🔒 محجوز'}</span>
          ${s.available ? `<button class="btn-sm btn-sm-danger" onclick="deleteSlot('${s.id}')">🗑️ حذف</button>` : ''}
        </div>
      </div>`;
    });
    container.innerHTML = html;
  } catch {
    document.getElementById('slotsList').innerHTML = '<div style="color:var(--danger)">تعذر تحميل المواعيد</div>';
  }
}

function showSlotAlert(msg, type = 'success') {
  const el = document.getElementById('slotAlert');
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 3500);
}

async function addSlot() {
  const date = document.getElementById('newSlotDate').value;
  const time = document.getElementById('newSlotTime').value;
  if (!date || !time) return showSlotAlert('يرجى تحديد التاريخ والوقت', 'danger');
  try {
    const res = await fetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify({ date, time })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showSlotAlert('✅ تم إضافة الموعد بنجاح');
    document.getElementById('newSlotDate').value = '';
    document.getElementById('newSlotTime').value = '';
    loadSlots();
  } catch(e) { showSlotAlert(e.message, 'danger'); }
}

async function deleteSlot(id) {
  await fetch(`/api/admin/slots/${id}`, { method: 'DELETE', headers: { 'x-admin-token': adminToken } });
  loadSlots();
}

// ── Init ──
if (adminToken) showDashboard();

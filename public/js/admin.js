let adminToken  = localStorage.getItem('adminToken');
let isMaster    = localStorage.getItem('adminMaster') === 'true';
let adminRole   = localStorage.getItem('adminRole') || 'lawyer'; // lawyer | administrator
let allAppointments = [];
let cancelTargetId  = null;
let currentBookingId = null;

function isAdmin() { return isMaster || adminRole === 'administrator'; }

const arabicDays   = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${arabicDays[d.getDay()]}، ${d.getDate()} ${arabicMonths[d.getMonth()]}`;
}
function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ar-AE') + ' ' + d.toLocaleTimeString('ar-AE', { hour:'2-digit', minute:'2-digit' });
}
function statusBadge(status) {
  const map = { confirmed:['badge-confirmed','مؤكدة'], pending:['badge-pending','قيد الانتظار'], completed:['badge-completed','مكتملة'], cancelled:['badge-cancelled','ملغية'] };
  const [cls, label] = map[status] || ['badge-pending', status];
  return `<span class="badge ${cls}">${label}</span>`;
}
function typeLabel(t) { return t === 'video' ? '📹 صوت وصورة' : '🎧 صوت فقط'; }

// ── Auth ──────────────────────────────────────────────────────
function adminLogin() {
  const username = document.getElementById('adminUsername').value.trim();
  const pass     = document.getElementById('adminPassword').value;
  document.getElementById('loginError').textContent = '';
  fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username || 'admin', password: pass })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      adminToken = data.token;
      isMaster   = data.master;
      adminRole  = data.role || 'lawyer';
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('adminMaster', isMaster);
      localStorage.setItem('adminRole', adminRole);
      showDashboard();
    } else {
      document.getElementById('loginError').textContent = data.error || 'خطأ في تسجيل الدخول';
    }
  })
  .catch(() => document.getElementById('loginError').textContent = 'تعذر الاتصال بالسيرفر');
}

function adminLogout() {
  fetch('/api/admin/logout', { method:'POST', headers:{ 'x-admin-token': adminToken } }).catch(()=>{});
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminMaster');
  localStorage.removeItem('adminRole');
  location.reload();
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.remove('hidden');
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('ar-AE', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Role badge in sidebar
  const roleLabels = { administrator: '🛡️ مدير', lawyer: '⚖️ محامي' };
  const roleLabel  = isMaster ? '👑 المدير الرئيسي' : (roleLabels[adminRole] || '👤 مستخدم');
  document.getElementById('sidebarUsername').textContent = roleLabel;

  // Show/hide tabs based on role
  if (!isAdmin()) {
    // lawyer: hide slots, overview — show only appointments
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
      const tab = a.getAttribute('onclick')?.match(/showTab\('(\w+)'/)?.[1];
      if (tab && tab !== 'appointments' && tab !== 'settings') a.parentElement.style.display = 'none';
    });
    showTab('appointments', null);
  }

  // user management: master only
  if (isMaster) document.getElementById('userMgmtCard').style.display = 'block';

  loadAppointments();
  if (isAdmin()) loadSlots();
}

// ── Tabs ──────────────────────────────────────────────────────
function showTab(name, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  if (name === 'appointments') loadAppointments();
  if (name === 'slots')        loadSlots();
  if (name === 'settings' && isMaster) loadUsers();
}

function loadAll() { loadAppointments(); loadSlots(); }

// ── Appointments ──────────────────────────────────────────────
async function loadAppointments() {
  try {
    const res = await fetch('/api/admin/appointments', { headers:{ 'x-admin-token': adminToken } });
    if (res.status === 401) return handleUnauth();
    allAppointments = await res.json();
    updateStats();
    renderAppointments(allAppointments.slice(0,5), 'recentAppointments');
    renderAppointments(allAppointments, 'appointmentsTable');
  } catch {
    document.getElementById('appointmentsTable').innerHTML = '<div style="padding:24px;text-align:center;color:var(--danger)">⚠️ تعذر تحميل البيانات</div>';
  }
}

function updateStats() {
  document.getElementById('statTotal').textContent     = allAppointments.length;
  document.getElementById('statConfirmed').textContent = allAppointments.filter(a => a.status==='confirmed').length;
  document.getElementById('statCompleted').textContent = allAppointments.filter(a => a.status==='completed').length;
  document.getElementById('statCancelled').textContent = allAppointments.filter(a => a.status==='cancelled').length;
}

function renderAppointments(list, containerId) {
  const container = document.getElementById(containerId);
  if (!list || !list.length) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">📭 لا توجد حجوزات بعد</div>';
    return;
  }
  let html = `<table class="appointments-table">
    <thead><tr><th>العميل</th><th>الهاتف</th><th>نوع الاستشارة</th><th>التاريخ</th><th>الوقت</th><th>الحالة</th></tr></thead><tbody>`;
  list.forEach(a => {
    html += `<tr class="appt-row" onclick="openBookingDetail('${a.id}')" title="اضغط لعرض التفاصيل">
      <td><strong>${a.name}</strong><br><span style="font-size:12px;color:var(--text-muted)">${a.email}</span></td>
      <td>${a.phone}</td>
      <td>${typeLabel(a.type)}</td>
      <td>${formatDate(a.date)}</td>
      <td><strong>${a.time}</strong></td>
      <td>${statusBadge(a.status)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function filterAppointments() {
  const status   = document.getElementById('filterStatus').value;
  const filtered = status ? allAppointments.filter(a => a.status === status) : allAppointments;
  renderAppointments(filtered, 'appointmentsTable');
}

// ── Booking Detail Popup ──────────────────────────────────────
function openBookingDetail(id) {
  const a = allAppointments.find(x => x.id === id);
  if (!a) return;
  currentBookingId = id;

  document.getElementById('bd-name').textContent    = a.name;
  document.getElementById('bd-phone').textContent   = a.phone;
  document.getElementById('bd-email').textContent   = a.email;
  document.getElementById('bd-date').textContent    = formatDate(a.date) + ' ' + a.date;
  document.getElementById('bd-time').textContent    = a.time;
  document.getElementById('bd-type').textContent    = typeLabel(a.type);
  document.getElementById('bd-status').innerHTML    = statusBadge(a.status);
  document.getElementById('bd-created').textContent = a.createdAt ? formatDateTime(a.createdAt) : '—';
  document.getElementById('bd-code').textContent    = a.id;
  document.getElementById('bd-copyMsg').textContent = '';

  const joinUrl = `${location.origin}/consultation.html?id=${a.id}&name=${encodeURIComponent(a.name)}`;
  const linkEl  = document.getElementById('bd-joinLink');
  linkEl.href   = joinUrl;
  linkEl.textContent = '🔗 ' + joinUrl;

  // Action buttons — based on role
  const actionsEl = document.getElementById('bd-actions');
  actionsEl.innerHTML = '';
  if (a.status === 'confirmed') {
    actionsEl.innerHTML = `<button class="btn-primary" onclick="startSessionFromModal('${a.id}')">🎥 بدء الاستشارة</button>`;
    if (isAdmin()) {
      actionsEl.innerHTML += `
        <button class="btn-sm btn-sm-success" onclick="markCompletedFromModal('${a.id}')">✅ تحديد كمكتملة</button>
        <button class="btn-sm btn-sm-danger"  onclick="openCancelModal('${a.id}')">❌ إلغاء الحجز</button>`;
    }
  } else if (a.status === 'completed') {
    actionsEl.innerHTML = `<button class="btn-primary" onclick="startSessionFromModal('${a.id}')">🎥 إعادة فتح الغرفة</button>`;
  }

  document.getElementById('bookingModal').classList.add('show');
}

function copyCode() {
  const code = document.getElementById('bd-code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    document.getElementById('bd-copyMsg').textContent = '✅ تم نسخ الكود!';
    setTimeout(() => document.getElementById('bd-copyMsg').textContent = '', 2500);
  });
}

async function startSessionFromModal(id) {
  try {
    const res  = await fetch('/api/admin/token', { method:'POST', headers:{ 'Content-Type':'application/json', 'x-admin-token': adminToken }, body: JSON.stringify({ appointmentId: id }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    window.open(`/consultation.html?id=${id}&name=${encodeURIComponent('المستشار القانوني')}&admin=1&token=${encodeURIComponent(data.token)}&room=${data.roomName}`, '_blank');
  } catch(e) { alert('خطأ: ' + e.message); }
}

async function markCompletedFromModal(id) {
  await fetch(`/api/admin/appointments/${id}`, { method:'PUT', headers:{ 'Content-Type':'application/json', 'x-admin-token': adminToken }, body: JSON.stringify({ status:'completed' }) });
  closeModal('bookingModal');
  loadAppointments();
}

// ── Legacy helpers (keep for compatibility) ───────────────────
function openCancelModal(id) {
  cancelTargetId = id;
  closeModal('bookingModal');
  document.getElementById('cancelModal').classList.add('show');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  if (id === 'cancelModal') cancelTargetId = null;
}
function handleOverlayClick(e, modalId) {
  if (e.target === document.getElementById(modalId)) closeModal(modalId);
}
async function confirmCancel() {
  if (!cancelTargetId) return;
  await fetch(`/api/admin/appointments/${cancelTargetId}`, { method:'DELETE', headers:{ 'x-admin-token': adminToken } });
  closeModal('cancelModal');
  loadAll();
}

// ── Slots ─────────────────────────────────────────────────────
async function loadSlots() {
  try {
    const res   = await fetch('/api/admin/slots', { headers:{ 'x-admin-token': adminToken } });
    const slots = await res.json();
    const container = document.getElementById('slotsList');
    if (!slots.length) { container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px">لا توجد مواعيد مضافة</div>'; return; }
    const fmt = ds => { const d = new Date(ds+'T00:00:00'); return `${arabicDays[d.getDay()]} ${d.getDate()} ${arabicMonths[d.getMonth()]} ${d.getFullYear()}`; };
    let html = '';
    slots.sort((a,b) => a.date.localeCompare(b.date)||a.time.localeCompare(b.time)).forEach(s => {
      html += `<div class="slot-item">
        <div class="slot-info"><span>📅 ${fmt(s.date)}</span><span style="color:var(--gold);font-size:16px">⏰ ${s.time}</span></div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="slot-status ${s.available?'':'booked'}">${s.available?'✅ متاح':'🔒 محجوز'}</span>
          ${s.available?`<button class="btn-sm btn-sm-danger" onclick="deleteSlot('${s.id}')">🗑️ حذف</button>`:''}
        </div>
      </div>`;
    });
    container.innerHTML = html;
  } catch { document.getElementById('slotsList').innerHTML = '<div style="color:var(--danger)">تعذر تحميل المواعيد</div>'; }
}

function showSlotAlert(msg, type='success') {
  const el = document.getElementById('slotAlert');
  el.textContent = msg; el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 3500);
}

async function addSlot() {
  const date = document.getElementById('newSlotDate').value;
  const time = document.getElementById('newSlotTime').value;
  if (!date||!time) return showSlotAlert('يرجى تحديد التاريخ والوقت', 'danger');
  try {
    const res  = await fetch('/api/admin/slots', { method:'POST', headers:{ 'Content-Type':'application/json', 'x-admin-token': adminToken }, body: JSON.stringify({ date, time }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showSlotAlert('✅ تم إضافة الموعد بنجاح');
    document.getElementById('newSlotDate').value = '';
    document.getElementById('newSlotTime').value = '';
    loadSlots();
  } catch(e) { showSlotAlert(e.message, 'danger'); }
}

async function deleteSlot(id) {
  await fetch(`/api/admin/slots/${id}`, { method:'DELETE', headers:{ 'x-admin-token': adminToken } });
  loadSlots();
}

// ── Settings — Change Password ─────────────────────────────────
async function changePassword() {
  const current  = document.getElementById('currentPass').value;
  const newP     = document.getElementById('newPass').value;
  const confirm  = document.getElementById('confirmPass').value;
  const alertEl  = document.getElementById('passAlert');

  alertEl.className = 'alert'; alertEl.textContent = '';

  if (!current||!newP||!confirm) { showSettingsAlert(alertEl, 'جميع الحقول مطلوبة', 'danger'); return; }
  if (newP !== confirm) { showSettingsAlert(alertEl, 'كلمتا المرور غير متطابقتين', 'danger'); return; }
  if (newP.length < 6) { showSettingsAlert(alertEl, 'كلمة المرور الجديدة 6 أحرف على الأقل', 'danger'); return; }

  try {
    const res  = await fetch('/api/admin/users/me/password', { method:'PUT', headers:{ 'Content-Type':'application/json', 'x-admin-token': adminToken }, body: JSON.stringify({ currentPassword: current, newPassword: newP }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showSettingsAlert(alertEl, '✅ تم تغيير كلمة المرور بنجاح', 'success');
    document.getElementById('currentPass').value = '';
    document.getElementById('newPass').value     = '';
    document.getElementById('confirmPass').value = '';
  } catch(e) { showSettingsAlert(alertEl, e.message, 'danger'); }
}

// ── Settings — User Management ────────────────────────────────
async function loadUsers() {
  if (!isMaster) return;
  try {
    const res   = await fetch('/api/admin/users', { headers:{ 'x-admin-token': adminToken } });
    const users = await res.json();
    const container = document.getElementById('usersList');
    if (!users.length) { container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px">لا يوجد مستخدمون مضافون بعد</div>'; return; }
    let html = `<table class="appointments-table"><thead><tr><th>اسم المستخدم</th><th>الدور</th><th>تاريخ الإضافة</th><th>الإجراءات</th></tr></thead><tbody>`;
    users.forEach(u => {
      const roleBadge = u.role === 'administrator'
        ? '<span style="background:#1a3a6b;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px">🛡️ مدير</span>'
        : '<span style="background:#2c5f2d;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px">⚖️ محامي</span>';
      html += `<tr>
        <td><strong>👤 ${u.username}</strong></td>
        <td>${roleBadge}</td>
        <td>${u.created_at ? formatDateTime(u.created_at) : '—'}</td>
        <td><button class="btn-sm btn-sm-danger" onclick="deleteUser('${u.id}','${u.username}')">🗑️ حذف</button></td>
      </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch { document.getElementById('usersList').innerHTML = '<div style="color:var(--danger)">تعذر تحميل المستخدمين</div>'; }
}

async function addUser() {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newUserPass').value;
  const alertEl  = document.getElementById('usersAlert');
  if (!username||!password) { showSettingsAlert(alertEl, 'اسم المستخدم وكلمة المرور مطلوبان', 'danger'); return; }
  try {
    const role = document.getElementById('newUserRole').value;
    const res  = await fetch('/api/admin/users', { method:'POST', headers:{ 'Content-Type':'application/json', 'x-admin-token': adminToken }, body: JSON.stringify({ username, password, role }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showSettingsAlert(alertEl, `✅ تم إضافة المستخدم "${username}" بنجاح`, 'success');
    document.getElementById('newUsername').value = '';
    document.getElementById('newUserPass').value = '';
    document.getElementById('newUserRole').value = 'lawyer';
    loadUsers();
  } catch(e) { showSettingsAlert(alertEl, e.message, 'danger'); }
}

async function deleteUser(id, username) {
  if (!confirm(`هل تريد حذف المستخدم "${username}"؟`)) return;
  const alertEl = document.getElementById('usersAlert');
  try {
    const res = await fetch(`/api/admin/users/${id}`, { method:'DELETE', headers:{ 'x-admin-token': adminToken } });
    if (!res.ok) throw new Error((await res.json()).error);
    showSettingsAlert(alertEl, `✅ تم حذف المستخدم "${username}"`, 'success');
    loadUsers();
  } catch(e) { showSettingsAlert(alertEl, e.message, 'danger'); }
}

function showSettingsAlert(el, msg, type) {
  el.textContent = msg; el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 4000);
}

function handleUnauth() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminMaster');
  location.reload();
}

// ── Init ──────────────────────────────────────────────────────
if (adminToken) showDashboard();

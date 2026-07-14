// Shared client (customer) auth helpers — used by index.html, booking.html, account.html, dashboard.html

function isClientLoggedIn() { return !!localStorage.getItem('clientToken'); }

function getClientAuthHeaders() {
  const t = localStorage.getItem('clientToken');
  return t ? { 'x-client-token': t } : {};
}

function clientLogout() {
  localStorage.removeItem('clientToken');
  localStorage.removeItem('clientName');
  location.href = '/index.html';
}

function saveClientSession(data) {
  localStorage.setItem('clientToken', data.token);
  localStorage.setItem('clientName', data.client.name);
}

async function clientRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regPasswordConfirm').value;
  const errEl    = document.getElementById('regErrorMsg');
  errEl.textContent = '';

  if (!name || !email || !phone || !password || !confirm) { errEl.textContent = 'يرجى تعبئة جميع الحقول'; return; }
  if (password !== confirm) { errEl.textContent = 'كلمتا المرور غير متطابقتين'; return; }
  if (password.length < 6) { errEl.textContent = 'كلمة المرور 6 أحرف على الأقل'; return; }

  try {
    const res  = await fetch('/api/client/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'حدث خطأ');
    saveClientSession(data);
    location.href = '/dashboard.html';
  } catch (e) { errEl.textContent = e.message; }
}

async function clientLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginErrorMsg');
  errEl.textContent = '';

  if (!email || !password) { errEl.textContent = 'يرجى إدخال البريد الإلكتروني وكلمة المرور'; return; }

  try {
    const res  = await fetch('/api/client/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'حدث خطأ');
    saveClientSession(data);
    location.href = '/dashboard.html';
  } catch (e) { errEl.textContent = e.message; }
}

function initNavAuthLink() {
  const guestLink  = document.getElementById('navGuestLink');
  const clientLink = document.getElementById('navClientLink');
  if (!guestLink || !clientLink) return;
  if (isClientLoggedIn()) { guestLink.classList.add('hidden'); clientLink.classList.remove('hidden'); }
  else { clientLink.classList.add('hidden'); guestLink.classList.remove('hidden'); }
}

document.addEventListener('DOMContentLoaded', initNavAuthLink);

require('dotenv').config();
const express   = require('express');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const { v4: uuidv4 } = require('uuid');
const path      = require('path');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ── Security Headers ──────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

const ALLOWED_ORIGINS = ['https://lawyer-tau-dun.vercel.app', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, cb) => (!origin || ALLOWED_ORIGINS.includes(origin)) ? cb(null, true) : cb(new Error('Not allowed by CORS'))
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate Limiters ─────────────────────────────────────────────
const loginLimiter   = rateLimit({ windowMs: 15*60*1000, max: 10, message: { error: 'محاولات كثيرة، حاول بعد 15 دقيقة' }, standardHeaders: true, legacyHeaders: false });
const bookingLimiter = rateLimit({ windowMs: 60*1000, max: 5, message: { error: 'طلبات كثيرة، حاول بعد قليل' } });
const tokenLimiter   = rateLimit({ windowMs: 60*1000, max: 20, message: { error: 'طلبات كثيرة' } });
const clientAuthLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { error: 'محاولات كثيرة، حاول بعد 15 دقيقة' }, standardHeaders: true, legacyHeaders: false });

// ── Environment ───────────────────────────────────────────────
const APP_ID         = process.env.JAAS_APP_ID;
const KEY_ID         = process.env.JAAS_KEY_ID;
const MASTER_PASSWORD = process.env.ADMIN_PASSWORD;
const PRIVATE_KEY    = (process.env.JAAS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const SESSION_SECRET = process.env.SESSION_SECRET || MASTER_PASSWORD + '_session';

if (!MASTER_PASSWORD) { console.error('❌ ADMIN_PASSWORD env var is required'); process.exit(1); }

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// ── Password Hashing ──────────────────────────────────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(':');
    const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
  } catch { return false; }
}

// ── Validation ────────────────────────────────────────────────
const VALID_TYPES    = ['audio', 'video'];
const VALID_STATUSES = ['confirmed', 'completed', 'cancelled'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidUUID(v) { return UUID_RE.test(v); }
function sanitizeError(e) { console.error(e); return 'حدث خطأ في السيرفر'; }

// ── JWT for JaaS ──────────────────────────────────────────────
function generateJWT(roomName, userName, userEmail, userId, isModerator = false) {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({
    aud: 'jitsi', iss: 'chat', iat: now, exp: now + 7200, nbf: now - 10, sub: APP_ID,
    context: {
      features: { livestreaming: false, 'outbound-call': false, transcription: false, recording: false },
      user: { 'hidden-from-recorder': false, moderator: isModerator, name: userName, id: userId || uuidv4(), avatar: '', email: userEmail || '' }
    },
    room: roomName
  }, PRIVATE_KEY, { algorithm: 'RS256', header: { alg: 'RS256', kid: `${APP_ID}/${KEY_ID}`, typ: 'JWT' } });
}

// ── Admin Auth Middleware ─────────────────────────────────────
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: 'غير مصرح' });
  try {
    const payload = jwt.verify(token, SESSION_SECRET);
    if (payload.type !== 'admin') throw new Error('wrong token type');
    req.adminUser = payload;
    next();
  } catch {
    res.status(401).json({ error: 'الجلسة منتهية، سجل الدخول مجدداً' });
  }
}
// client (customer) session — separate header + token type from adminAuth
function clientAuth(req, res, next) {
  const token = req.headers['x-client-token'];
  if (!token) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
  try {
    const payload = jwt.verify(token, SESSION_SECRET);
    if (payload.type !== 'client') throw new Error('wrong token type');
    req.client = payload;
    next();
  } catch {
    res.status(401).json({ error: 'الجلسة منتهية، سجل الدخول مجدداً' });
  }
}
// administrator or master — full dashboard access
function adminOnly(req, res, next) {
  const { master, role } = req.adminUser || {};
  if (!master && role !== 'administrator')
    return res.status(403).json({ error: 'هذا الإجراء للمديرين فقط' });
  next();
}
// master only — user management
function masterOnly(req, res, next) {
  if (!req.adminUser?.master) return res.status(403).json({ error: 'هذا الإجراء للمدير الرئيسي فقط' });
  next();
}

// ════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════

app.get('/api/slots', async (req, res) => {
  try {
    const { data, error } = await supabase.from('available_slots').select('id,date,time,available').eq('available', true).order('date').order('time');
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.post('/api/book', bookingLimiter, async (req, res) => {
  const { name, phone, email, slotId, type } = req.body;
  if (!name || !phone || !email || !slotId || !type) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'نوع الاستشارة غير صحيح' });
  if (!slotId || typeof slotId !== 'string' || slotId.length > 100) return res.status(400).json({ error: 'معرف الموعد غير صحيح' });
  if (name.length > 100 || phone.length > 20 || email.length > 100) return res.status(400).json({ error: 'البيانات المدخلة طويلة جداً' });

  // Optional: link the booking to a logged-in client account. A missing/invalid/expired
  // token must never block a booking — it silently falls back to an anonymous booking.
  let clientId = null;
  const clientToken = req.headers['x-client-token'];
  if (clientToken) {
    try {
      const payload = jwt.verify(clientToken, SESSION_SECRET);
      if (payload.type === 'client') clientId = payload.clientId;
    } catch {}
  }

  try {
    const { data: slot, error: slotErr } = await supabase.from('available_slots').select('*').eq('id', slotId).eq('available', true).single();
    if (slotErr || !slot) return res.status(400).json({ error: 'الموعد غير متاح' });
    const roomName = uuidv4().replace(/-/g, '').substring(0, 16);
    const id = uuidv4();
    const insertObj = { id, name, phone, email, type, slot_id: slotId, date: slot.date, time: slot.time, status: 'confirmed', room_name: roomName };
    if (clientId) insertObj.client_id = clientId;
    const { error: insertErr } = await supabase.from('appointments').insert(insertObj);
    if (insertErr) throw insertErr;
    await supabase.from('available_slots').update({ available: false }).eq('id', slotId);
    res.json({ success: true, appointmentId: id, date: slot.date, time: slot.time, message: 'تم الحجز بنجاح' });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.post('/api/token', tokenLimiter, async (req, res) => {
  const { appointmentId, name, email } = req.body;
  if (!appointmentId || !isValidUUID(appointmentId)) return res.status(400).json({ error: 'معرف الحجز غير صحيح' });
  try {
    const { data: appt, error } = await supabase.from('appointments').select('*').eq('id', appointmentId).single();
    if (error || !appt) return res.status(404).json({ error: 'الحجز غير موجود' });
    if (appt.status === 'cancelled') return res.status(400).json({ error: 'تم إلغاء الحجز' });
    const token = generateJWT(appt.room_name, name || appt.name, email || appt.email, appointmentId, false);
    res.json({ token, roomName: appt.room_name, appId: APP_ID, type: appt.type });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

// ════════════════════════════════════════════════════════════════
// CLIENT AUTH
// ════════════════════════════════════════════════════════════════

app.post('/api/client/register', clientAuthLimiter, async (req, res) => {
  let { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  email = email.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 100) return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
  if (name.length > 100 || phone.length > 20) return res.status(400).json({ error: 'البيانات المدخلة طويلة جداً' });
  if (password.length < 6) return res.status(400).json({ error: 'كلمة المرور 6 أحرف على الأقل' });
  try {
    const { data: existing } = await supabase.from('clients').select('id').eq('email', email).single();
    if (existing) return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    const id = uuidv4();
    const password_hash = hashPassword(password);
    const { error } = await supabase.from('clients').insert({ id, name, email, phone, password_hash });
    if (error) throw error;
    const token = jwt.sign({ type: 'client', clientId: id, email, name }, SESSION_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, client: { id, name, email, phone } });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.post('/api/client/login', clientAuthLimiter, async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  email = email.trim().toLowerCase();
  try {
    const { data: client } = await supabase.from('clients').select('*').eq('email', email).single();
    if (!client || !verifyPassword(password, client.password_hash)) return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    const token = jwt.sign({ type: 'client', clientId: client.id, email: client.email, name: client.name }, SESSION_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, client: { id: client.id, name: client.name, email: client.email, phone: client.phone } });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.get('/api/client/me', clientAuth, async (req, res) => {
  try {
    const { data: client, error } = await supabase.from('clients').select('id,name,email,phone,created_at').eq('id', req.client.clientId).single();
    if (error || !client) return res.status(404).json({ error: 'الحساب غير موجود' });
    res.json({ id: client.id, name: client.name, email: client.email, phone: client.phone, createdAt: client.created_at });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.get('/api/client/appointments', clientAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('appointments').select('*').eq('client_id', req.client.clientId).order('date', { ascending: false }).order('time', { ascending: false });
    if (error) throw error;
    res.json(data.map(a => ({ id: a.id, name: a.name, phone: a.phone, email: a.email, type: a.type, slotId: a.slot_id, date: a.date, time: a.time, status: a.status, roomName: a.room_name, createdAt: a.created_at })));
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

// ════════════════════════════════════════════════════════════════
// ADMIN AUTH
// ════════════════════════════════════════════════════════════════

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!password) return res.status(400).json({ error: 'كلمة المرور مطلوبة' });

  // 1) Check master admin (env var)
  if ((!username || username === 'master' || username === 'admin') && password === MASTER_PASSWORD) {
    const token = jwt.sign({ type: 'admin', role: 'administrator', master: true, username: 'master' }, SESSION_SECRET, { expiresIn: '8h' });
    return res.json({ success: true, token, master: true, role: 'administrator' });
  }

  // 2) Check Supabase users
  if (username) {
    try {
      const { data: user } = await supabase.from('admin_users').select('*').eq('username', username).single();
      if (user && verifyPassword(password, user.password_hash)) {
        const token = jwt.sign({ type: 'admin', role: user.role, master: false, username: user.username, userId: user.id }, SESSION_SECRET, { expiresIn: '8h' });
        return res.json({ success: true, token, master: false, role: user.role });
      }
    } catch {}
  }

  res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
});

app.post('/api/admin/logout', (req, res) => res.json({ success: true }));

// ════════════════════════════════════════════════════════════════
// ADMIN — APPOINTMENTS
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/appointments', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map(a => ({ id: a.id, name: a.name, phone: a.phone, email: a.email, type: a.type, slotId: a.slot_id, date: a.date, time: a.time, status: a.status, roomName: a.room_name, createdAt: a.created_at })));
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.put('/api/admin/appointments/:id', adminAuth, adminOnly, async (req, res) => {
  if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'معرف غير صحيح' });
  if (req.body.status && !VALID_STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'حالة غير صحيحة' });
  try {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    const { error } = await supabase.from('appointments').update(updates).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.delete('/api/admin/appointments/:id', adminAuth, adminOnly, async (req, res) => {
  if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'معرف غير صحيح' });
  try {
    const { data: appt } = await supabase.from('appointments').select('slot_id').eq('id', req.params.id).single();
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', req.params.id);
    if (appt?.slot_id) await supabase.from('available_slots').update({ available: true }).eq('id', appt.slot_id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

// ════════════════════════════════════════════════════════════════
// ADMIN — SLOTS
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/slots', adminAuth, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase.from('available_slots').select('*').order('date').order('time');
    if (error) throw error;
    res.json(data.map(s => ({ id: s.id, date: s.date, time: s.time, available: s.available })));
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.post('/api/admin/slots', adminAuth, adminOnly, async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'التاريخ والوقت مطلوبان' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return res.status(400).json({ error: 'تنسيق التاريخ أو الوقت غير صحيح' });
  try {
    const { data: existing } = await supabase.from('available_slots').select('id').eq('date', date).eq('time', time).single();
    if (existing) return res.status(400).json({ error: 'الموعد موجود بالفعل' });
    const slot = { id: uuidv4(), date, time, available: true };
    const { error } = await supabase.from('available_slots').insert(slot);
    if (error) throw error;
    res.json({ success: true, slot });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.delete('/api/admin/slots/:id', adminAuth, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from('available_slots').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

app.post('/api/admin/token', adminAuth, async (req, res) => {
  if (!req.body.appointmentId || !isValidUUID(req.body.appointmentId)) return res.status(400).json({ error: 'معرف غير صحيح' });
  try {
    const { data: appt, error } = await supabase.from('appointments').select('*').eq('id', req.body.appointmentId).single();
    if (error || !appt) return res.status(404).json({ error: 'الحجز غير موجود' });
    const token = generateJWT(appt.room_name, 'المستشار القانوني', 'admin@office.ae', 'admin-moderator', true);
    res.json({ token, roomName: appt.room_name, appId: APP_ID, type: appt.type });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

// ════════════════════════════════════════════════════════════════
// ADMIN — USER MANAGEMENT
// ════════════════════════════════════════════════════════════════

// List all admin users (master only)
app.get('/api/admin/users', adminAuth, masterOnly, async (req, res) => {
  try {
    const { data, error } = await supabase.from('admin_users').select('id,username,created_at').order('created_at');
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

// Add admin user (master only)
app.post('/api/admin/users', adminAuth, masterOnly, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
  if (!['lawyer', 'administrator'].includes(role)) return res.status(400).json({ error: 'الدور غير صحيح' });
  if (username.length < 3 || username.length > 30) return res.status(400).json({ error: 'اسم المستخدم بين 3 و30 حرف' });
  if (password.length < 6) return res.status(400).json({ error: 'كلمة المرور 6 أحرف على الأقل' });
  if (username === 'admin') return res.status(400).json({ error: 'اسم المستخدم محجوز' });
  try {
    const { data: existing } = await supabase.from('admin_users').select('id').eq('username', username).single();
    if (existing) return res.status(400).json({ error: 'اسم المستخدم مستخدم بالفعل' });
    const password_hash = hashPassword(password);
    const { error } = await supabase.from('admin_users').insert({ username, password_hash, role });
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

// Delete admin user (master only)
app.delete('/api/admin/users/:id', adminAuth, masterOnly, async (req, res) => {
  try {
    const { error } = await supabase.from('admin_users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

// Change own password (sub-admin changes their Supabase password)
app.put('/api/admin/users/me/password', adminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'كلمة المرور الجديدة 6 أحرف على الأقل' });

  const { username, master, userId } = req.adminUser;

  // Master admin: verify against env var, update in admin_settings
  if (master) {
    if (currentPassword !== MASTER_PASSWORD) return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    // We can't change env vars at runtime — store override in Supabase settings
    const hash = hashPassword(newPassword);
    await supabase.from('admin_settings').upsert({ key: 'master_password_hash', value: hash });
    return res.json({ success: true, note: 'تم تغيير كلمة المرور — ستُطبق من خلال Supabase override' });
  }

  // Sub-admin: verify and update their record
  try {
    const { data: user } = await supabase.from('admin_users').select('*').eq('id', userId).single();
    if (!user || !verifyPassword(currentPassword, user.password_hash)) return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    const { error } = await supabase.from('admin_users').update({ password_hash: hashPassword(newPassword) }).eq('id', userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: sanitizeError(e) }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`));
module.exports = app;

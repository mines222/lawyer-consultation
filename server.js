require('dotenv').config();
const express    = require('express');
const jwt        = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path       = require('path');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ── Security Headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // JaaS iframe needs relaxed CSP
  crossOriginEmbedderPolicy: false
}));

// ── CORS — restrict to known origins ─────────────────────────
const ALLOWED_ORIGINS = [
  'https://lawyer-tau-dun.vercel.app',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '10kb' })); // prevent large payload attacks
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate Limiters ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'محاولات كثيرة، حاول بعد 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders: false
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'طلبات كثيرة، حاول بعد قليل' }
});

const tokenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'طلبات كثيرة' }
});

// ── Environment ───────────────────────────────────────────────
const APP_ID   = process.env.JAAS_APP_ID;
const KEY_ID   = process.env.JAAS_KEY_ID;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const PRIVATE_KEY    = (process.env.JAAS_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD env var is required');
  process.exit(1);
}

// Session tokens — generated per login, NOT the password itself
const activeSessions = new Set();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Validation helpers ────────────────────────────────────────
const VALID_TYPES    = ['audio', 'video'];
const VALID_STATUSES = ['confirmed', 'completed', 'cancelled'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(v) { return UUID_RE.test(v); }
function sanitizeError(e) {
  console.error(e);
  return 'حدث خطأ في السيرفر';
}

// ── JWT ──────────────────────────────────────────────────────
function generateJWT(roomName, userName, userEmail, userId, isModerator = false) {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({
    aud: 'jitsi', iss: 'chat',
    iat: now, exp: now + 7200, nbf: now - 10,
    sub: APP_ID,
    context: {
      features: { livestreaming: false, 'outbound-call': false, transcription: false, recording: false },
      user: { 'hidden-from-recorder': false, moderator: isModerator, name: userName, id: userId || uuidv4(), avatar: '', email: userEmail || '' }
    },
    room: roomName
  }, PRIVATE_KEY, {
    algorithm: 'RS256',
    header: { alg: 'RS256', kid: `${APP_ID}/${KEY_ID}`, typ: 'JWT' }
  });
}

// ── Admin Auth Middleware ─────────────────────────────────────
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || !activeSessions.has(token))
    return res.status(401).json({ error: 'غير مصرح' });
  next();
}

// ── Public API ───────────────────────────────────────────────

app.get('/api/slots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('available_slots')
      .select('id, date, time, available')
      .eq('available', true)
      .order('date').order('time');
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

app.post('/api/book', bookingLimiter, async (req, res) => {
  const { name, phone, email, slotId, type } = req.body;

  if (!name || !phone || !email || !slotId || !type)
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  if (!VALID_TYPES.includes(type))
    return res.status(400).json({ error: 'نوع الاستشارة غير صحيح' });
  if (!isValidUUID(slotId))
    return res.status(400).json({ error: 'معرف الموعد غير صحيح' });
  if (name.length > 100 || phone.length > 20 || email.length > 100)
    return res.status(400).json({ error: 'البيانات المدخلة طويلة جداً' });

  try {
    const { data: slot, error: slotErr } = await supabase
      .from('available_slots').select('*').eq('id', slotId).eq('available', true).single();
    if (slotErr || !slot) return res.status(400).json({ error: 'الموعد غير متاح' });

    const roomName = uuidv4().replace(/-/g, '').substring(0, 16);
    const id = uuidv4();

    const { error: insertErr } = await supabase.from('appointments').insert({
      id, name, phone, email, type,
      slot_id: slotId, date: slot.date, time: slot.time,
      status: 'confirmed', room_name: roomName
    });
    if (insertErr) throw insertErr;

    await supabase.from('available_slots').update({ available: false }).eq('id', slotId);
    res.json({ success: true, appointmentId: id, date: slot.date, time: slot.time, message: 'تم الحجز بنجاح' });
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

app.post('/api/token', tokenLimiter, async (req, res) => {
  const { appointmentId, name, email } = req.body;
  if (!appointmentId || !isValidUUID(appointmentId))
    return res.status(400).json({ error: 'معرف الحجز غير صحيح' });
  try {
    const { data: appt, error } = await supabase
      .from('appointments').select('*').eq('id', appointmentId).single();
    if (error || !appt) return res.status(404).json({ error: 'الحجز غير موجود' });
    if (appt.status === 'cancelled') return res.status(400).json({ error: 'تم إلغاء الحجز' });
    const token = generateJWT(appt.room_name, name || appt.name, email || appt.email, appointmentId, false);
    res.json({ token, roomName: appt.room_name, appId: APP_ID, type: appt.type });
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

// ── Admin API ────────────────────────────────────────────────

app.post('/api/admin/login', loginLimiter, (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  // Generate a random session token — never return the password itself
  const sessionToken = uuidv4();
  activeSessions.add(sessionToken);
  // Expire session after 8 hours
  setTimeout(() => activeSessions.delete(sessionToken), 8 * 60 * 60 * 1000);
  res.json({ success: true, token: sessionToken });
});

app.post('/api/admin/logout', adminAuth, (req, res) => {
  activeSessions.delete(req.headers['x-admin-token']);
  res.json({ success: true });
});

app.get('/api/admin/appointments', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map(a => ({
      id: a.id, name: a.name, phone: a.phone, email: a.email,
      type: a.type, slotId: a.slot_id, date: a.date, time: a.time,
      status: a.status, roomName: a.room_name, createdAt: a.created_at
    })));
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

app.put('/api/admin/appointments/:id', adminAuth, async (req, res) => {
  if (!isValidUUID(req.params.id))
    return res.status(400).json({ error: 'معرف غير صحيح' });
  if (req.body.status && !VALID_STATUSES.includes(req.body.status))
    return res.status(400).json({ error: 'حالة غير صحيحة' });
  try {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    const { error } = await supabase.from('appointments').update(updates).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

app.delete('/api/admin/appointments/:id', adminAuth, async (req, res) => {
  if (!isValidUUID(req.params.id))
    return res.status(400).json({ error: 'معرف غير صحيح' });
  try {
    const { data: appt } = await supabase.from('appointments').select('slot_id').eq('id', req.params.id).single();
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', req.params.id);
    if (appt?.slot_id) await supabase.from('available_slots').update({ available: true }).eq('id', appt.slot_id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

app.get('/api/admin/slots', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('available_slots').select('*').order('date').order('time');
    if (error) throw error;
    res.json(data.map(s => ({ id: s.id, date: s.date, time: s.time, available: s.available })));
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

app.post('/api/admin/slots', adminAuth, async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'التاريخ والوقت مطلوبان' });
  // Validate date and time format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return res.status(400).json({ error: 'تنسيق التاريخ أو الوقت غير صحيح' });
  try {
    const { data: existing } = await supabase
      .from('available_slots').select('id').eq('date', date).eq('time', time).single();
    if (existing) return res.status(400).json({ error: 'الموعد موجود بالفعل' });
    const slot = { id: 's' + uuidv4().substring(0, 8), date, time, available: true };
    const { error } = await supabase.from('available_slots').insert(slot);
    if (error) throw error;
    res.json({ success: true, slot });
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

app.delete('/api/admin/slots/:id', adminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('available_slots').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

app.post('/api/admin/token', adminAuth, async (req, res) => {
  if (!req.body.appointmentId || !isValidUUID(req.body.appointmentId))
    return res.status(400).json({ error: 'معرف غير صحيح' });
  try {
    const { data: appt, error } = await supabase
      .from('appointments').select('*').eq('id', req.body.appointmentId).single();
    if (error || !appt) return res.status(404).json({ error: 'الحجز غير موجود' });
    const token = generateJWT(appt.room_name, 'المستشار القانوني', 'admin@office.ae', 'admin-moderator', true);
    res.json({ token, roomName: appt.room_name, appId: APP_ID, type: appt.type });
  } catch (e) {
    res.status(500).json({ error: sanitizeError(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`));

module.exports = app;

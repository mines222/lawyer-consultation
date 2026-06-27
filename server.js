require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const APP_ID = process.env.JAAS_APP_ID || 'vpaas-magic-cookie-e20359dbbbbf4b4682a312800d35ba98';
const KEY_ID = process.env.JAAS_KEY_ID || 'e23e13';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@lawyer2026';
const PRIVATE_KEY = (process.env.JAAS_PRIVATE_KEY || '').replace(/\\n/g, '\n');

// ── Storage: file on local, in-memory on Vercel ──────────────
const DATA_FILE = path.join(__dirname, 'data', 'appointments.json');
const IS_SERVERLESS = !fs.existsSync(path.join(__dirname, 'data'));

const defaultData = {
  appointments: [],
  availableSlots: [
    { id: 's1', date: '2026-06-29', time: '10:00', available: true },
    { id: 's2', date: '2026-06-29', time: '11:00', available: true },
    { id: 's3', date: '2026-06-29', time: '14:00', available: true },
    { id: 's4', date: '2026-06-29', time: '15:00', available: true },
    { id: 's5', date: '2026-06-30', time: '10:00', available: true },
    { id: 's6', date: '2026-06-30', time: '11:00', available: true },
    { id: 's7', date: '2026-06-30', time: '14:00', available: true },
    { id: 's8', date: '2026-07-01', time: '10:00', available: true },
    { id: 's9', date: '2026-07-01', time: '11:00', available: true },
    { id: 's10', date: '2026-07-01', time: '14:00', available: true }
  ]
};

let memoryData = IS_SERVERLESS ? JSON.parse(JSON.stringify(defaultData)) : null;

function readData() {
  if (IS_SERVERLESS) return memoryData;
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return JSON.parse(JSON.stringify(defaultData)); }
}

function writeData(data) {
  if (IS_SERVERLESS) { memoryData = data; return; }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── JWT ──────────────────────────────────────────────────────
function generateJWT(roomName, userName, userEmail, userId, isModerator = false) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'jitsi', iss: 'chat',
    iat: now, exp: now + 7200, nbf: now - 10,
    sub: APP_ID,
    context: {
      features: { livestreaming: false, 'outbound-call': false, transcription: false, recording: false },
      user: { 'hidden-from-recorder': false, moderator: isModerator, name: userName, id: userId || uuidv4(), avatar: '', email: userEmail || '' }
    },
    room: roomName
  };
  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    header: { alg: 'RS256', kid: `${APP_ID}/${KEY_ID}`, typ: 'JWT' }
  });
}

function adminAuth(req, res, next) {
  if (req.headers['x-admin-token'] !== ADMIN_PASSWORD) return res.status(401).json({ error: 'غير مصرح' });
  next();
}

// ── Public API ───────────────────────────────────────────────
app.get('/api/slots', (req, res) => {
  res.json(readData().availableSlots.filter(s => s.available));
});

app.post('/api/book', (req, res) => {
  const { name, phone, email, slotId, type } = req.body;
  if (!name || !phone || !email || !slotId || !type)
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  const data = readData();
  const slot = data.availableSlots.find(s => s.id === slotId && s.available);
  if (!slot) return res.status(400).json({ error: 'الموعد غير متاح' });
  const roomName = uuidv4().replace(/-/g, '').substring(0, 16);
  const appointment = {
    id: uuidv4(), name, phone, email, type, slotId,
    date: slot.date, time: slot.time, status: 'confirmed',
    roomName, createdAt: new Date().toISOString()
  };
  slot.available = false;
  data.appointments.push(appointment);
  writeData(data);
  res.json({ success: true, appointmentId: appointment.id, date: slot.date, time: slot.time, message: 'تم الحجز بنجاح' });
});

app.post('/api/token', (req, res) => {
  const { appointmentId, name, email } = req.body;
  if (!appointmentId) return res.status(400).json({ error: 'معرف الحجز مطلوب' });
  const data = readData();
  const appt = data.appointments.find(a => a.id === appointmentId);
  if (!appt) return res.status(404).json({ error: 'الحجز غير موجود' });
  if (appt.status === 'cancelled') return res.status(400).json({ error: 'تم إلغاء الحجز' });
  const token = generateJWT(appt.roomName, name || appt.name, email || appt.email, appointmentId, false);
  res.json({ token, roomName: appt.roomName, appId: APP_ID, type: appt.type });
});

// ── Admin API ────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) res.json({ success: true, token: ADMIN_PASSWORD });
  else res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
});

app.get('/api/admin/appointments', adminAuth, (req, res) => {
  res.json(readData().appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.put('/api/admin/appointments/:id', adminAuth, (req, res) => {
  const data = readData();
  const appt = data.appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'غير موجود' });
  Object.assign(appt, req.body);
  writeData(data);
  res.json({ success: true });
});

app.delete('/api/admin/appointments/:id', adminAuth, (req, res) => {
  const data = readData();
  const appt = data.appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'غير موجود' });
  const slot = data.availableSlots.find(s => s.id === appt.slotId);
  if (slot) slot.available = true;
  appt.status = 'cancelled';
  writeData(data);
  res.json({ success: true });
});

app.get('/api/admin/slots', adminAuth, (req, res) => res.json(readData().availableSlots));

app.post('/api/admin/slots', adminAuth, (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'التاريخ والوقت مطلوبان' });
  const data = readData();
  if (data.availableSlots.find(s => s.date === date && s.time === time))
    return res.status(400).json({ error: 'الموعد موجود بالفعل' });
  const slot = { id: 's' + uuidv4().substring(0, 8), date, time, available: true };
  data.availableSlots.push(slot);
  writeData(data);
  res.json({ success: true, slot });
});

app.delete('/api/admin/slots/:id', adminAuth, (req, res) => {
  const data = readData();
  const idx = data.availableSlots.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'غير موجود' });
  data.availableSlots.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

app.post('/api/admin/token', adminAuth, (req, res) => {
  const data = readData();
  const appt = data.appointments.find(a => a.id === req.body.appointmentId);
  if (!appt) return res.status(404).json({ error: 'الحجز غير موجود' });
  const token = generateJWT(appt.roomName, 'المستشار القانوني', 'admin@office.ae', 'admin-moderator', true);
  res.json({ token, roomName: appt.roomName, appId: APP_ID, type: appt.type });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`));

module.exports = app;

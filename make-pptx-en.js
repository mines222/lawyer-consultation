const SKILL = "C:/Users/karim/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/c77e70b1-8ee6-4d82-99e1-b4810e81f48a/670a369d-abe1-42c4-96fc-3e0b5a15576f/skills/pptx/node_modules/pptxgenjs";
const pptxgen = require(SKILL);

const OUT = "C:/Users/karim/Desktop/Ahmed/lawyer/1Que-LegalSystem-EN.pptx";

const NAVY  = "1A2B4A";
const DARK  = "0D1B2F";
const GOLD  = "C9A84C";
const GOLD2 = "A6862A";
const WHITE = "FFFFFF";
const CREAM = "F8F6F1";
const MUTED = "6B7280";

const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.12 });

function addCard(slide, x, y, w, h, color) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color }, line: { color }, rectRadius: 0.12, shadow: makeShadow() });
}

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title  = "Online Legal Consultation System - 1Que";
pres.author = "1Que";

// ── SLIDE 1: Cover ──────────────────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: DARK };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });
  s.addShape(pres.shapes.OVAL, { x: -1.2, y: 2.5, w: 4, h: 4, fill: { color: GOLD, transparency: 90 }, line: { color: GOLD, transparency: 80 } });
  s.addShape(pres.shapes.OVAL, { x: 7.8, y: -0.5, w: 3.5, h: 3.5, fill: { color: GOLD, transparency: 92 }, line: { color: GOLD, transparency: 85 } });

  s.addShape("roundRect", { x: 0.45, y: 0.3, w: 1.4, h: 0.48, fill: { color: GOLD }, line: { color: GOLD }, rectRadius: 0.1 });
  s.addText("1Que", { x: 0.45, y: 0.3, w: 1.4, h: 0.48, fontSize: 16, bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });

  s.addShape(pres.shapes.OVAL, { x: 4.2, y: 0.7, w: 1.6, h: 1.6, fill: { color: GOLD, transparency: 80 }, line: { color: GOLD } });
  s.addText("⚖", { x: 4.2, y: 0.7, w: 1.6, h: 1.6, fontSize: 36, align: "center", valign: "middle", color: GOLD });

  s.addText("Online Legal Consultation", {
    x: 0.5, y: 2.55, w: 9, h: 0.9, fontSize: 38, bold: true, color: WHITE, align: "center", margin: 0
  });
  s.addText("Integrated Digital System", {
    x: 0.5, y: 3.38, w: 9, h: 0.8, fontSize: 38, bold: true, color: GOLD, align: "center", margin: 0
  });
  s.addText("A complete digital solution for delivering professional legal consultations online", {
    x: 0.5, y: 4.25, w: 9, h: 0.5, fontSize: 14, color: "A0AEC0", align: "center", margin: 0
  });

  s.addShape(pres.shapes.LINE, { x: 3.5, y: 4.85, w: 3, h: 0, line: { color: GOLD, width: 1.5 } });
  s.addText("Developed by: 1Que  |  2026", {
    x: 0.5, y: 5.1, w: 9, h: 0.35, fontSize: 11, color: "4A5568", align: "center"
  });
}

// ── SLIDE 2: System Overview ─────────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: CREAM };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("System Overview", { x: 0.5, y: 0, w: 8, h: 1.15, fontSize: 26, bold: true, color: WHITE, align: "left", valign: "middle", margin: 0 });
  s.addText("1Que", { x: 8.2, y: 0, w: 1.5, h: 1.15, fontSize: 14, bold: true, color: GOLD, align: "right", valign: "middle" });

  s.addText("A fully integrated platform that enables law firms to deliver professional legal consultations online with ease and professionalism", {
    x: 0.5, y: 1.3, w: 9, h: 0.55, fontSize: 13.5, color: MUTED, align: "center"
  });

  const cards = [
    { icon: "📅", title: "Appointment Booking", desc: "A smart booking system that lets clients choose available slots with ease" },
    { icon: "🎥", title: "Online Consultations", desc: "High-quality audio and video calls powered by advanced JaaS technology" },
    { icon: "📊", title: "Admin Dashboard", desc: "Comprehensive management of bookings, appointments, and clients in one place" },
    { icon: "☁️", title: "Cloud Storage", desc: "Secure and reliable Supabase database to store all data safely" },
  ];
  const cw = 2.1, ch = 2.4, gap = 0.2, sx = 0.45;
  cards.forEach((c, i) => {
    let cx = sx + i * (cw + gap);
    addCard(s, cx, 2.05, cw, ch, WHITE);
    s.addShape(pres.shapes.OVAL, { x: cx + 0.75, y: 2.2, w: 0.6, h: 0.6, fill: { color: GOLD, transparency: 80 }, line: { color: GOLD } });
    s.addText(c.icon, { x: cx + 0.72, y: 2.2, w: 0.66, h: 0.6, fontSize: 18, align: "center", valign: "middle" });
    s.addText(c.title, { x: cx + 0.1, y: 2.9, w: cw - 0.2, h: 0.42, fontSize: 12.5, bold: true, color: NAVY, align: "center", margin: 0 });
    s.addText(c.desc,  { x: cx + 0.1, y: 3.3, w: cw - 0.2, h: 1.05, fontSize: 10, color: MUTED, align: "center" });
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — Integrated Digital Solutions", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
}

// ── SLIDE 3: Client Journey ──────────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText("Client Journey", { x: 0.5, y: 0.25, w: 9, h: 0.7, fontSize: 28, bold: true, color: WHITE, align: "center", margin: 0 });
  s.addText("4 simple steps to receive a specialized legal consultation", {
    x: 0.5, y: 0.9, w: 9, h: 0.4, fontSize: 13, color: "A0AEC0", align: "center"
  });

  const steps = [
    { num: "1", icon: "👤", title: "Enter Details",    desc: "Name, phone, and email address" },
    { num: "2", icon: "🎙️", title: "Choose Type",     desc: "Audio only or audio + video" },
    { num: "3", icon: "📅", title: "Select Slot",      desc: "Pick a suitable date and time" },
    { num: "4", icon: "⚖️", title: "Consultation",    desc: "Live session with the lawyer online" },
  ];
  const sw = 1.95, sh = 2.8, sgap = 0.15, sx0 = 0.4;
  steps.forEach((st, i) => {
    let sx = sx0 + i * (sw + sgap);
    addCard(s, sx, 1.5, sw, sh, "223355");
    s.addShape(pres.shapes.OVAL, { x: sx + 0.65, y: 1.6, w: 0.65, h: 0.65, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText(st.num, { x: sx + 0.65, y: 1.6, w: 0.65, h: 0.65, fontSize: 18, bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });
    s.addText(st.icon, { x: sx + 0.6, y: 2.38, w: 0.75, h: 0.65, fontSize: 22, align: "center", valign: "middle" });
    s.addText(st.title, { x: sx + 0.1, y: 3.1, w: sw - 0.2, h: 0.42, fontSize: 12, bold: true, color: WHITE, align: "center", margin: 0 });
    s.addText(st.desc,  { x: sx + 0.1, y: 3.55, w: sw - 0.2, h: 0.65, fontSize: 10, color: "A0AEC0", align: "center" });
    if (i < 3) {
      s.addText("→", { x: sx + sw + 0.02, y: 2.6, w: 0.13, h: 0.5, fontSize: 14, color: GOLD, align: "center", valign: "middle" });
    }
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — Integrated Digital Solutions", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: "4A5568", align: "left" });
}

// ── SLIDE 4: Booking Page ────────────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: CREAM };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("Booking Page", { x: 0.5, y: 0, w: 8, h: 1.15, fontSize: 26, bold: true, color: WHITE, align: "left", valign: "middle", margin: 0 });
  s.addText("1Que", { x: 8.2, y: 0, w: 1.5, h: 1.15, fontSize: 14, bold: true, color: GOLD, align: "right", valign: "middle" });

  // Left: features
  addCard(s, 0.4, 1.3, 4.5, 4.1, WHITE);
  s.addText("Booking Form Features", { x: 0.6, y: 1.45, w: 4.1, h: 0.45, fontSize: 15, bold: true, color: NAVY, margin: 0 });
  [
    "✅  4-step guided form",
    "✅  Full name, phone & email",
    "✅  Consultation type selection",
    "✅  Available slot calendar",
    "✅  Booking confirmation summary",
    "✅  Unique booking ID generated",
    "✅  Direct link to consultation room",
  ].forEach((f, i) => {
    s.addText(f, { x: 0.7, y: 2.0 + i * 0.45, w: 4.0, h: 0.38, fontSize: 12, color: MUTED });
  });

  // Right: mock UI card
  addCard(s, 5.2, 1.3, 4.4, 4.1, NAVY);
  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.3, w: 4.4, h: 0.5, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText("📅  Book Your Legal Consultation", { x: 5.3, y: 1.3, w: 4.2, h: 0.5, fontSize: 10.5, bold: true, color: DARK, align: "left", valign: "middle", margin: 0 });

  const stepLabels = ["Your Info", "Type", "Slot", "Confirm"];
  stepLabels.forEach((lbl, i) => {
    let bx = 5.4 + i * 1.0;
    s.addShape(pres.shapes.OVAL, { x: bx, y: 2.0, w: 0.38, h: 0.38, fill: { color: i === 0 ? GOLD : "334466" }, line: { color: i === 0 ? GOLD : "445577" } });
    s.addText(String(i + 1), { x: bx, y: 2.0, w: 0.38, h: 0.38, fontSize: 9, bold: true, color: i === 0 ? DARK : "88AACC", align: "center", valign: "middle", margin: 0 });
    s.addText(lbl, { x: bx - 0.1, y: 2.42, w: 0.6, h: 0.25, fontSize: 7, color: i === 0 ? GOLD : "88AACC", align: "center" });
  });

  ["Full Name *", "Phone Number *", "Email Address *"].forEach((lbl, i) => {
    let fy = 2.85 + i * 0.62;
    s.addText(lbl, { x: 5.4, y: fy, w: 3.9, h: 0.22, fontSize: 9, color: "A0AEC0" });
    s.addShape("roundRect", { x: 5.4, y: fy + 0.23, w: 3.9, h: 0.28, fill: { color: "1E3055" }, line: { color: "2A4570" }, rectRadius: 0.05 });
  });

  addCard(s, 5.35, 4.9, 3.9, 0.38, GOLD);
  s.addText("Next →", { x: 5.35, y: 4.9, w: 3.9, h: 0.38, fontSize: 11, bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — Integrated Digital Solutions", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
}

// ── SLIDE 5: Online Consultation ─────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText("Online Consultation", { x: 0.5, y: 0.18, w: 9, h: 0.65, fontSize: 28, bold: true, color: WHITE, align: "center", margin: 0 });
  s.addText("Powered by JaaS (Jitsi as a Service) by 8x8 — enterprise-grade secure technology", {
    x: 0.5, y: 0.82, w: 9, h: 0.38, fontSize: 12.5, color: "A0AEC0", align: "center"
  });

  const cols = [
    { icon: "🎧", title: "Audio Only", color: "1E3055", items: ["No camera required", "High-quality audio", "End-to-end encrypted", "Works on all devices", "Group chat available"] },
    { icon: "🎥", title: "Audio & Video", color: "1A2B4A", items: ["HD video with lawyer", "Screen sharing", "Session recording", "Toggle camera on/off", "Full-screen support"] },
  ];
  cols.forEach((col, i) => {
    let cx = 0.5 + i * 4.8;
    addCard(s, cx, 1.35, 4.4, 4.05, col.color);
    s.addShape(pres.shapes.OVAL, { x: cx + 1.85, y: 1.5, w: 0.7, h: 0.7, fill: { color: GOLD, transparency: 75 }, line: { color: GOLD } });
    s.addText(col.icon, { x: cx + 1.82, y: 1.5, w: 0.76, h: 0.7, fontSize: 20, align: "center", valign: "middle" });
    s.addText(col.title, { x: cx + 0.2, y: 2.3, w: 4.0, h: 0.45, fontSize: 15, bold: true, color: WHITE, align: "center", margin: 0 });
    col.items.forEach((item, j) => {
      s.addText("✓  " + item, { x: cx + 0.35, y: 2.88 + j * 0.46, w: 3.7, h: 0.38, fontSize: 11.5, color: "A0C4E8" });
    });
  });

  addCard(s, 0.5, 5.5, 9, 0.33, "0A1525");
  s.addText("🔒  All sessions are end-to-end encrypted — client data is 100% confidential", {
    x: 0.6, y: 5.5, w: 8.8, h: 0.33, fontSize: 11, color: GOLD, align: "center", valign: "middle", margin: 0
  });
}

// ── SLIDE 6: Admin Dashboard ─────────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: CREAM };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("Admin Dashboard", { x: 0.5, y: 0, w: 8, h: 1.15, fontSize: 26, bold: true, color: WHITE, align: "left", valign: "middle", margin: 0 });
  s.addText("1Que", { x: 8.2, y: 0, w: 1.5, h: 1.15, fontSize: 14, bold: true, color: GOLD, align: "right", valign: "middle" });

  const stats = [
    { icon: "📅", num: "142", lbl: "Total Bookings",     bg: "EBF4FF", ic: "3B82F6" },
    { icon: "✅", num: "98",  lbl: "Confirmed",           bg: "FFFBEB", ic: "C9A84C" },
    { icon: "🎯", num: "76",  lbl: "Completed",           bg: "ECFDF5", ic: "10B981" },
    { icon: "❌", num: "12",  lbl: "Cancelled",           bg: "FEF2F2", ic: "EF4444" },
  ];
  stats.forEach((st, i) => {
    let sx = 0.4 + i * 2.3;
    addCard(s, sx, 1.28, 2.05, 0.95, WHITE);
    s.addShape(pres.shapes.OVAL, { x: sx + 0.12, y: 1.38, w: 0.56, h: 0.56, fill: { color: st.bg }, line: { color: st.bg } });
    s.addText(st.icon, { x: sx + 0.12, y: 1.38, w: 0.56, h: 0.56, fontSize: 14, align: "center", valign: "middle" });
    s.addText(st.num, { x: sx + 0.78, y: 1.36, w: 1.15, h: 0.38, fontSize: 22, bold: true, color: NAVY, align: "left", margin: 0 });
    s.addText(st.lbl, { x: sx + 0.78, y: 1.72, w: 1.15, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
  });

  const features = [
    { icon: "🔐", title: "Secure Login",       desc: "Password-protected admin access" },
    { icon: "📋", title: "Bookings Table",     desc: "Full list with search & filters" },
    { icon: "🕐", title: "Slot Management",    desc: "Add, edit, or remove available times" },
    { icon: "❌", title: "Cancel Booking",     desc: "Cancel with confirmation dialog" },
    { icon: "📊", title: "Statistics",         desc: "Real-time KPI overview cards" },
    { icon: "🔄", title: "Live Sync",          desc: "Auto-refresh from Supabase cloud DB" },
  ];
  const fw = 2.85, fh = 1.22, fgap = 0.18;
  features.forEach((f, i) => {
    let col = i % 3, row = Math.floor(i / 3);
    let fx = 0.4 + col * (fw + fgap), fy = 2.42 + row * (fh + 0.12);
    addCard(s, fx, fy, fw, fh, WHITE);
    s.addShape(pres.shapes.OVAL, { x: fx + 0.18, y: fy + 0.22, w: 0.52, h: 0.52, fill: { color: GOLD, transparency: 82 }, line: { color: GOLD } });
    s.addText(f.icon, { x: fx + 0.18, y: fy + 0.22, w: 0.52, h: 0.52, fontSize: 14, align: "center", valign: "middle" });
    s.addText(f.title, { x: fx + 0.8, y: fy + 0.2, w: fw - 0.95, h: 0.36, fontSize: 11.5, bold: true, color: NAVY, margin: 0 });
    s.addText(f.desc,  { x: fx + 0.8, y: fy + 0.55, w: fw - 0.95, h: 0.55, fontSize: 9.5, color: MUTED });
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — Integrated Digital Solutions", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
}

// ── SLIDE 7: Technologies ────────────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText("Technologies Used", { x: 0.5, y: 0.2, w: 9, h: 0.65, fontSize: 28, bold: true, color: WHITE, align: "center", margin: 0 });
  s.addText("A modern, proven tech stack built for reliability, speed, and scalability", {
    x: 0.5, y: 0.82, w: 9, h: 0.38, fontSize: 12.5, color: "A0AEC0", align: "center"
  });

  const techs = [
    { icon: "🟢", name: "Node.js",   desc: "Fast server-side JavaScript runtime" },
    { icon: "🚂", name: "Express",   desc: "Lightweight web framework for APIs" },
    { icon: "🐘", name: "Supabase",  desc: "PostgreSQL cloud database & auth" },
    { icon: "▲",  name: "Vercel",    desc: "Global serverless deployment platform" },
    { icon: "🎥", name: "JaaS 8x8",  desc: "Secure video/audio consultation engine" },
    { icon: "🌐", name: "HTML/CSS/JS", desc: "Bilingual RTL/LTR frontend interface" },
  ];
  const tw = 2.75, th = 1.62, tgap = 0.2;
  techs.forEach((t, i) => {
    let col = i % 3, row = Math.floor(i / 3);
    let tx = 0.55 + col * (tw + tgap), ty = 1.38 + row * (th + 0.2);
    addCard(s, tx, ty, tw, th, "1E3055");
    s.addShape(pres.shapes.OVAL, { x: tx + 0.18, y: ty + 0.22, w: 0.58, h: 0.58, fill: { color: GOLD, transparency: 75 }, line: { color: GOLD } });
    s.addText(t.icon, { x: tx + 0.18, y: ty + 0.22, w: 0.58, h: 0.58, fontSize: 18, align: "center", valign: "middle" });
    s.addText(t.name, { x: tx + 0.86, y: ty + 0.2, w: tw - 1.02, h: 0.4, fontSize: 14, bold: true, color: GOLD, margin: 0 });
    s.addText(t.desc,  { x: tx + 0.86, y: ty + 0.58, w: tw - 1.02, h: 0.88, fontSize: 10, color: "A0AEC0" });
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — Integrated Digital Solutions", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: "4A5568", align: "left" });
}

// ── SLIDE 8: Security & Privacy ──────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: CREAM };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("Security & Privacy", { x: 0.5, y: 0, w: 8, h: 1.15, fontSize: 26, bold: true, color: WHITE, align: "left", valign: "middle", margin: 0 });
  s.addText("1Que", { x: 8.2, y: 0, w: 1.5, h: 1.15, fontSize: 14, bold: true, color: GOLD, align: "right", valign: "middle" });

  const sec = [
    { icon: "🔐", title: "RS256 JWT Tokens",   desc: "Cryptographically signed tokens for every session" },
    { icon: "🔒", title: "E2E Encryption",      desc: "All video/audio sessions fully encrypted" },
    { icon: "🌍", title: "HTTPS / SSL",         desc: "Vercel enforces HTTPS on all endpoints" },
    { icon: "🔑", title: "Admin Auth",          desc: "Password-protected dashboard with token header" },
    { icon: "☁️", title: "Supabase RLS",        desc: "Row-level security rules on the database" },
    { icon: "🕶️", title: "No Data Sharing",    desc: "Client data is never sold or shared with third parties" },
  ];
  const cols = [sec.slice(0, 3), sec.slice(3)];
  cols.forEach((col, ci) => {
    col.forEach((item, ri) => {
      let fx = 0.4 + ci * 4.8, fy = 1.32 + ri * 1.42;
      addCard(s, fx, fy, 4.4, 1.25, WHITE);
      s.addShape(pres.shapes.OVAL, { x: fx + 0.18, y: fy + 0.3, w: 0.55, h: 0.55, fill: { color: GOLD, transparency: 82 }, line: { color: GOLD } });
      s.addText(item.icon, { x: fx + 0.18, y: fy + 0.3, w: 0.55, h: 0.55, fontSize: 15, align: "center", valign: "middle" });
      s.addText(item.title, { x: fx + 0.85, y: fy + 0.18, w: 3.38, h: 0.38, fontSize: 13, bold: true, color: NAVY, margin: 0 });
      s.addText(item.desc,  { x: fx + 0.85, y: fy + 0.56, w: 3.38, h: 0.55, fontSize: 10.5, color: MUTED });
    });
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — Integrated Digital Solutions", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
}

// ── SLIDE 9: Closing ─────────────────────────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: DARK };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });
  s.addShape(pres.shapes.OVAL, { x: -1.2, y: 2.5, w: 4, h: 4, fill: { color: GOLD, transparency: 90 }, line: { color: GOLD, transparency: 80 } });
  s.addShape(pres.shapes.OVAL, { x: 7.8, y: -0.5, w: 3.5, h: 3.5, fill: { color: GOLD, transparency: 92 }, line: { color: GOLD, transparency: 85 } });

  s.addShape("roundRect", { x: 0.45, y: 0.3, w: 1.4, h: 0.48, fill: { color: GOLD }, line: { color: GOLD }, rectRadius: 0.1 });
  s.addText("1Que", { x: 0.45, y: 0.3, w: 1.4, h: 0.48, fontSize: 16, bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });

  s.addText("⚖", { x: 4.2, y: 0.7, w: 1.6, h: 1.6, fontSize: 36, align: "center", valign: "middle", color: GOLD });

  s.addText("Ready to Transform", { x: 0.5, y: 2.45, w: 9, h: 0.8, fontSize: 36, bold: true, color: WHITE, align: "center", margin: 0 });
  s.addText("Your Legal Practice?", { x: 0.5, y: 3.18, w: 9, h: 0.8, fontSize: 36, bold: true, color: GOLD, align: "center", margin: 0 });

  s.addText("Get started today — live demo available at:", { x: 0.5, y: 4.08, w: 9, h: 0.4, fontSize: 13, color: "A0AEC0", align: "center" });

  addCard(s, 2.5, 4.55, 5, 0.55, "FFFFFF");
  s.addText("🌐  https://lawyer-tau-dun.vercel.app", { x: 2.5, y: 4.55, w: 5, h: 0.55, fontSize: 12, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });

  s.addText("Developed & designed by 1Que  |  2026", {
    x: 0.5, y: 5.2, w: 9, h: 0.35, fontSize: 11, color: "4A5568", align: "center"
  });
}

// ── Save ─────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: OUT })
  .then(() => console.log("✅ Created:", OUT))
  .catch(e => { console.error("❌ Error:", e); process.exit(1); });

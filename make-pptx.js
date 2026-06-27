const SKILL = "C:/Users/karim/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/c77e70b1-8ee6-4d82-99e1-b4810e81f48a/670a369d-abe1-42c4-96fc-3e0b5a15576f/skills/pptx/node_modules/pptxgenjs";
const pptxgen = require(SKILL);

const OUT = "C:/Users/karim/Desktop/Ahmed/lawyer/1Que-LegalSystem.pptx";

// ── Palette ──────────────────────────────────────────────────
const NAVY   = "1A2B4A";
const DARK   = "0D1B2F";
const GOLD   = "C9A84C";
const GOLD2  = "A6862A";
const WHITE  = "FFFFFF";
const CREAM  = "F8F6F1";
const MUTED  = "6B7280";
const LIGHT  = "F1F4F9";

const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.12 });

// ── Helpers ──────────────────────────────────────────────────
function addRoundedCard(slide, x, y, w, h, fillColor, shadow) {
  slide.addShape("roundRect", {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: fillColor },
    rectRadius: 0.12,
    shadow: shadow || makeShadow()
  });
}

function rtl(text, opts) {
  return { text, options: { ...opts, rtlMode: true } };
}

// ─────────────────────────────────────────────────────────────
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title  = "نظام الاستشارات القانونية الأونلاين - 1Que";
pres.author = "1Que";

// ══════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: DARK };

  // Gold top bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });

  // Left decorative circle
  s.addShape(pres.shapes.OVAL, { x: -1.2, y: 2.5, w: 4, h: 4, fill: { color: GOLD, transparency: 90 }, line: { color: GOLD, transparency: 80 } });
  s.addShape(pres.shapes.OVAL, { x: -0.6, y: 3.1, w: 2.8, h: 2.8, fill: { color: GOLD, transparency: 85 }, line: { color: GOLD, transparency: 75 } });

  // Right decorative circle
  s.addShape(pres.shapes.OVAL, { x: 7.8, y: -0.5, w: 3.5, h: 3.5, fill: { color: GOLD, transparency: 92 }, line: { color: GOLD, transparency: 85 } });

  // 1Que badge top left
  s.addShape("roundRect", { x: 0.45, y: 0.3, w: 1.4, h: 0.48, fill: { color: GOLD }, line: { color: GOLD }, rectRadius: 0.1 });
  s.addText("1Que", { x: 0.45, y: 0.3, w: 1.4, h: 0.48, fontSize: 16, bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });

  // Scales icon (circles + text as visual)
  s.addShape(pres.shapes.OVAL, { x: 4.2, y: 0.7, w: 1.6, h: 1.6, fill: { color: GOLD, transparency: 80 }, line: { color: GOLD } });
  s.addText("⚖", { x: 4.2, y: 0.7, w: 1.6, h: 1.6, fontSize: 36, align: "center", valign: "middle", color: GOLD });

  // Main title
  s.addText("نظام الاستشارات القانونية", {
    x: 0.5, y: 2.55, w: 9, h: 0.9,
    fontSize: 38, bold: true, color: WHITE, align: "center", rtlMode: true, margin: 0
  });
  s.addText("الأونلاين المتكامل", {
    x: 0.5, y: 3.38, w: 9, h: 0.8,
    fontSize: 38, bold: true, color: GOLD, align: "center", rtlMode: true, margin: 0
  });

  // Subtitle
  s.addText("حل رقمي متكامل لتقديم الاستشارات القانونية عبر الإنترنت", {
    x: 0.5, y: 4.25, w: 9, h: 0.5,
    fontSize: 15, color: "A0AEC0", align: "center", rtlMode: true, margin: 0
  });

  // Bottom divider line
  s.addShape(pres.shapes.LINE, { x: 3.5, y: 4.85, w: 3, h: 0, line: { color: GOLD, width: 1.5 } });

  // Bottom tag
  s.addText("تطوير وتصميم: 1Que  |  2026", {
    x: 0.5, y: 5.1, w: 9, h: 0.35,
    fontSize: 11, color: "4A5568", align: "center", rtlMode: true
  });

  s.addNotes("شريحة التقديم - ابدأ بتعريف سريع عن 1Que والهدف من النظام");
}

// ══════════════════════════════════════════════════════════════
// SLIDE 2 — نظرة عامة على النظام
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: CREAM };

  // Header band
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("نظرة عامة على النظام", { x: 0.5, y: 0, w: 8, h: 1.15, fontSize: 26, bold: true, color: WHITE, align: "right", valign: "middle", rtlMode: true, margin: 0 });
  s.addText("1Que", { x: 0.3, y: 0, w: 1.5, h: 1.15, fontSize: 14, bold: true, color: GOLD, align: "left", valign: "middle" });

  // Intro text
  s.addText("منصة متكاملة تتيح لمكاتب المحاماة تقديم استشارات قانونية احترافية عبر الإنترنت بكل سهولة واحترافية", {
    x: 0.5, y: 1.3, w: 9, h: 0.55,
    fontSize: 13.5, color: MUTED, align: "center", rtlMode: true
  });

  // 4 feature cards
  const cards = [
    { icon: "📅", title: "حجز المواعيد", desc: "نظام حجز ذكي يتيح للعملاء اختيار المواعيد المتاحة بسهولة" },
    { icon: "🎥", title: "استشارات أونلاين", desc: "مكالمات صوت وصورة عالية الجودة عبر تقنية JaaS المتطورة" },
    { icon: "📊", title: "لوحة تحكم", desc: "إدارة شاملة للحجوزات والمواعيد والعملاء من مكان واحد" },
    { icon: "☁️", title: "تخزين سحابي", desc: "قاعدة بيانات Supabase آمنة وموثوقة لحفظ جميع البيانات" },
  ];
  const cw = 2.1, ch = 2.4, gap = 0.2, startX = 0.45;
  cards.forEach((c, i) => {
    let cx = startX + i * (cw + gap);
    addRoundedCard(s, cx, 2.05, cw, ch, WHITE);
    // Icon circle
    s.addShape(pres.shapes.OVAL, { x: cx + 0.75, y: 2.2, w: 0.6, h: 0.6, fill: { color: GOLD, transparency: 80 }, line: { color: GOLD } });
    s.addText(c.icon, { x: cx + 0.72, y: 2.2, w: 0.66, h: 0.6, fontSize: 18, align: "center", valign: "middle" });
    s.addText(c.title, { x: cx + 0.1, y: 2.9, w: cw - 0.2, h: 0.42, fontSize: 13, bold: true, color: NAVY, align: "center", rtlMode: true, margin: 0 });
    s.addText(c.desc, { x: cx + 0.1, y: 3.3, w: cw - 0.2, h: 1.05, fontSize: 10.5, color: MUTED, align: "center", rtlMode: true });
  });

  // Bottom gold line
  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — حلول رقمية متكاملة", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 3 — رحلة العميل
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });

  s.addText("رحلة العميل", { x: 0.5, y: 0.25, w: 9, h: 0.7, fontSize: 28, bold: true, color: WHITE, align: "center", rtlMode: true, margin: 0 });
  s.addText("4 خطوات بسيطة للحصول على استشارة قانونية متخصصة", {
    x: 0.5, y: 0.9, w: 9, h: 0.4, fontSize: 13, color: "A0AEC0", align: "center", rtlMode: true
  });

  const steps = [
    { num: "١", icon: "👤", title: "إدخال البيانات", desc: "الاسم، الهاتف، البريد الإلكتروني" },
    { num: "٢", icon: "🎙️", title: "نوع الاستشارة", desc: "صوت فقط أو صوت وصورة" },
    { num: "٣", icon: "📅", title: "اختيار الموعد", desc: "اختيار التاريخ والوقت المناسب" },
    { num: "٤", icon: "⚖️", title: "الاستشارة", desc: "جلسة مباشرة مع المحامي أونلاين" },
  ];

  const sw = 1.95, sh = 2.8, sgap = 0.15, sx0 = 0.4;
  steps.forEach((st, i) => {
    let sx = sx0 + i * (sw + sgap);

    // Card background
    addRoundedCard(s, sx, 1.5, sw, sh, "FFFFFF0D");

    // Number badge
    s.addShape(pres.shapes.OVAL, { x: sx + 0.65, y: 1.6, w: 0.65, h: 0.65, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText(st.num, { x: sx + 0.65, y: 1.6, w: 0.65, h: 0.65, fontSize: 18, bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });

    // Icon
    s.addText(st.icon, { x: sx + 0.55, y: 2.38, w: 0.85, h: 0.65, fontSize: 24, align: "center", valign: "middle" });

    // Title
    s.addText(st.title, { x: sx + 0.08, y: 3.1, w: sw - 0.16, h: 0.45, fontSize: 13, bold: true, color: WHITE, align: "center", rtlMode: true, margin: 0 });

    // Desc
    s.addText(st.desc, { x: sx + 0.08, y: 3.55, w: sw - 0.16, h: 0.6, fontSize: 10.5, color: "8899BB", align: "center", rtlMode: true });

    // Arrow between steps
    if (i < 3) {
      s.addShape(pres.shapes.LINE, { x: sx + sw + 0.02, y: 2.9, w: sgap + 0.11, h: 0, line: { color: GOLD, width: 1.5 } });
      s.addText("←", { x: sx + sw - 0.02, y: 2.73, w: 0.35, h: 0.35, fontSize: 14, color: GOLD, align: "center" });
    }
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — حلول رقمية متكاملة", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: "4A5568", align: "left" });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 4 — صفحة الحجز
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: CREAM };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("صفحة الحجز الذكي", { x: 0.5, y: 0, w: 8, h: 1.15, fontSize: 26, bold: true, color: WHITE, align: "right", valign: "middle", rtlMode: true, margin: 0 });
  s.addText("1Que", { x: 0.3, y: 0, w: 1.5, h: 1.15, fontSize: 14, bold: true, color: GOLD, align: "left", valign: "middle" });

  // Left: feature list
  const feats = [
    { icon: "✅", text: "نموذج حجز بـ 4 خطوات واضحة وسهلة" },
    { icon: "📱", text: "تحقق فوري من صحة البيانات المدخلة" },
    { icon: "🗓️", text: "عرض المواعيد المتاحة فقط في الوقت الفعلي" },
    { icon: "🎧", text: "اختيار نوع الجلسة: صوت فقط أو مع الفيديو" },
    { icon: "🔒", text: "تأكيد الحجز مع رقم مرجعي فريد للعميل" },
    { icon: "🌐", text: "واجهة عربية RTL احترافية وسريعة الاستجابة" },
  ];
  feats.forEach((f, i) => {
    let fy = 1.35 + i * 0.67;
    s.addShape(pres.shapes.OVAL, { x: 7.7, y: fy + 0.05, w: 0.38, h: 0.38, fill: { color: GOLD, transparency: 70 }, line: { color: GOLD } });
    s.addText(f.icon, { x: 7.65, y: fy + 0.04, w: 0.46, h: 0.4, fontSize: 13, align: "center", valign: "middle" });
    s.addText(f.text, { x: 0.5, y: fy, w: 7.0, h: 0.5, fontSize: 13, color: "2D3748", align: "right", rtlMode: true, valign: "middle" });
  });

  // Right: mock booking card
  addRoundedCard(s, 0.35, 1.3, 3.5, 4.0, WHITE);
  // Steps bar mock
  s.addShape("roundRect", { x: 0.42, y: 1.38, w: 3.36, h: 0.5, fill: { color: NAVY }, line: { color: NAVY }, rectRadius: 0.08 });
  ["١", "٢", "٣", "٤"].forEach((n, i) => {
    s.addShape(pres.shapes.OVAL, { x: 0.58 + i * 0.78, y: 1.46, w: 0.34, h: 0.34, fill: { color: i === 0 ? GOLD : "3A4A6A" }, line: { color: i === 0 ? GOLD : "3A4A6A" } });
    s.addText(n, { x: 0.58 + i * 0.78, y: 1.46, w: 0.34, h: 0.34, fontSize: 10, bold: true, color: i === 0 ? DARK : WHITE, align: "center", valign: "middle", margin: 0 });
  });
  // Mock fields
  [{ label: "الاسم الكامل", y: 2.05 }, { label: "رقم الهاتف", y: 2.65 }, { label: "البريد الإلكتروني", y: 3.25 }].forEach(f => {
    s.addText(f.label, { x: 0.55, y: f.y, w: 3.1, h: 0.24, fontSize: 9.5, bold: true, color: NAVY, rtlMode: true, align: "right" });
    s.addShape("roundRect", { x: 0.55, y: f.y + 0.25, w: 3.1, h: 0.32, fill: { color: "F5F5F5" }, line: { color: "E2E8F0", width: 1 }, rectRadius: 0.05 });
  });
  // Next button mock
  s.addShape("roundRect", { x: 0.55, y: 4.6, w: 3.1, h: 0.44, fill: { color: GOLD }, line: { color: GOLD }, rectRadius: 0.08 });
  s.addText("التالي ←", { x: 0.55, y: 4.6, w: 3.1, h: 0.44, fontSize: 12, bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — حلول رقمية متكاملة", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 5 — الاستشارة الأونلاين
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: DARK };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });

  s.addText("الاستشارة الأونلاين", { x: 0.5, y: 0.22, w: 9, h: 0.7, fontSize: 28, bold: true, color: WHITE, align: "center", rtlMode: true, margin: 0 });
  s.addText("تقنية JaaS (Jitsi as a Service) من 8x8 لمكالمات احترافية آمنة", {
    x: 0.5, y: 0.88, w: 9, h: 0.38, fontSize: 12.5, color: "8899BB", align: "center", rtlMode: true
  });

  // Two columns
  // Left column: Audio only
  addRoundedCard(s, 0.4, 1.45, 4.35, 3.75, "FFFFFF08");
  s.addShape(pres.shapes.OVAL, { x: 2.1, y: 1.65, w: 0.9, h: 0.9, fill: { color: GOLD, transparency: 75 }, line: { color: GOLD } });
  s.addText("🎧", { x: 2.1, y: 1.65, w: 0.9, h: 0.9, fontSize: 26, align: "center", valign: "middle" });
  s.addText("استشارة صوتية", { x: 0.5, y: 2.65, w: 4.15, h: 0.48, fontSize: 16, bold: true, color: WHITE, align: "center", rtlMode: true, margin: 0 });
  const audioFeats = ["جودة صوت عالية وواضحة", "دون الحاجة للكاميرا", "اتصال مشفر بالكامل", "مناسبة لجميع الأجهزة"];
  audioFeats.forEach((f, i) => {
    s.addText("✓  " + f, { x: 0.55, y: 3.22 + i * 0.42, w: 4.1, h: 0.38, fontSize: 12, color: "8899BB", align: "right", rtlMode: true });
  });

  // Right column: Video
  addRoundedCard(s, 5.25, 1.45, 4.35, 3.75, "FFFFFF08");
  s.addShape(pres.shapes.OVAL, { x: 6.95, y: 1.65, w: 0.9, h: 0.9, fill: { color: GOLD, transparency: 75 }, line: { color: GOLD } });
  s.addText("📹", { x: 6.95, y: 1.65, w: 0.9, h: 0.9, fontSize: 26, align: "center", valign: "middle" });
  s.addText("استشارة بالفيديو", { x: 5.3, y: 2.65, w: 4.2, h: 0.48, fontSize: 16, bold: true, color: WHITE, align: "center", rtlMode: true, margin: 0 });
  const videoFeats = ["وجهاً لوجه مع المحامي", "تجربة أكثر تفاعلاً", "تسجيل الجلسة عند الطلب", "غرفة اجتماعات خاصة"];
  videoFeats.forEach((f, i) => {
    s.addText("✓  " + f, { x: 5.35, y: 3.22 + i * 0.42, w: 4.1, h: 0.38, fontSize: 12, color: "8899BB", align: "right", rtlMode: true });
  });

  // VS divider
  s.addShape(pres.shapes.OVAL, { x: 4.6, y: 2.8, w: 0.5, h: 0.5, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText("أو", { x: 4.6, y: 2.8, w: 0.5, h: 0.5, fontSize: 11, bold: true, color: DARK, align: "center", valign: "middle", margin: 0, rtlMode: true });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — حلول رقمية متكاملة", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: "4A5568", align: "left" });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 6 — لوحة تحكم المدير
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: CREAM };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("لوحة تحكم المدير", { x: 0.5, y: 0, w: 8, h: 1.15, fontSize: 26, bold: true, color: WHITE, align: "right", valign: "middle", rtlMode: true, margin: 0 });
  s.addText("1Que", { x: 0.3, y: 0, w: 1.5, h: 1.15, fontSize: 14, bold: true, color: GOLD, align: "left", valign: "middle" });

  // 4 stat cards
  const stats = [
    { num: "إجمالي الحجوزات", val: "📅", bg: "EBF5FB" },
    { num: "حجوزات مؤكدة", val: "✅", bg: "EAFAF1" },
    { num: "استشارات مكتملة", bg: "F9EBEA", val: "🎯" },
    { num: "مواعيد متاحة", bg: "FEF9E7", val: "🕐" },
  ];
  stats.forEach((st, i) => {
    let sx = 0.38 + i * 2.32;
    addRoundedCard(s, sx, 1.28, 2.1, 0.98, WHITE);
    s.addText(st.val, { x: sx + 0.08, y: 1.35, w: 0.6, h: 0.84, fontSize: 22, align: "center", valign: "middle" });
    s.addText(st.num, { x: sx + 0.65, y: 1.35, w: 1.35, h: 0.84, fontSize: 10, color: NAVY, align: "right", rtlMode: true, valign: "middle", bold: true });
  });

  // Features list (right side)
  s.addText("المميزات الرئيسية", { x: 0.5, y: 2.45, w: 9, h: 0.4, fontSize: 14, bold: true, color: NAVY, align: "right", rtlMode: true });
  const adminFeats = [
    { icon: "🔐", text: "تسجيل دخول آمن بكلمة مرور" },
    { icon: "📋", text: "عرض جميع الحجوزات مع التفاصيل الكاملة" },
    { icon: "🎥", text: "بدء جلسة الاستشارة كمشرف (Moderator)" },
    { icon: "✅", text: "تحديث حالة الحجز: مؤكد / مكتمل / ملغي" },
    { icon: "🗓️", text: "إضافة وإدارة المواعيد المتاحة بسهولة" },
    { icon: "🔍", text: "تصفية الحجوزات حسب الحالة والتاريخ" },
  ];
  const col1 = adminFeats.slice(0, 3), col2 = adminFeats.slice(3);
  col1.forEach((f, i) => {
    let fy = 3.0 + i * 0.72;
    addRoundedCard(s, 5.0, fy, 4.55, 0.6, WHITE);
    s.addShape(pres.shapes.OVAL, { x: 5.08, y: fy + 0.1, w: 0.4, h: 0.4, fill: { color: GOLD, transparency: 70 }, line: { color: GOLD } });
    s.addText(f.icon, { x: 5.06, y: fy + 0.09, w: 0.44, h: 0.42, fontSize: 12, align: "center", valign: "middle" });
    s.addText(f.text, { x: 5.55, y: fy + 0.1, w: 3.9, h: 0.4, fontSize: 11.5, color: "2D3748", align: "right", rtlMode: true, valign: "middle" });
  });
  col2.forEach((f, i) => {
    let fy = 3.0 + i * 0.72;
    addRoundedCard(s, 0.35, fy, 4.55, 0.6, WHITE);
    s.addShape(pres.shapes.OVAL, { x: 0.43, y: fy + 0.1, w: 0.4, h: 0.4, fill: { color: GOLD, transparency: 70 }, line: { color: GOLD } });
    s.addText(f.icon, { x: 0.41, y: fy + 0.09, w: 0.44, h: 0.42, fontSize: 12, align: "center", valign: "middle" });
    s.addText(f.text, { x: 0.9, y: fy + 0.1, w: 3.9, h: 0.4, fontSize: 11.5, color: "2D3748", align: "right", rtlMode: true, valign: "middle" });
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — حلول رقمية متكاملة", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 7 — التقنيات المستخدمة
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText("التقنيات المستخدمة", { x: 0.5, y: 0.22, w: 9, h: 0.7, fontSize: 28, bold: true, color: WHITE, align: "center", rtlMode: true, margin: 0 });

  const techs = [
    { icon: "🟢", name: "Node.js", role: "الخادم الخلفي", color: "2ECC71" },
    { icon: "⚡", name: "Express.js", role: "إطار العمل", color: "F1C40F" },
    { icon: "🔷", name: "Supabase", role: "قاعدة البيانات", color: "3498DB" },
    { icon: "▲", name: "Vercel", role: "الاستضافة السحابية", color: "FFFFFF" },
    { icon: "🎥", name: "JaaS / 8x8", role: "مكالمات الفيديو", color: "E74C3C" },
    { icon: "🌐", name: "HTML / CSS / JS", role: "الواجهة الأمامية", color: "F39C12" },
  ];

  const tw = 2.8, th = 1.55, tgap = 0.2, tx0 = 0.5;
  techs.forEach((t, i) => {
    let row = Math.floor(i / 3), col = i % 3;
    let tx = tx0 + col * (tw + tgap);
    let ty = 1.25 + row * (th + tgap);
    addRoundedCard(s, tx, ty, tw, th, "FFFFFF08");
    // Icon circle
    s.addShape(pres.shapes.OVAL, { x: tx + tw/2 - 0.33, y: ty + 0.18, w: 0.66, h: 0.66, fill: { color: GOLD, transparency: 78 }, line: { color: GOLD } });
    s.addText(t.icon, { x: tx + tw/2 - 0.36, y: ty + 0.18, w: 0.72, h: 0.66, fontSize: 20, align: "center", valign: "middle" });
    s.addText(t.name, { x: tx + 0.1, y: ty + 0.9, w: tw - 0.2, h: 0.36, fontSize: 13.5, bold: true, color: WHITE, align: "center", margin: 0 });
    s.addText(t.role, { x: tx + 0.1, y: ty + 1.22, w: tw - 0.2, h: 0.28, fontSize: 10.5, color: "6B82A8", align: "center", rtlMode: true });
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — حلول رقمية متكاملة", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: "4A5568", align: "left" });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 8 — الأمان والخصوصية
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: CREAM };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.15, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("الأمان والخصوصية", { x: 0.5, y: 0, w: 8, h: 1.15, fontSize: 26, bold: true, color: WHITE, align: "right", valign: "middle", rtlMode: true, margin: 0 });
  s.addText("1Que", { x: 0.3, y: 0, w: 1.5, h: 1.15, fontSize: 14, bold: true, color: GOLD, align: "left", valign: "middle" });

  // Center shield icon
  s.addShape(pres.shapes.OVAL, { x: 4.25, y: 1.3, w: 1.5, h: 1.5, fill: { color: NAVY }, line: { color: GOLD, width: 2 } });
  s.addText("🔒", { x: 4.25, y: 1.3, w: 1.5, h: 1.5, fontSize: 38, align: "center", valign: "middle" });

  const secFeats = [
    { icon: "🔐", title: "تشفير JWT", desc: "توليد رموز JWT مشفرة بمفتاح RSA-256 لكل جلسة" },
    { icon: "🛡️", title: "HTTPS كامل", desc: "اتصال مشفر من طرف إلى طرف في جميع الطلبات" },
    { icon: "☁️", title: "Supabase RLS", desc: "سياسات أمان على مستوى الصفوف في قاعدة البيانات" },
    { icon: "🔑", title: "Service Key آمن", desc: "مفاتيح API مخفية في متغيرات البيئة على Vercel" },
    { icon: "🎯", title: "غرف خاصة", desc: "كل استشارة في غرفة فريدة ومعزولة تماماً" },
    { icon: "👁️", title: "صلاحيات محددة", desc: "العميل مستمع والمحامي مشرف بصلاحيات كاملة" },
  ];

  const col1 = secFeats.slice(0, 3), col2 = secFeats.slice(3);
  col1.forEach((f, i) => {
    let fy = 1.32 + i * 1.38;
    addRoundedCard(s, 5.3, fy, 4.3, 1.22, WHITE);
    s.addShape(pres.shapes.OVAL, { x: 5.38, y: fy + 0.28, w: 0.56, h: 0.56, fill: { color: GOLD, transparency: 75 }, line: { color: GOLD } });
    s.addText(f.icon, { x: 5.36, y: fy + 0.27, w: 0.6, h: 0.58, fontSize: 16, align: "center", valign: "middle" });
    s.addText(f.title, { x: 5.98, y: fy + 0.2, w: 3.5, h: 0.38, fontSize: 12.5, bold: true, color: NAVY, align: "right", rtlMode: true, margin: 0 });
    s.addText(f.desc, { x: 5.98, y: fy + 0.56, w: 3.5, h: 0.52, fontSize: 10.5, color: MUTED, align: "right", rtlMode: true });
  });
  col2.forEach((f, i) => {
    let fy = 1.32 + i * 1.38;
    addRoundedCard(s, 0.4, fy, 4.3, 1.22, WHITE);
    s.addShape(pres.shapes.OVAL, { x: 0.48, y: fy + 0.28, w: 0.56, h: 0.56, fill: { color: GOLD, transparency: 75 }, line: { color: GOLD } });
    s.addText(f.icon, { x: 0.46, y: fy + 0.27, w: 0.6, h: 0.58, fontSize: 16, align: "center", valign: "middle" });
    s.addText(f.title, { x: 1.1, y: fy + 0.2, w: 3.5, h: 0.38, fontSize: 12.5, bold: true, color: NAVY, align: "right", rtlMode: true, margin: 0 });
    s.addText(f.desc, { x: 1.1, y: fy + 0.56, w: 3.5, h: 0.52, fontSize: 10.5, color: MUTED, align: "right", rtlMode: true });
  });

  s.addShape(pres.shapes.LINE, { x: 0, y: 5.55, w: 10, h: 0, line: { color: GOLD, width: 2 } });
  s.addText("1Que — حلول رقمية متكاملة", { x: 0.4, y: 5.58, w: 9.2, h: 0.3, fontSize: 9, color: MUTED, align: "left" });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 9 — Closing / 1Que
// ══════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: DARK };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.555, w: 10, h: 0.07, fill: { color: GOLD }, line: { color: GOLD } });

  // Deco
  s.addShape(pres.shapes.OVAL, { x: 7.5, y: 2.5, w: 4, h: 4, fill: { color: GOLD, transparency: 93 }, line: { color: GOLD, transparency: 88 } });
  s.addShape(pres.shapes.OVAL, { x: -1.5, y: -0.5, w: 3.5, h: 3.5, fill: { color: GOLD, transparency: 93 }, line: { color: GOLD, transparency: 88 } });

  // 1Que big badge
  s.addShape("roundRect", { x: 3.8, y: 0.4, w: 2.4, h: 0.75, fill: { color: GOLD }, line: { color: GOLD }, rectRadius: 0.12 });
  s.addText("1Que", { x: 3.8, y: 0.4, w: 2.4, h: 0.75, fontSize: 26, bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });
  s.addText("حلول رقمية متكاملة", { x: 3.5, y: 1.18, w: 3, h: 0.38, fontSize: 12, color: "6B82A8", align: "center", rtlMode: true });

  // Main closing text
  s.addText("هل أنت مستعد لرقمنة", { x: 0.5, y: 1.75, w: 9, h: 0.72, fontSize: 32, bold: true, color: WHITE, align: "center", rtlMode: true, margin: 0 });
  s.addText("مكتبك القانوني؟", { x: 0.5, y: 2.42, w: 9, h: 0.72, fontSize: 32, bold: true, color: GOLD, align: "center", rtlMode: true, margin: 0 });

  // Website URL card
  addRoundedCard(s, 2.0, 3.3, 6.0, 0.7, "FFFFFF0A");
  s.addShape("roundRect", { x: 2.0, y: 3.3, w: 6.0, h: 0.7, fill: { color: "FFFFFF", transparency: 94 }, line: { color: GOLD, width: 1 }, rectRadius: 0.12 });
  s.addText("🌐  https://lawyer-tau-dun.vercel.app", { x: 2.1, y: 3.35, w: 5.8, h: 0.6, fontSize: 13, color: GOLD, align: "center", valign: "middle", bold: true });

  // Contact row
  s.addText("📧 info@1que.com     |     📞 للاستفسار والتواصل مع فريق 1Que", {
    x: 0.5, y: 4.18, w: 9, h: 0.4, fontSize: 11.5, color: "6B82A8", align: "center", rtlMode: true
  });

  // Bottom features
  const closes = ["✅ نظام جاهز للاستخدام", "☁️ استضافة سحابية مجانية", "📱 يعمل على جميع الأجهزة"];
  closes.forEach((c, i) => {
    s.addText(c, { x: 0.8 + i * 3.0, y: 4.78, w: 2.8, h: 0.42, fontSize: 12, color: "8899BB", align: "center", rtlMode: true });
  });
}

// ── Write ─────────────────────────────────────────────────────
pres.writeFile({ fileName: OUT }).then(() => {
  console.log("✅ تم إنشاء الملف:", OUT);
}).catch(e => console.error("❌ خطأ:", e));

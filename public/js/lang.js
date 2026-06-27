// Language switcher — Arabic (RTL) ↔ English (LTR)
(function () {
  function applyLang(lang) {
    var isAr = lang !== 'en';
    var html = document.documentElement;
    html.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    html.setAttribute('lang', isAr ? 'ar' : 'en');
    localStorage.setItem('lang', lang);

    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.ar) el.dataset.ar = el.innerHTML;
      el.innerHTML = isAr ? el.dataset.ar : el.dataset.en;
    });

    // placeholder attributes
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      if (!el.dataset.arPlaceholder) el.dataset.arPlaceholder = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', isAr ? el.dataset.arPlaceholder : el.dataset.enPlaceholder);
    });

    var btn = document.getElementById('langToggle');
    if (btn) btn.innerHTML = isAr ? '🌐 English' : '🌐 العربية';
  }

  window.toggleLang = function () {
    applyLang(localStorage.getItem('lang') === 'en' ? 'ar' : 'en');
  };

  var saved = localStorage.getItem('lang') || 'ar';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyLang(saved); });
  } else {
    applyLang(saved);
  }
})();

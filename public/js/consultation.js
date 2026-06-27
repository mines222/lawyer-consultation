const params = new URLSearchParams(window.location.search);
const appointmentId = params.get('id');
const clientName = params.get('name') || 'العميل';

async function init() {
  if (!appointmentId) return showError('لم يتم تحديد رقم الحجز. يرجى العودة وإعادة المحاولة.');

  document.getElementById('waitingMsg').textContent = 'جارٍ التحقق من بيانات حجزك...';
  document.getElementById('waitingInfo').textContent = `رقم الحجز: ${appointmentId}`;

  try {
    const res = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, name: clientName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر الحصول على رمز الدخول');

    document.getElementById('statusText').textContent = 'متصل';
    startMeeting(data.appId, data.roomName, data.token, data.type);
  } catch (e) {
    showError(e.message);
  }
}

function startMeeting(appId, roomName, token, type) {
  document.getElementById('waitingRoom').classList.add('hidden');
  const container = document.getElementById('jaasContainer');
  container.classList.remove('hidden');

  const domain = '8x8.vc';
  const fullRoom = `${appId}/${roomName}`;

  const config = {
    startWithAudioMuted: false,
    startWithVideoMuted: type !== 'video',
    disableVideoBackground: true,
    prejoinPageEnabled: false,
    enableClosePage: false,
    toolbarButtons: type === 'video'
      ? ['microphone','camera','hangup','chat','tileview','fullscreen']
      : ['microphone','hangup','chat'],
    hideConferenceSubject: true,
  };

  const interfaceConfig = {
    SHOW_JITSI_WATERMARK: false,
    SHOW_BRAND_WATERMARK: false,
    TOOLBAR_ALWAYS_VISIBLE: true,
    DEFAULT_REMOTE_DISPLAY_NAME: 'المشارك',
    APP_NAME: 'مكتب الاستشارات القانونية',
  };

  const api = new JitsiMeetExternalAPI(domain, {
    roomName: fullRoom,
    jwt: token,
    parentNode: container,
    width: '100%',
    height: '100%',
    configOverwrite: config,
    interfaceConfigOverwrite: interfaceConfig,
    userInfo: { displayName: clientName }
  });

  api.addEventListener('videoConferenceJoined', () => {
    document.getElementById('statusText').textContent = 'جارٍ الاستشارة';
    if (type !== 'video') {
      api.executeCommand('toggleVideo');
    }
  });

  api.addEventListener('readyToClose', () => {
    container.classList.add('hidden');
    document.getElementById('waitingRoom').classList.remove('hidden');
    document.getElementById('waitingRoom').innerHTML = `
      <div style="font-size:64px">✅</div>
      <h2 style="color:white">انتهت الاستشارة</h2>
      <p>شكراً لاستخدامك خدمات مكتب الاستشارات القانونية</p>
      <a href="/" class="btn-primary" style="margin-top:16px">العودة للرئيسية</a>
    `;
  });
}

function showError(msg) {
  document.getElementById('waitingRoom').classList.add('hidden');
  document.getElementById('errorScreen').classList.remove('hidden');
  document.getElementById('errorMsg').textContent = msg;
}

// Load JaaS SDK then init
const script = document.createElement('script');
script.src = 'https://8x8.vc/vpaas-magic-cookie-e20359dbbbbf4b4682a312800d35ba98/external_api.js';
script.onload = init;
script.onerror = () => showError('تعذر تحميل مكتبة الاجتماعات. تحقق من اتصالك بالإنترنت.');
document.head.appendChild(script);

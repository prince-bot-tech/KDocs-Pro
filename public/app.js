// ---------- Field definitions per document type ----------
// These match the field names read by utils/pdfGenerator.js on the server.
const FIELD_SETS = {
  cv: [
    ['fullName', 'Full name', 'text'], ['email', 'Email', 'text'], ['phone', 'Phone', 'text'],
    ['address', 'Address / City', 'text'],
    ['summary', 'Professional summary', 'textarea'],
    ['experience', 'Work experience', 'textarea'],
    ['education', 'Education', 'textarea'],
    ['skills', 'Skills', 'textarea'],
    ['achievements', 'Achievements (optional)', 'textarea'],
    ['referees', 'Referees (optional)', 'textarea'],
  ],
  cover_letter: [
    ['fullName', 'Full name', 'text'], ['email', 'Email', 'text'], ['phone', 'Phone', 'text'], ['address', 'Address', 'text'],
    ['recipientName', 'Hiring manager (optional)', 'text'], ['companyName', 'Company name', 'text'],
    ['position', 'Position applying for', 'text'],
    ['experience', 'Relevant experience', 'textarea'],
    ['achievements', 'Key achievements (optional)', 'textarea'],
  ],
  job_application: [
    ['fullName', 'Full name', 'text'], ['email', 'Email', 'text'], ['phone', 'Phone', 'text'], ['address', 'Address', 'text'],
    ['recipientName', 'Recipient (optional)', 'text'], ['companyName', 'Company name', 'text'],
    ['position', 'Position', 'text'], ['qualification', 'Qualifications', 'textarea'],
    ['experience', 'Experience', 'textarea'], ['reason', 'Why you are a fit (optional)', 'textarea'],
  ],
  leave_request: [
    ['fullName', 'Full name', 'text'], ['position', 'Your position', 'text'], ['companyName', 'Company', 'text'],
    ['recipientName', 'Manager name (optional)', 'text'],
    ['startDate', 'Leave start date', 'text'], ['endDate', 'Leave end date', 'text'],
    ['reason', 'Reason for leave', 'textarea'],
  ],
  salary_increment: [
    ['fullName', 'Full name', 'text'], ['position', 'Your position', 'text'], ['companyName', 'Company', 'text'],
    ['recipientName', 'Manager name (optional)', 'text'],
    ['duration', 'Time in role (e.g. 2 years)', 'text'],
    ['achievements', 'Your contributions', 'textarea'],
  ],
  offer_acceptance: [
    ['fullName', 'Full name', 'text'], ['position', 'Position offered', 'text'], ['companyName', 'Company', 'text'],
    ['recipientName', 'Recipient (optional)', 'text'],
    ['startDate', 'Start date', 'text'], ['terms', 'Notes on terms (optional)', 'textarea'],
  ],
  resignation: [
    ['fullName', 'Full name', 'text'], ['position', 'Your position', 'text'], ['companyName', 'Company', 'text'],
    ['recipientName', 'Manager name (optional)', 'text'],
    ['lastDay', 'Last working day', 'text'], ['reason', 'Reason (optional)', 'textarea'],
  ],
  reference_request: [
    ['fullName', 'Full name', 'text'], ['position', 'Your former position', 'text'], ['companyName', 'Former company', 'text'],
    ['recipientName', 'Referee name', 'text'],
    ['reason', 'What you need the reference for', 'text'],
    ['achievements', 'What you accomplished there', 'textarea'],
  ],
  farewell: [
    ['fullName', 'Full name', 'text'], ['companyName', 'Company', 'text'],
    ['duration', 'Time at the company', 'text'], ['email', 'Personal email to share', 'text'],
    ['message', 'Personal message (optional)', 'textarea'],
  ],
  admission_application: [
    ['fullName', 'Full name', 'text'], ['email', 'Email', 'text'], ['phone', 'Phone', 'text'], ['address', 'Address', 'text'],
    ['recipientName', 'Admissions officer (optional)', 'text'], ['institutionName', 'Institution name', 'text'],
    ['course', 'Course / Programme', 'text'], ['qualification', 'Qualifications held', 'textarea'],
    ['reason', 'Why this institution (optional)', 'textarea'],
  ],
  leave_permission: [
    ['fullName', 'Student full name', 'text'], ['institutionName', 'School / institution name', 'text'],
    ['classOrYear', 'Class / Year of study', 'text'], ['recipientName', 'Teacher / Dean (optional)', 'text'],
    ['startDate', 'Leave start date', 'text'], ['endDate', 'Leave end date', 'text'],
    ['reason', 'Reason for leave', 'textarea'], ['parentName', "Parent/guardian name (optional)", 'text'],
  ],
  fee_bursary_request: [
    ['fullName', 'Full name', 'text'], ['institutionName', 'Institution name', 'text'],
    ['course', 'Course / Programme', 'text'], ['recipientName', 'Bursar / Admin (optional)', 'text'],
    ['reason', 'Your situation & request', 'textarea'],
  ],
};

// ---------- State ----------
const state = { stage: null, docType: null, templateKey: null, fields: {}, checkoutRequestId: null };
let catalog = null;

// ---------- Dark mode ----------
const darkToggle = document.getElementById('darkToggle');
darkToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  darkToggle.textContent = isDark ? '🌙' : '☀️';
});

// ---------- Step navigation ----------
function showPanel(name) {
  ['stage', 'doc', 'template', 'form', 'pay'].forEach((n) => {
    document.getElementById(`panel-${n}`).classList.toggle('hidden', n !== name);
  });
  document.querySelectorAll('.step').forEach((el, i) => {
    const order = ['stage', 'doc', 'template', 'form', 'pay'];
    el.classList.toggle('active', order[i] === name);
  });
}
document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => showPanel(btn.dataset.back));
});

// ---------- Load catalog & build stage grid ----------
async function init() {
  const res = await fetch('/api/catalog');
  catalog = await res.json();
  document.getElementById('priceTag').textContent = `KSh ${catalog.priceKes}`;
  document.getElementById('priceTag2').textContent = catalog.priceKes;

  const stageGrid = document.getElementById('stageGrid');
  Object.entries(catalog.stages).forEach(([key, stage]) => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `<h3>${stage.label}</h3><p>${Object.keys(stage.documents).length} document types</p>`;
    card.addEventListener('click', () => selectStage(key, card));
    stageGrid.appendChild(card);
  });
}

function selectStage(key, card) {
  state.stage = key;
  document.querySelectorAll('#stageGrid .option-card').forEach((c) => c.classList.remove('selected'));
  card.classList.add('selected');

  const docGrid = document.getElementById('docGrid');
  docGrid.innerHTML = '';
  Object.entries(catalog.stages[key].documents).forEach(([docKey, doc]) => {
    const c = document.createElement('div');
    c.className = 'option-card';
    c.innerHTML = `<h3>${doc.label}</h3><p>3 templates available</p>`;
    c.addEventListener('click', () => selectDoc(docKey, c));
    docGrid.appendChild(c);
  });
  showPanel('doc');
}

function selectDoc(docKey, card) {
  state.docType = docKey;
  document.querySelectorAll('#docGrid .option-card').forEach((c) => c.classList.remove('selected'));
  card.classList.add('selected');

  const tGrid = document.getElementById('templateGrid');
  tGrid.innerHTML = '';
  Object.entries(catalog.templates).forEach(([tKey, t]) => {
    const c = document.createElement('div');
    c.className = 'option-card';
    c.style.borderTop = `4px solid ${t.accent}`;
    c.innerHTML = `<h3>${t.label}</h3><p>Font: ${t.font}</p>`;
    c.addEventListener('click', () => selectTemplate(tKey, c));
    tGrid.appendChild(c);
  });
  showPanel('template');
}

function selectTemplate(tKey, card) {
  state.templateKey = tKey;
  document.querySelectorAll('#templateGrid .option-card').forEach((c) => c.classList.remove('selected'));
  card.classList.add('selected');
  buildForm();
  showPanel('form');
}

function buildForm() {
  const form = document.getElementById('docForm');
  form.innerHTML = '';
  (FIELD_SETS[state.docType] || []).forEach(([name, label, type]) => {
    const wrap = document.createElement('div');
    wrap.className = type === 'textarea' ? 'full' : '';
    const el = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    if (type !== 'textarea') el.type = 'text';
    el.id = `f_${name}`;
    el.addEventListener('input', () => (state.fields[name] = el.value));
    wrap.innerHTML = `<label for="f_${name}">${label}</label>`;
    wrap.appendChild(el);
    form.appendChild(wrap);
  });
}

document.getElementById('previewBtn').addEventListener('click', async () => {
  const res = await fetch('/api/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docType: state.docType, templateKey: state.templateKey, fields: state.fields }),
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  document.getElementById('previewFrame').src = url;
  document.getElementById('downloadBtn').classList.add('hidden');
  document.getElementById('payBox').classList.remove('hidden');
  document.getElementById('payStatus').textContent = '';
  showPanel('pay');
});

// ---------- Best-effort screenshot / save deterrents ----------
// Important: none of this can truly block a screenshot - that's outside any
// website's control. What actually protects the document is that the clean,
// watermark-free PDF is only ever generated server-side AFTER payment is
// confirmed (see /api/download in server.js). These are just extra friction.
const previewShell = document.getElementById('previewShell');
previewShell.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  const blockedCombo = (e.ctrlKey || e.metaKey) && ['p', 's', 'u'].includes(e.key.toLowerCase());
  if (blockedCombo) e.preventDefault();
});
document.addEventListener('visibilitychange', () => {
  previewShell.classList.toggle('blurred', document.hidden);
});
window.addEventListener('blur', () => previewShell.classList.add('blurred'));
window.addEventListener('focus', () => previewShell.classList.remove('blurred'));

// ---------- Payment ----------
document.getElementById('payBtn').addEventListener('click', async () => {
  const phone = document.getElementById('phoneInput').value.trim();
  const status = document.getElementById('payStatus');
  if (!phone) { status.textContent = 'Enter your M-Pesa phone number first.'; return; }

  status.textContent = 'Sending payment prompt to your phone…';
  try {
    const res = await fetch('/api/daraja/stkpush', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, documentId: `${state.docType}-${state.templateKey}` }),
    });
    const data = await res.json();
    if (!res.ok) { status.textContent = data.error || 'Something went wrong.'; return; }
    state.checkoutRequestId = data.checkoutRequestId;
    status.textContent = 'Check your phone and enter your M-Pesa PIN…';
    pollPayment();
  } catch (err) {
    status.textContent = 'Network error. Please try again.';
  }
});

function pollPayment() {
  const status = document.getElementById('payStatus');
  const interval = setInterval(async () => {
    const res = await fetch(`/api/daraja/status/${state.checkoutRequestId}`);
    const data = await res.json();
    if (data.status === 'paid') {
      clearInterval(interval);
      status.textContent = 'Payment received! Your document is ready.';
      document.getElementById('downloadBtn').classList.remove('hidden');
    } else if (data.status === 'failed') {
      clearInterval(interval);
      status.textContent = 'Payment was not completed. Please try again.';
    }
  }, 3000);
  setTimeout(() => clearInterval(interval), 120000); // stop polling after 2 minutes
}

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const res = await fetch(`/api/download/${state.checkoutRequestId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docType: state.docType, templateKey: state.templateKey, fields: state.fields }),
  });
  if (!res.ok) { alert('Payment not confirmed yet - please wait a moment and try again.'); return; }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.docType}.pdf`;
  a.click();
});

init();

/* =========================================================
    SAFENET AI ASSISTANT — chatbot.js
    Answers ONLY questions about SAFENET dashboard & hardware
   ========================================================= */

(function () {
  /* ── SYSTEM PROMPT ─────────────────────────────────────── */
    const SYSTEM_PROMPT = `You are SAFENET AI, an assistant embedded in the SAFENET Industrial Worker Safety Monitor dashboard. You ONLY answer questions related to:

1. THE DASHBOARD (safenet-dashboard):
    - Features: live sensor gauges, alert cards, safety score, event history log, settings
    - Navigation: Dashboard / History / Settings pages
    - Alert types: Fall Detection, SOS Signal, Unconsciousness, Trapped, Explosive Gas, Flash Fire, High Voltage, Helmet Removed, Inactivity, High Temperature, Toxic Gas (MQ135)
    - Settings: thresholds (temperature default 45°C, gas default 900ppm), sound alerts, flash border, red alert modal, voice announcement, auto-dismiss timer, per-trigger toggles, dark/light theme, English/Hindi language
    - CSV export of event history
    - Health/Safety Score (0-100): deducted by active alerts
    - Firebase Realtime Database connection (asia-southeast1 region)
    - Status: ALL CLEAR (green) or DANGER (red flashing)

2. THE HARDWARE (HELMET unit):
    - Smart safety helmet with onboard sensors
    - Temperature sensor → Firebase field: Temperature
    - MQ135 gas sensor → Firebase field: GasLevel_MQ135 (measures toxic & explosive gases, ppm)
    - Heat Index → HeatIndex
    - Humidity → Humidity
    - MPU6050 / accelerometer for Fall Detection → Fall_Alert
    - Manual SOS button → SOS_Alert
    - High Voltage detection sensor → HighVoltage_Alert
    - Inactivity / no-movement detection → Inactivity_Alert
    - Explosive gas threshold detection → ExplosiveGas_Alert
    - Flash fire condition detection → FlashFire_Alert
    - Helmet worn/off detection → Helmet_Off
    - Trapped worker detection → Trapped_Alert
    - Unconscious state detection → Unconscious_Alert
    - Microcontroller sends data to Firebase Realtime DB under /Helmet node
    - Alarm audio: emergency siren OGG from Google Actions sounds

If a question is NOT about the SAFENET dashboard or hardware, respond with:
"I can only assist with SAFENET dashboard features and hardware. Please ask me about sensors, alerts, settings, or how to use the dashboard."

Keep answers concise, technical, and helpful. Use bullet points for lists. Max 120 words per response.`;

  /* ── INJECT STYLES ──────────────────────────────────────── */
    const style = document.createElement('style');
    style.textContent = `
#sn-chat-btn {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 6000;
    width: 56px;
    height: 56px;
    background: var(--yellow);
    border: none;
    clip-path: polygon(14px 0%,100% 0%,calc(100% - 14px) 100%,0% 100%);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 22px rgba(255,214,0,0.55);
    transition: transform .2s, box-shadow .2s;
    color: #000;
    font-size: 1.35rem;
}
#sn-chat-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 0 36px rgba(255,214,0,0.8);
}
#sn-chat-btn .sn-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 14px;
    height: 14px;
    background: var(--red);
    border-radius: 2px;
    display: none;
    animation: pillFlash .8s ease-in-out infinite;
}
#sn-chat-panel {
    position: fixed;
    bottom: 96px;
    right: 28px;
    z-index: 6000;
    width: min(370px, calc(100vw - 40px));
    height: min(520px, calc(100vh - 130px));
    background: #0d0d0d;
    border: 3px solid var(--yellow);
    box-shadow: 0 0 40px rgba(255,214,0,0.18), 4px 4px 0 rgba(255,214,0,0.1);
    display: flex;
    flex-direction: column;
    transform: translateY(20px) scale(0.95);
    opacity: 0;
    pointer-events: none;
    transition: opacity .28s var(--ease), transform .28s var(--ease);
}
.light-mode #sn-chat-panel { background: #1a1500; }
#sn-chat-panel.open {
    transform: translateY(0) scale(1);
    opacity: 1;
    pointer-events: all;
}
.snc-tape {
    height: 9px;
    background: repeating-linear-gradient(-45deg,var(--yellow) 0,var(--yellow) 9px,#111 9px,#111 18px);
    flex-shrink: 0;
}
.snc-head {
    background: var(--yellow);
    padding: 9px 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}
.snc-head-l {
    display: flex;
    align-items: center;
    gap: 9px;
}
.snc-icon {
    width: 30px;
    height: 30px;
    background: #000;
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .75rem;
    color: var(--yellow);
}
.snc-title {
    font-family: var(--display);
    font-size: 1rem;
    color: #000;
    letter-spacing: .1em;
}
.snc-subtitle {
    font-family: var(--mono);
    font-size: .52rem;
    color: #333;
    letter-spacing: .12em;
    text-transform: uppercase;
}
.snc-close {
    background: none;
    border: 2px solid #000;
    color: #000;
    width: 26px;
    height: 26px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .75rem;
    clip-path: polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%);
    transition: background .15s;
    flex-shrink: 0;
}
.snc-close:hover { background: rgba(0,0,0,0.15); }
.snc-msgs {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-behavior: smooth;
}
.snc-msgs::-webkit-scrollbar { width: 3px; }
.snc-msgs::-webkit-scrollbar-thumb { background: var(--yellow); }
.snc-msg {
    display: flex;
    flex-direction: column;
    max-width: 88%;
    animation: msgIn .22s ease;
}
@keyframes msgIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
.snc-msg.user { align-self: flex-end; align-items: flex-end; }
.snc-msg.bot  { align-self: flex-start; align-items: flex-start; }
.snc-bubble {
    padding: 9px 12px;
    font-family: var(--mono);
    font-size: .77rem;
    line-height: 1.55;
    letter-spacing: .04em;
}
.snc-msg.user .snc-bubble {
    background: var(--yellow);
    color: #000;
    clip-path: polygon(8px 0%,100% 0%,100% 100%,0% 100%);
}
.snc-msg.bot .snc-bubble {
    background: #1a1a1a;
    color: var(--text);
    border: 1px solid var(--border);
    clip-path: polygon(0 0,100% 0,calc(100% - 8px) 100%,0% 100%);
    white-space: pre-wrap;
}
.light-mode .snc-msg.bot .snc-bubble { background: var(--bg3); }
.snc-lbl {
    font-family: var(--mono);
    font-size: .52rem;
    color: var(--text-dim);
    letter-spacing: .1em;
    text-transform: uppercase;
    margin-bottom: 3px;
}
.snc-typing {
    display: flex;
    gap: 5px;
    align-items: center;
    padding: 10px 12px;
    background: #1a1a1a;
    border: 1px solid var(--border);
    clip-path: polygon(0 0,100% 0,calc(100% - 8px) 100%,0% 100%);
    width: fit-content;
}
.snc-typing span {
    width: 6px;
    height: 6px;
    background: var(--yellow);
    border-radius: 50%;
    animation: typDot 1.2s ease-in-out infinite;
}
.snc-typing span:nth-child(2) { animation-delay: .2s; }
.snc-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes typDot { 0%,60%,100%{transform:translateY(0);opacity:.3} 30%{transform:translateY(-5px);opacity:1} }
.snc-bottom {
    flex-shrink: 0;
    padding: 10px;
    border-top: 2px solid var(--border);
    background: #111;
    display: flex;
    gap: 7px;
    align-items: center;
}
.light-mode .snc-bottom { background: var(--bg3); }
.snc-input {
    flex: 1;
    background: #000;
    border: 2px solid var(--border);
    color: var(--text);
    font-family: var(--mono);
    font-size: .78rem;
    padding: 8px 11px;
    outline: none;
    letter-spacing: .05em;
    transition: border-color .2s;
}
.light-mode .snc-input { background: var(--bg3); }
.snc-input:focus { border-color: var(--yellow); }
.snc-input::placeholder { color: var(--text-dim); }
.snc-send {
    width: 38px;
    height: 38px;
    background: var(--yellow);
    border: none;
    color: #000;
    font-size: .9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    clip-path: polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);
    transition: background .2s, box-shadow .2s;
    flex-shrink: 0;
}
.snc-send:hover { background: #fff; box-shadow: 0 0 14px rgba(255,214,0,0.5); }
.snc-send:disabled { background: var(--border); color: var(--text-dim); cursor: not-allowed; box-shadow: none; }
.snc-intro {
    text-align: center;
    padding: 18px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}
.snc-intro-icon {
    width: 52px;
    height: 52px;
    background: var(--yellow);
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #000;
    margin-bottom: 4px;
}
.snc-intro-title {
    font-family: var(--display);
    font-size: 1.1rem;
    color: var(--yellow);
    letter-spacing: .1em;
}
.snc-intro-sub {
    font-family: var(--mono);
    font-size: .65rem;
    color: var(--text-dim);
    letter-spacing: .08em;
    text-align: center;
    line-height: 1.6;
}
.snc-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
    margin-top: 4px;
}
.snc-chip {
    padding: 4px 10px;
    font-family: var(--mono);
    font-size: .58rem;
    font-weight: 700;
    letter-spacing: .08em;
    background: #000;
    border: 1px solid var(--border-y);
    color: var(--yellow);
    cursor: pointer;
    clip-path: polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%);
    transition: background .15s;
    text-transform: uppercase;
}
.snc-chip:hover { background: rgba(255,214,0,.1); }
`;
    document.head.appendChild(style);

  /* ── BUILD DOM ──────────────────────────────────────────── */
    const btn = document.createElement('button');
    btn.id = 'sn-chat-btn';
    btn.title = 'SAFENET AI Assistant';
    btn.innerHTML = '<i class="fas fa-robot"></i><div class="sn-badge"></div>';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'sn-chat-panel';
    panel.innerHTML = `
    <div class="snc-tape"></div>
    <div class="snc-head">
        <div class="snc-head-l">
        <div class="snc-icon"><i class="fas fa-robot"></i></div>
        <div>
            <div class="snc-title">SAFENET AI</div>
            <div class="snc-subtitle">Hardware &amp; Dashboard Assistant</div>
        </div>
        </div>
        <button class="snc-close" id="snc-close"><i class="fas fa-times"></i></button>
    </div>
    <div class="snc-msgs" id="snc-msgs">
        <div class="snc-intro">
        <div class="snc-intro-icon"><i class="fas fa-hard-hat"></i></div>
        <div class="snc-intro-title">ASK ME ANYTHING</div>
        <div class="snc-intro-sub">I only answer questions about the<br>SAFENET dashboard &amp; smart helmet hardware.</div>
        <div class="snc-chips">
            <div class="snc-chip" data-q="What sensors are on the helmet?">Helmet Sensors</div>
            <div class="snc-chip" data-q="How does fall detection work?">Fall Detection</div>
            <div class="snc-chip" data-q="What is the health score?">Health Score</div>
            <div class="snc-chip" data-q="How do I export the event log?">Export CSV</div>
            <div class="snc-chip" data-q="What does the MQ135 sensor measure?">MQ135 Sensor</div>
            <div class="snc-chip" data-q="How do I change alert thresholds?">Thresholds</div>
        </div>
        </div>
    </div>
    <div class="snc-bottom">
        <input class="snc-input" id="snc-input" type="text" placeholder="Ask about SAFENET hardware or dashboard..." maxlength="300" autocomplete="off">
        <button class="snc-send" id="snc-send"><i class="fas fa-paper-plane"></i></button>
    </div>
    `;
    document.body.appendChild(panel);

  /* ── STATE ──────────────────────────────────────────────── */
    let isOpen = false;
    let isLoading = false;
    let history = [];

    const msgsEl   = panel.querySelector('#snc-msgs');
    const inputEl  = panel.querySelector('#snc-input');
    const sendEl   = panel.querySelector('#snc-send');

  /* ── TOGGLE ─────────────────────────────────────────────── */
    function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) {
        inputEl.focus();
        btn.querySelector('.sn-badge').style.display = 'none';
    }
    }
    btn.addEventListener('click', (e) => { e.stopPropagation(); togglePanel(); });
    panel.querySelector('#snc-close').addEventListener('click', () => { isOpen = false; panel.classList.remove('open'); });
    document.addEventListener('click', (e) => {
    if (isOpen && !panel.contains(e.target) && e.target !== btn) {
        isOpen = false; panel.classList.remove('open');
    }
    });
    panel.addEventListener('click', (e) => e.stopPropagation());

  /* ── QUICK CHIPS ────────────────────────────────────────── */
    panel.querySelectorAll('.snc-chip').forEach(chip => {
    chip.addEventListener('click', () => { sendMessage(chip.getAttribute('data-q')); });
    });

  /* ── SEND ────────────────────────────────────────────────── */
    inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputEl.value); } });
    sendEl.addEventListener('click', () => sendMessage(inputEl.value));

    function sendMessage(text) {
    text = text.trim();
    if (!text || isLoading) return;
    inputEl.value = '';

    // Remove intro if present
    const intro = msgsEl.querySelector('.snc-intro');
    if (intro) intro.remove();

    appendMsg('user', text);
    history.push({ role: 'user', content: text });

    setLoading(true);
    callClaude();
    }

    function appendMsg(role, content) {
    const wrap = document.createElement('div');
    wrap.className = 'snc-msg ' + role;
    wrap.innerHTML = `<div class="snc-lbl">${role === 'user' ? 'YOU' : 'SAFENET AI'}</div><div class="snc-bubble">${escapeHtml(content)}</div>`;
    msgsEl.appendChild(wrap);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return wrap;
    }

    function escapeHtml(t) {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    }

  /* ── TYPING INDICATOR ───────────────────────────────────── */
    let typingEl = null;
    function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className = 'snc-msg bot';
    typingEl.innerHTML = '<div class="snc-lbl">SAFENET AI</div><div class="snc-typing"><span></span><span></span><span></span></div>';
    msgsEl.appendChild(typingEl);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    }
    function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
    }

    function setLoading(val) {
    isLoading = val;
    sendEl.disabled = val;
    inputEl.disabled = val;
    if (val) showTyping(); else hideTyping();
    }

  /* ── CLAUDE API ─────────────────────────────────────────── */
    async function callClaude() {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: history
        })
        });

        const data = await response.json();
        const reply = data.content?.map(b => b.text || '').join('').trim()
                    || 'Sorry, I could not process that request.';

        history.push({ role: 'assistant', content: reply });

        setLoading(false);
        appendMsg('bot', reply);

    } catch (err) {
        console.error('SAFENET AI error:', err);
        setLoading(false);
        appendMsg('bot', 'Connection error. Please check your network and try again.');
    }
    }

})();

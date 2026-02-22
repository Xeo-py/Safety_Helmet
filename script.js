import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBSNf-7VhfWvo2AyExJbl8_Yk55kNDKZGc",
    authDomain: "smart-helmet-hackathon.firebaseapp.com",
    databaseURL: "https://smart-helmet-hackathon-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-helmet-hackathon",
    appId: "1:292986973487:web:441a114cdc9deaa02285da"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const alarm = document.getElementById('alarm-sound');
let currentLang = 'en';

// --- Loading Screen Logic ---
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
    }, 2500); // 2.5s for professional load feel
});

// --- Menu Interaction ---
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('dropdown-menu');

menuBtn.onclick = (e) => { e.stopPropagation(); menu.classList.toggle('active'); };
document.onclick = () => menu.classList.remove('active');

// --- Theme & Lang Switchers ---
document.getElementById('set-light').onclick = () => document.body.classList.add('light-mode');
document.getElementById('set-dark').onclick = () => document.body.classList.remove('light-mode');

document.getElementById('set-en').onclick = () => switchLang('en');
document.getElementById('set-hi').onclick = () => switchLang('hi');

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-en]').forEach(el => {
        el.innerText = el.getAttribute(`data-${lang}`);
    });
}

// --- Firebase Data ---
onValue(ref(db, 'Helmet_1'), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    document.getElementById('val-temp').innerText = `${data.Temperature}°C`;
    document.getElementById('val-gas').innerText = data.Gas_Level;

    const isDanger = data.Fall_Alert == 1 || data.SOS_Alert == 1 || data.Gas_Level > 100;
    const fallLabel = document.getElementById('status-fall');
    const sosLabel = document.getElementById('status-sos');

    fallLabel.innerText = data.Fall_Alert == 1 ? (currentLang === 'en' ? "⚠ FALL" : "⚠ गिरे") : (currentLang === 'en' ? "STABLE" : "स्थिर");
    fallLabel.style.color = data.Fall_Alert == 1 ? "var(--danger)" : "var(--safe)";
    
    sosLabel.innerText = data.SOS_Alert == 1 ? (currentLang === 'en' ? "🆘 HELP" : "🆘 मदद") : (currentLang === 'en' ? "OFF" : "बंद");
    sosLabel.style.color = data.SOS_Alert == 1 ? "var(--danger)" : "var(--safe)";

    if (isDanger) {
        document.body.classList.add('danger-alert');
        alarm.play().catch(() => {});
    } else {
        document.body.classList.remove('danger-alert');
        alarm.pause();
    }
});
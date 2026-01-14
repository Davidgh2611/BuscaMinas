import { state } from './state.js';
import { achievements, rankings } from './storage.js';

const $ = (id) => document.getElementById(id);

// --- FUNCIÓN QUE FALTABA ---
export function setSkin(s) {
    document.body.className = s;
    localStorage.setItem("skin", s);
}

export function showScreen(screen) {
    if ($('menu')) $('menu').style.display = screen === 'menu' ? 'flex' : 'none';
    if ($('gameUI')) $('gameUI').style.display = screen === 'game' ? 'flex' : 'none';
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

export function updateDisplay() {
    if ($('time')) $('time').textContent = state.seconds;
    if ($('mines')) $('mines').textContent = state.MINES;
    if ($('flags')) $('flags').textContent = state.flagsUsed;
}

export function createBoard(size, onClick, onRightClick) {
    const boardEl = $('board');
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${size}, 38px)`;
    state.cellsDOM = [];

    for (let i = 0; i < size * size; i++) {
        const x = Math.floor(i / size);
        const y = i % size;
        const c = document.createElement("div");
        c.className = "cell";
        c.style.animationDelay = `${i * 0.005}s`;
        c.onclick = () => onClick(x, y);
        c.oncontextmenu = (e) => { e.preventDefault(); onRightClick(x, y); };
        boardEl.appendChild(c);
        state.cellsDOM.push(c);
    }
}

export function renderCell(x, y, value, type = 'reveal') {
    const index = x * state.SIZE + y;
    const cell = state.cellsDOM[index];
    if (!cell) return;

    if (type === 'flag') {
        cell.textContent = value ? "🚩" : "";
        return;
    }

    cell.classList.add("revealed");
    if (value === "💣") {
        cell.textContent = "💥";
        cell.style.background = "#ff4444";
        spawnParticles(cell.getBoundingClientRect(), "#ffcc00", 12);
        screenShake();
    } else {
        cell.textContent = value || "";
        if (value > 0) cell.classList.add("n" + value);
    }
}

function screenShake() {
    const board = $('board');
    if (board) {
        board.classList.add('shake');
        setTimeout(() => board.classList.remove('shake'), 400);
    }
}

function spawnParticles(rect, color, count = 10) {
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.background = color;
        p.style.left = (rect.left + rect.width / 2) + "px";
        p.style.top = (rect.top + rect.height / 2) + "px";
        const dx = (Math.random() - 0.5) * 150;
        const dy = (Math.random() - 0.5) * 150;
        p.style.setProperty('--dx', `${dx}px`);
        p.style.setProperty('--dy', `${dy}px`);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

export function showAchievementNotification(name) {
    const notif = document.createElement("div");
    Object.assign(notif.style, {
        position: 'fixed', top: '20px', right: '20px', backgroundColor: '#333',
        color: 'white', padding: '15px 25px', borderRadius: '10px', zIndex: '9999',
        borderLeft: '5px solid #ffcc00', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        transform: 'translateX(150%)', transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });
    notif.innerHTML = `<small style="font-size:0.7em; opacity:0.8">LOGRO DESBLOQUEADO</small><br><strong>${name}</strong>`;
    document.body.appendChild(notif);
    setTimeout(() => notif.style.transform = 'translateX(0)', 100);
    setTimeout(() => { 
        notif.style.transform = 'translateX(150%)'; 
        setTimeout(() => notif.remove(), 500); 
    }, 4000);
}

export function renderAchievements() {
    const list = $('achList');
    if (!list) return;
    list.innerHTML = "";
    const badges = [
        { key: "beginner", name: "🐣 Novato", desc: "Gana en modo Fácil." },
        { key: "intermediate", name: "🎖️ Veterano", desc: "Gana en modo Medio." },
        { key: "hard", name: "🔥 Leyenda", desc: "Gana en modo Difícil." },
        { key: "expert", name: "😈 Experto", desc: "Gana en modo Experto." },
        { key: "speed_demon", name: "⚡ Flash", desc: "Gana en menos de 30s." },
        { key: "no_flags", name: "🧠 Sin Banderas", desc: "Gana sin usar banderas." },
        { key: "survivor", name: "🛡️ Superviviente", desc: "Revela 50 casillas." },
        { key: "perfect", name: "💯 Perfecto", desc: "Gana una partida." }
    ];
    badges.forEach(ach => {
        const isEarned = achievements[ach.key];
        const li = document.createElement("li");
        li.style.cssText = `list-style:none; margin-bottom:12px; opacity:${isEarned ? 1 : 0.4}; border-left: 3px solid ${isEarned ? '#ffcc00' : '#444'}; padding-left: 10px;`;
        li.innerHTML = `<strong>${isEarned ? '✅' : '🔒'} ${ach.name}</strong><br><small style="color:#aaa">${ach.desc}</small>`;
        list.appendChild(li);
    });
    $('achModal').style.display = "flex";
}

export function playSound(type) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'boom') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    }
}

export function renderRanking() {
    const list = $('rankList');
    if (!list) return;
    list.innerHTML = "";
    const cats = { easy: "🟢 FÁCIL", medium: "🟡 MEDIO", hard: "🔴 DIFÍCIL", expert: "😈 EXPERTO" };
    Object.entries(cats).forEach(([key, label]) => {
        const times = rankings[key] || [];
        list.innerHTML += `<div style="margin-top:15px; color:#ffcc00; border-bottom: 1px solid #333"><b>${label}</b></div>`;
        list.innerHTML += times.length 
            ? times.map((t, i) => `<div style="padding: 2px 0;">${i+1}. ${t} segundos</div>`).join('') 
            : "<div style='color:#666; font-size:0.8em'>Sin récords aún</div>";
    });
    $('rankModal').style.display = "flex";
}

export function showWin() { 
    // Efecto confeti simple con partículas
    for(let i=0; i<30; i++) {
        setTimeout(() => {
            spawnParticles({
                left: Math.random() * window.innerWidth,
                top: -10, width: 0, height: 0
            }, `hsl(${Math.random() * 360}, 70%, 50%)`, 5);
        }, i * 100);
    }
    if ($('finalTime')) $('finalTime').textContent = state.seconds;
    $('winModal').style.display = "flex"; 
}

export function showLose() { 
    $('loseModal').style.display = "flex"; 
}
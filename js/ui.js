import { state } from './state.js';
import * as Storage from './storage.js';

const $ = (id) => document.getElementById(id);

// --- GESTIÓN DE PANTALLAS Y SKINS ---
export function setSkin(s) {
    document.body.className = s;
    localStorage.setItem("skin", s);
}

export function showScreen(screen) {
    if ($('menu')) $('menu').style.display = screen === 'menu' ? 'flex' : 'none';
    if ($('gameUI')) $('gameUI').style.display = screen === 'game' ? 'flex' : 'none';
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// --- ACTUALIZACIÓN DE UI EN TIEMPO REAL ---
export function updateDisplay() {
    if ($('time')) $('time').textContent = state.seconds;
    if ($('mines')) $('mines').textContent = state.MINES;
    if ($('flags')) $('flags').textContent = state.flagsUsed;
    
    // Si estamos en Blitz y queda poco tiempo, efecto visual
    if (state.isBlitz && state.seconds <= 5) {
        $('time').style.color = '#ff4444';
        $('time').style.fontWeight = 'bold';
    } else {
        $('time').style.color = '';
        $('time').style.fontWeight = '';
    }
}

// --- TABLERO ---
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
        cell.textContent = getMineIcon();
        cell.classList.add('bomb-explosion');
        spawnParticles(cell.getBoundingClientRect(), "#ff4444", 12);
        screenShake();
    } else {
        cell.textContent = value || "";
        if (value > 0) cell.classList.add("n" + value);
    }
}

// --- EFECTOS VISUALES ---
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

export function createParticles(x, y) {
    const cell = state.cellsDOM[x * state.SIZE + y];
    if (!cell) return;
    spawnParticles(cell.getBoundingClientRect(), 'rgba(255, 255, 255, 0.6)', 6);
}

export function launchConfetti() {
    const colors = ['#ffcc00', '#ff3366', '#2de1af', '#29cdff', '#a154f2'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

// --- MODALES Y RENDERS ---
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
        const isEarned = Storage.achievements[ach.key];
        const li = document.createElement("li");
        li.style.cssText = `list-style:none; margin-bottom:12px; opacity:${isEarned ? 1 : 0.4}; border-left: 3px solid ${isEarned ? '#ffcc00' : '#444'}; padding-left: 10px;`;
        li.innerHTML = `<strong>${isEarned ? '✅' : '🔒'} ${ach.name}</strong><br><small style="color:#aaa">${ach.desc}</small>`;
        list.appendChild(li);
    });
    $('achModal').style.display = "flex";
}

export function renderRanking() {
    const list = $('rankList');
    if (!list) return;
    list.innerHTML = "";
    const cats = { easy: "🟢 FÁCIL", medium: "🟡 MEDIO", hard: "🔴 DIFÍCIL", expert: "😈 EXPERTO", blitz: "⚡ BLITZ" };
    Object.entries(cats).forEach(([key, label]) => {
        const times = Storage.rankings[key] || [];
        list.innerHTML += `<div style="margin-top:15px; color:#ffcc00; border-bottom: 1px solid #333"><b>${label}</b></div>`;
        list.innerHTML += times.length 
            ? times.map((t, i) => `<div style="padding: 2px 0;">${i+1}. ${t} segundos</div>`).join('') 
            : "<div style='color:#666; font-size:0.8em'>Sin récords aún</div>";
    });
    $('rankModal').style.display = "flex";
}

// --- NUEVO: RENDER HISTORIAL ---
export function renderHistory() {
    const history = Storage.getHistory();
    const body = $('historyBody');
    if (!body) return;
    body.innerHTML = history.map(h => `
        <tr style="border-bottom: 1px solid #333; height: 40px;">
            <td>${h.fecha}</td>
            <td>${h.dificultad.toUpperCase()}</td>
            <td>${h.tiempo}s</td>
            <td style="color: ${h.resultado === 'Victoria' ? '#2de1af' : '#ff4444'}">${h.resultado}</td>
        </tr>
    `).join('') || '<tr><td colspan="4">No hay partidas registradas</td></tr>';
    $('historyModal').style.display = "flex";
}

export function renderStats() {
    const s = Storage.stats; 
    const container = $('statsContainer');
    if (!container) return;
    const winRate = s.gamesPlayed > 0 ? ((s.wins / s.gamesPlayed) * 100).toFixed(1) : 0;
    const data = [
        { label: "Partidas", val: s.gamesPlayed, icon: "🎮" },
        { label: "Victorias", val: s.wins, icon: "🏆" },
        { label: "Win Rate", val: winRate + "%", icon: "📈" },
        { label: "Bombas", val: s.bombsExploded, icon: "💥" },
        { label: "Racha Act.", val: s.currentStreak, icon: "🔥" },
        { label: "Racha Máx.", val: s.maxStreak, icon: "⭐" }
    ];
    container.innerHTML = data.map(item => `
        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1)">
            <div style="font-size: 0.8em; color: #aaa;">${item.icon} ${item.label}</div>
            <div style="font-size: 1.2em; font-weight: bold; color: #ffcc00;">${item.val}</div>
        </div>
    `).join('');
    $('statsModal').style.display = "flex";
}

// --- UTILIDADES ---
export function getMineIcon() {
    const skin = document.body.className;
    if (skin.includes('winter')) return "❄️";
    if (skin.includes('halloween')) return "💀";
    if (skin.includes('cyberpunk')) return "🛰️";
    return "💣";
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
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'boom') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
}

export function showWin() { 
    if ($('finalTime')) $('finalTime').textContent = state.seconds;
    $('winModal').style.display = "flex"; 
    launchConfetti(); 
}

export function showLose() { 
    if (state.isBlitz && state.seconds <= 0) {
        $('lose-title').textContent = "⏰ TIEMPO AGOTADO";
    } else {
        $('lose-title').textContent = "💥 HAS PERDIDO";
    }
    $('loseModal').style.display = "flex"; 
}

export function runReplay() {
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('loseModal').style.display = 'none';
    state.cellsDOM.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell";
        cell.style.backgroundColor = "";
    });
    state.history.forEach((move, index) => {
        setTimeout(() => {
            const cell = state.cellsDOM[move.x * state.SIZE + move.y];
            if (move.type === 'reveal') {
                cell.classList.add('revealed');
                const val = state.board[move.x][move.y];
                if (val === "💣") {
                    cell.textContent = getMineIcon();
                    cell.classList.add('bomb-explosion');
                } else {
                    cell.textContent = val === 0 ? "" : val;
                    if(val > 0) cell.classList.add("n" + val);
                }
            } else if (move.type === 'flag') {
                cell.textContent = cell.textContent === "🚩" ? "" : "🚩";
            }
        }, index * 100);
    });
}
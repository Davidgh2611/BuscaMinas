import { state } from './state.js';
import * as Storage from './storage.js';
import * as DB from './db.js';

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
    
    if (state.isBlitz && state.seconds <= 5) {
        $('time').style.color = '#ff4444';
        $('time').style.fontWeight = 'bold';
    } else {
        $('time').style.color = '';
        $('time').style.fontWeight = '';
    }
}

// --- RENDERS DE LOGROS (EXTENDIDO) ---
export function renderAchievements() {
    const list = $('achList');
    if (!list) return;
    list.innerHTML = "";

    // BASE DE DATOS EXTENDIDA DE LOGROS
    const badges = [
        { key: "beginner", name: "🐣 Novato", desc: "Gana en modo Fácil." },
        { key: "intermediate", name: "🎖️ Veterano", desc: "Gana en modo Medio." },
        { key: "hard", name: "🔥 Leyenda", desc: "Gana en modo Difícil." },
        { key: "expert", name: "😈 Experto", desc: "Gana en modo Experto." },
        { key: "speed_demon", name: "⚡ Flash", desc: "Gana en menos de 30s." },
        { key: "sonic", name: "🌀 Supersónico", desc: "Gana en menos de 15s." },
        { key: "blitz_master", name: "🧨 Maestro Blitz", desc: "Gana en el modo Blitz." },
        { key: "patience", name: "🐢 Zen", desc: "Gana una partida de más de 5 minutos." },
        { key: "no_flags", name: "🧠 Sin Banderas", desc: "Gana sin marcar ninguna mina." },
        { key: "perfectionist", name: "💯 Perfecto", desc: "Gana sin revelar ninguna mina por error." },
        { key: "lucky_guess", name: "🎲 Suerte Pura", desc: "Gana en menos de 10 clicks totales." },
        { key: "chord_king", name: "🎹 Pianista", desc: "Realiza 20 'chords' en una partida." },
        { key: "miner_100", name: "⛏️ Minero", desc: "Limpia 100 minas en total." },
        { key: "miner_1000", name: "💎 Magnate", desc: "Limpia 1000 minas en total." },
        { key: "survivor", name: "🛡️ Superviviente", desc: "Revela 50 casillas sin morir." },
        { key: "boom_collector", name: "💥 Kamikaze", desc: "Explota 50 veces." },
        { key: "streak_3", name: "🔥 Racha", desc: "Gana 3 partidas seguidas." },
        { key: "night_owl", name: "🦉 Trasnochador", desc: "Juega una partida después de medianoche." }
    ];

    badges.forEach(ach => {
        const isEarned = Storage.achievements[ach.key];
        const li = document.createElement("li");
        li.className = isEarned ? "ach-item earned" : "ach-item locked";
        
        li.innerHTML = `
            <div class="ach-icon-container">${isEarned ? '✅' : '🔒'}</div>
            <div class="ach-content">
                <strong>${ach.name}</strong>
                <p>${ach.desc}</p>
            </div>
        `;
        list.appendChild(li);
    });
    
    $('achModal').style.display = "flex";
}

// --- NOTIFICACIONES ---
// ui.js
export async function showAchievementNotification(name) {
    const theme = document.body.className || 'moderno'; // Detecta tema activo

    // Definimos colores dinámicos según tema
    const themeColors = {
        moderno:   { bg: '#333', color: '#ffcc00' },
        clasico:   { bg: '#c0c0c0', color: '#ff0000' },
        minimal:   { bg: '#ffffff', color: '#d32f2f' },
        winter:    { bg: '#e0f7ff', color: '#003049' },
        halloween: { bg: '#2a1b0a', color: '#ff6600' },
        cyberpunk: { bg: '#050517', color: '#0ff' }
    };

    const colors = themeColors[theme] || themeColors.moderno;

    const notif = document.createElement('div');
    notif.className = `achievement-notification show notif-${theme}`;
    
    notif.innerHTML = `
        <div class="ach-icon">🏆</div>
        <div class="ach-text">
            <small>¡Nuevo logro desbloqueado!</small>
            <strong>${name}</strong>
        </div>
    `;

    // Aplicamos estilos dinámicos inline para garantizar prioridad
    notif.style.backgroundColor = colors.bg;
    notif.style.color = colors.color;

    // Apilar notificaciones sin empujar layout
    const container = document.getElementById('toast-container') || (() => {
        const c = document.createElement('div');
        c.id = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();

    // Calculamos posición vertical según número de notificaciones activas
    const index = container.children.length;
    notif.style.setProperty('--toast-top', `${20 + index * 78}px`);

    container.appendChild(notif);

    // Animación automática de desaparición
    setTimeout(() => {
        notif.classList.remove('show');
        notif.classList.add('hiding');
        setTimeout(() => notif.remove(), 500);
    }, 3000);
}



// --- RANKINGS Y ESTADÍSTICAS ---
export async function renderGlobalRank(cat = 'easy') {
    const container = $('global-rank-container');
    if (!container) return;
    container.innerHTML = `<div class="loading">Cargando mejores tiempos...</div>`;
    
    // Ajustado para usar la función correcta de db.js
    const scores = await DB.getGlobalRankings(cat);
    container.innerHTML = "";
    
    if (scores.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:20px;">No hay récords en ${cat.toUpperCase()}.</p>`;
    } else {
        const table = document.createElement('table');
        table.className = "ranking-table";
        table.innerHTML = `
            <thead><tr><th>#</th><th>Nombre</th><th>Tiempo</th><th>Fecha</th></tr></thead>
            <tbody>
                ${scores.map((s, i) => `
                    <tr><td>${i + 1}</td><td style="color:#ffcc00;">${s.nombre}</td><td>${s.tiempo}s</td><td>${new Date(s.created_at || s.fecha).toLocaleDateString()}</td></tr>
                `).join('')}
            </tbody>`;
        container.appendChild(table);
    }
}

export function renderRanking() {
    const list = $('rankList');
    if (!list) return;
    list.innerHTML = "";
    const cats = { easy: "🟢 FÁCIL", medium: "🟡 MEDIO", hard: "🔴 DIFÍCIL", expert: "😈 EXPERTO", blitz: "⚡ BLITZ" };
    Object.entries(cats).forEach(([key, label]) => {
        const times = Storage.rankings[key] || [];
        list.innerHTML += `<div class="rank-cat-header"><b>${label}</b></div>`;
        list.innerHTML += times.length 
            ? times.map((t, i) => `<div class="rank-entry">${i+1}. ${t} segundos</div>`).join('') 
            : "<div class='rank-empty'>Sin récords locales</div>";
    });
    $('rankModal').style.display = "flex";
}

export function renderHistory() {
    const history = Storage.getHistory();
    const body = $('historyBody');
    if (!body) return;
    body.innerHTML = history.map(h => `
        <tr class="history-row">
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
        <div class="stat-card">
            <div class="stat-label">${item.icon} ${item.label}</div>
            <div class="stat-value">${item.val}</div>
        </div>
    `).join('');
    $('statsModal').style.display = "flex";
}

// --- GESTIÓN DE TABLERO Y CELDAS ---
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

export function renderCell(x, y, value) {
    const index = x * state.SIZE + y;
    const cell = state.cellsDOM[index];
    if (!cell) return;

    cell.classList.add("revealed");

    if (value === "💣") {
        cell.textContent = "💣";           // Bombas siempre
        cell.style.color = "#ff4444";      // Fuerza rojo en todas
        cell.classList.add('bomb-explosion');
        spawnParticles(cell.getBoundingClientRect(), "#ff4444", 12);
        screenShake();
    } else {
        cell.textContent = value || "";
        cell.style.color = "";              // Reset color normal
        if (value > 0) cell.classList.add("n" + value);
    }
}




// --- EFECTOS VISUALES ---
function screenShake() {
    const board = $('board');
    if (board) {
        board.classList.add('shake-animation');
        setTimeout(() => board.classList.remove('shake-animation'), 400);
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
    spawnParticles(cell.getBoundingClientRect(), 'rgba(255, 255, 255, 0.4)', 6);
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
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'boom') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
}

export async function showWin() { 
    const tiempo = state.seconds;
    const modo = state.currentMode || 'easy';
    
    if ($('finalTime')) $('finalTime').textContent = tiempo;
    $('winModal').style.display = "flex"; 
    launchConfetti(); 

    // GESTIÓN AUTOMÁTICA DE NOMBRE
    let nombreParaRanking = state.playerName;

    // Si es invitado o está vacío, asignamos "Invitado" automáticamente
    if (!nombreParaRanking || nombreParaRanking === "Invitado (Local)") {
        nombreParaRanking = "Invitado";
    }

    // Guardar usando la función corregida de db.js
    await DB.saveGlobalScore(nombreParaRanking, tiempo, modo);
}

export function showLose() { 
    if (state.isBlitz && state.seconds <= 0) {
        $('lose-title').textContent = "⏰ TIEMPO AGOTADO";
    } else {
        $('lose-title').textContent = "💥 HAS PERDIDO";
    }
    $('loseModal').style.display = "flex"; 
}

export function updateDuelScore() {
    const myScoreEl = document.getElementById('my-score');
    const oppScoreEl = document.getElementById('opp-score');
    if (myScoreEl) {
        myScoreEl.textContent = state.score;
        myScoreEl.style.transform = "scale(1.2)";
        setTimeout(() => myScoreEl.style.transform = "scale(1)", 200);
    }
    if (oppScoreEl) {
        oppScoreEl.textContent = state.opponentScore;
        oppScoreEl.style.color = "#ff4444";
    }
}

export function sendReaction(text) {
    if (!state.isDuel) return;
    import('./db.js').then(db => db.sendMove({ type: 'chat', text: text }));
    showReaction(text);
}

export function showReaction(text) {
    const bubble = document.getElementById('chat-bubble-rival');
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.display = 'block';
    bubble.style.animation = 'none';
    bubble.offsetHeight;
    bubble.style.animation = 'bubblePop 2s ease-out forwards';
    setTimeout(() => { bubble.style.display = 'none'; }, 2000);
}

export function showDuelHeader(active) {
    const header = document.getElementById('duel-header');
    if (header) header.style.display = active ? 'flex' : 'none';
}

export function runReplay() {
    // Ocultamos todos los modales
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');

    // Reiniciamos todas las celdas
    state.cellsDOM.forEach(cell => { 
        cell.textContent = ""; 
        cell.className = "cell"; 
        cell.style.color = ""; // Reset color
    });

    // Reproducimos el historial de movimientos
    state.history.forEach((move, index) => {
        setTimeout(() => {
            const cell = state.cellsDOM[move.x * state.SIZE + move.y];
            if (!cell) return;

            if (move.type === 'reveal') {
                cell.classList.add('revealed');
                const val = state.board[move.x][move.y];

                if (val === "💣") {
                    cell.textContent = "💣";         // Bombas siempre rojas
                    cell.style.color = "#ff4444";    // Color rojo
                    cell.classList.add('bomb-explosion');
                    spawnParticles(cell.getBoundingClientRect(), "#ff4444", 12);
                } else {
                    cell.textContent = val === 0 ? "" : val;
                    cell.style.color = "";           // Reset color normal
                    if(val > 0) cell.classList.add("n" + val);
                }
            } else if (move.type === 'flag') {
                cell.textContent = cell.textContent === "🚩" ? "" : "🚩";
            }
        }, index * 100);
    });
}

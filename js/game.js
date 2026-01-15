import { state } from './state.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';
import * as DB from './db.js';

export function startGame(size, mines, exp) {
    state.SIZE = size;
    state.MINES = mines;
    state.expert = exp;
    state.lastConfig = { size, mines, exp };
    state.cellsRevealedCount = 0;
    state.history = []; 
    state.chordsCount = 0; // Para el logro de "Pianista"
    
    state.board = [...Array(size)].map(() => Array(size).fill(0));
    state.revealed = [...Array(size)].map(() => Array(size).fill(false));
    state.flagged = [...Array(size)].map(() => Array(size).fill(false));
    state.gameOver = false;
    state.firstClick = true;
    state.flagsUsed = 0;

    if (state.isBlitz === undefined) state.isBlitz = false;
    if (!state.isBlitz) state.seconds = 0;

    clearInterval(state.timer);
    state.timer = setInterval(() => {
        if (!state.gameOver) {
            if (state.isBlitz) {
                state.seconds--;
                if (state.seconds <= 0) {
                    state.seconds = 0;
                    UI.updateDisplay();
                    lose(-1, -1); 
                    return;
                }
            } else {
                state.seconds++;
            }
            UI.updateDisplay();
        }
    }, 1000);

    UI.showScreen('game');
    UI.updateDisplay();
    UI.createBoard(size, clickCell, toggleFlag);
}

export function startBlitz(size, mines) {
    state.isBlitz = true;
    state.seconds = 30;
    startGame(size, mines, false);
}

function clickCell(x, y) {
    if (state.gameOver || state.flagged[x][y]) return;
    
    if (state.firstClick) { 
        placeMines(x, y); 
        state.firstClick = false; 
    }
    
    state.history.push({ x, y, type: 'reveal' });

    if (state.revealed[x][y]) { 
        chord(x, y); 
        checkWin(); 
        return; 
    }
    
    reveal(x, y);
    checkWin();
    UI.createParticles(x, y);
}

function reveal(x, y) {
    if (state.gameOver || state.revealed[x][y] || state.flagged[x][y]) return;
    state.revealed[x][y] = true;
    state.cellsRevealedCount++;

    if (state.isBlitz && state.board[x][y] !== "💣") {
        state.seconds += (state.board[x][y] === 0) ? 2 : 1;
        UI.updateDisplay();
    }

    // LOGRO: Superviviente (Revelar 50 casillas)
    if (state.cellsRevealedCount === 50) {
        Storage.unlockAchievement("survivor", "Superviviente");
    }
    
    UI.renderCell(x, y, state.board[x][y]);
    
    if (state.board[x][y] === "💣") { 
        lose(x, y); 
        return; 
    }
    
    if (state.board[x][y] === 0 && !state.expert) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < state.SIZE && ny >= 0 && ny < state.SIZE) {
                    if (!state.revealed[nx][ny]) {
                        state.history.push({ x: nx, y: ny, type: 'reveal' });
                        reveal(nx, ny);
                    }
                }
            }
        }
    }
}

function toggleFlag(x, y) {
    if (state.gameOver || state.revealed[x][y]) return;
    const cell = state.cellsDOM[x * state.SIZE + y];
    
    if (!state.flagged[x][y] && cell.textContent !== "❓") {
        state.flagged[x][y] = true;
        state.flagsUsed++;
        cell.textContent = "🚩";
    } else if (state.flagged[x][y]) {
        state.flagged[x][y] = false;
        state.flagsUsed--;
        cell.textContent = "❓";
    } else {
        cell.textContent = "";
    }
    UI.updateDisplay();
}

async function checkWin() {
    if (state.gameOver) return;
    let win = true;
    for (let x = 0; x < state.SIZE; x++) {
        for (let y = 0; y < state.SIZE; y++) {
            if (state.board[x][y] !== "💣" && !state.revealed[x][y]) { 
                win = false; 
                break; 
            }
        }
    }

    if (win) {
        state.gameOver = true;
        clearInterval(state.timer);
        Storage.updateStats('win'); 

        let cat = "easy";
        let achKey = "beginner";
        let achName = "🐣 Novato";

        if (state.isBlitz) {
            cat = "blitz";
            achKey = "blitz_master";
            achName = " Maestro Blitz";
            Storage.unlockAchievement("blitz_master", achName);
        } else {
            if (state.SIZE === 12) {
                cat = "medium"; achKey = "intermediate"; achName = "🎖️ Veterano";
            } else if (state.SIZE === 16) {
                if (state.expert) {
                    cat = "expert"; achKey = "expert"; achName = "😈 Experto";
                } else {
                    cat = "hard"; achKey = "hard"; achName = "🔥 Leyenda";
                }
            }
        }

        // --- GESTIÓN DE LOGROS DE VICTORIA ---
        Storage.unlockAchievement(achKey, achName);
        Storage.unlockAchievement("perfect", "💯 Perfecto");

        // LOGRO: Flash (Menos de 30s)
        if (state.seconds < 30) Storage.unlockAchievement("speed_demon", "⚡ Flash");
        
        // LOGRO: Supersónico (Menos de 15s)
        if (state.seconds < 15) Storage.unlockAchievement("sonic", "🌀 Supersónico");

        // LOGRO: Sin Banderas
        if (state.flagsUsed === 0) Storage.unlockAchievement("no_flags", "🧠 Sin Banderas");

        // LOGRO: Zen (Más de 5 min)
        if (state.seconds > 300) Storage.unlockAchievement("patience", "🐢 Zen");

        // LOGRO: Suerte Pura (Menos de 10 clicks)
        const totalClicks = state.history.filter(h => h.type === 'reveal').length;
        if (totalClicks < 10) Storage.unlockAchievement("lucky_guess", "🎲 Suerte Pura");

        // LOGRO: Racha de 3
        if (Storage.stats.currentStreak >= 3) Storage.unlockAchievement("streak_3", "🔥 Racha");

        // LOGRO: Trasnochador (Partida después de las 00:00)
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) Storage.unlockAchievement("night_owl", "🦉 Trasnochador");

        Storage.saveToHistory({ cat, seconds: state.seconds, win: true });
        Storage.saveScore(cat, state.seconds);
        
        UI.showWin();

        // --- SUBIDA A RANKING GLOBAL ---
        setTimeout(async () => {
            const userName = prompt("¡Victoria! Tu nombre para el Ranking Global:");
            if (userName && userName.trim() !== "") {
                await DB.saveGlobalScore(userName.trim(), state.seconds, cat);
                UI.showAchievementNotification("🌍 ¡Récord Global actualizado!");
            }
        }, 1200);
    }
}

function placeMines(sx, sy) {
    let p = 0;
    while (p < state.MINES) {
        let x = Math.random() * state.SIZE | 0;
        let y = Math.random() * state.SIZE | 0;
        const isNearFirstClick = Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1;
        if (state.board[x][y] === "💣" || isNearFirstClick) continue;
        state.board[x][y] = "💣"; 
        p++;
    }
    
    // Calcular números
    for (let x = 0; x < state.SIZE; x++) {
        for (let y = 0; y < state.SIZE; y++) {
            if (state.board[x][y] === "💣") continue;
            let n = 0;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < state.SIZE && ny >= 0 && ny < state.SIZE && state.board[nx][ny] === "💣") n++;
                }
            }
            state.board[x][y] = n;
        }
    }
}

function chord(x, y) {
    let f = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < state.SIZE && ny >= 0 && ny < state.SIZE && state.flagged[nx][ny]) f++;
        }
    }
    
    if (f === state.board[x][y]) {
        state.chordsCount++;
        // LOGRO: Pianista (20 chords)
        if (state.chordsCount === 20) Storage.unlockAchievement("chord_king", "🎹 Pianista");

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < state.SIZE && ny >= 0 && ny < state.SIZE && !state.flagged[nx][ny]) {
                    if (!state.revealed[nx][ny]) {
                        state.history.push({ x: nx, y: ny, type: 'reveal' });
                        reveal(nx, ny);
                    }
                }
            }
        }
    }
}

function lose(hitX, hitY) {
    state.gameOver = true;
    clearInterval(state.timer);
    
    // Actualizar estadísticas globales
    Storage.updateStats('lose', 1); 
    
    // LOGRO: Kamikaze (Acumular 50 muertes)
    if (Storage.stats.bombsExploded >= 50) Storage.unlockAchievement("boom_collector", "💥 Kamikaze");

    let cat = state.isBlitz ? "blitz" : (state.SIZE === 8 ? "easy" : "other");
    Storage.saveToHistory({ cat, seconds: state.seconds, win: false });

    const mines = [];
    for (let x = 0; x < state.SIZE; x++) {
        for (let y = 0; y < state.SIZE; y++) {
            if (state.board[x][y] === "💣") {
                if (x === hitX && y === hitY) mines.unshift({x, y});
                else mines.push({x, y});
            }
        }
    }

    mines.forEach((m, i) => {
        setTimeout(() => {
            const index = m.x * state.SIZE + m.y;
            const cell = state.cellsDOM[index];
            if (cell) {
                cell.classList.add('revealed', 'bomb-explosion');
                cell.textContent = UI.getMineIcon(); 
            }
            if (i === 0) UI.playSound('boom');
            if (i === mines.length - 1) {
                setTimeout(() => UI.showLose(), 800);
            }
        }, i * 110); 
    });
}
import { state } from './state.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';
import * as DB from './db.js'; // Importamos la conexión a Supabase

export function startGame(size, mines, exp) {
    state.SIZE = size;
    state.MINES = mines;
    state.expert = exp;
    state.lastConfig = { size, mines, exp };
    state.cellsRevealedCount = 0;
    state.history = []; 
    
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
    if (state.firstClick) { placeMines(x, y); state.firstClick = false; }
    
    state.history.push({ x, y, type: 'reveal' });

    if (state.revealed[x][y]) { chord(x, y); checkWin(); return; }
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

    if (state.cellsRevealedCount === 50) {
        Storage.unlockAchievement("survivor", "Superviviente");
    }
    
    UI.renderCell(x, y, state.board[x][y]);
    
    if (state.board[x][y] === "💣") { lose(x, y); return; }
    
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
    state.history.push({ x, y, yype: 'flag' });

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
            if (state.board[x][y] !== "💣" && !state.revealed[x][y]) { win = false; break; }
        }
    }

    if (win) {
        state.gameOver = true;
        clearInterval(state.timer);
        Storage.updateStats('win'); 

        let cat = "easy";
        let achKey = "beginner";
        let achName = "Victoria en Fácil";

        if (state.isBlitz) {
            cat = "blitz";
            achKey = "speed_demon";
            achName = "Maestro Blitz";
        } else {
            if (state.SIZE === 12) {
                cat = "medium"; achKey = "intermediate"; achName = "Victoria en Medio";
            } else if (state.SIZE === 16) {
                if (state.expert) {
                    cat = "expert"; achKey = "expert"; achName = "Victoria en Experto";
                } else {
                    cat = "hard"; achKey = "hard"; achName = "Victoria en Difícil";
                }
            }
        }

        Storage.saveToHistory({ cat, seconds: state.seconds, win: true });
        Storage.saveScore(cat, state.seconds);

        // Desbloquear Logros Locales
        Storage.unlockAchievement(achKey, achName);
        Storage.unlockAchievement("perfect", "Partida Perfecta");
        if (!state.isBlitz && state.seconds < 30) Storage.unlockAchievement("speed_demon", "Flash");
        if (state.flagsUsed === 0) Storage.unlockAchievement("no_flags", "Sin Banderas");
        
        UI.showWin();

        // --- NUEVA LÓGICA GLOBAL (SUPABASE) ---
        setTimeout(async () => {
            const userName = prompt("¡Increíble! Introduce tu nombre para el Ranking Global:");
            if (userName && userName.trim() !== "") {
                const finalTime = state.seconds;
                await DB.saveGlobalScore(userName.trim(), finalTime, cat);
                UI.showAchievementNotification("¡Puntuación subida al Ranking!");
            }
        }, 1200); // Esperamos a que termine la animación de victoria
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
    Storage.updateStats('lose', 1); 

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
            document.getElementById('board').classList.add('shake-animation');
            if (typeof UI.playSound === 'function') UI.playSound('boom');
            if (i === mines.length - 1) {
                setTimeout(() => UI.showLose(), 800);
            }
        }, i * 110); 
    });
}
import { state } from './state.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';

export function startGame(size, mines, exp) {
    state.SIZE = size;
    state.MINES = mines;
    state.expert = exp;
    state.lastConfig = { size, mines, exp };
    state.cellsRevealedCount = 0;
    
    state.board = [...Array(size)].map(() => Array(size).fill(0));
    state.revealed = [...Array(size)].map(() => Array(size).fill(false));
    state.flagged = [...Array(size)].map(() => Array(size).fill(false));
    state.gameOver = false;
    state.firstClick = true;
    state.seconds = 0;
    state.flagsUsed = 0;

    clearInterval(state.timer);
    state.timer = setInterval(() => { if (!state.gameOver) { state.seconds++; UI.updateDisplay(); } }, 1000);

    UI.showScreen('game');
    UI.updateDisplay();
    UI.createBoard(size, clickCell, toggleFlag);
}

function clickCell(x, y) {
    if (state.gameOver || state.flagged[x][y]) return;
    if (state.firstClick) { placeMines(x, y); state.firstClick = false; }
    if (state.revealed[x][y]) { chord(x, y); checkWin(); return; }
    reveal(x, y);
    checkWin();
}

function reveal(x, y) {
    if (state.gameOver || state.revealed[x][y] || state.flagged[x][y]) return;
    state.revealed[x][y] = true;
    state.cellsRevealedCount++;
    if (state.cellsRevealedCount >= 50) Storage.unlockAchievement("survivor", "Superviviente");
    
    UI.renderCell(x, y, state.board[x][y]);
    if (state.board[x][y] === "💣") { lose(); return; }
    
    if (state.board[x][y] === 0 && !state.expert) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < state.SIZE && ny >= 0 && ny < state.SIZE) reveal(nx, ny);
            }
        }
    }
}

function toggleFlag(x, y) {
    if (state.gameOver || state.revealed[x][y]) return;

    const cell = state.cellsDOM[x * state.SIZE + y];
    
    // Ciclo: Nada -> Bandera -> Interrogación -> Nada
    if (!state.flagged[x][y] && cell.textContent !== "❓") {
        // Poner Bandera
        state.flagged[x][y] = true;
        state.flagsUsed++;
        cell.textContent = "🚩";
    } else if (state.flagged[x][y]) {
        // Cambiar Bandera por Interrogación
        state.flagged[x][y] = false;
        state.flagsUsed--;
        cell.textContent = "❓";
    } else {
        // Quitar Interrogación
        cell.textContent = "";
    }
    
    UI.updateDisplay();
}

function checkWin() {
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
        
        // --- AÑADE ESTA LÍNEA AQUÍ ---
        Storage.updateStats('win'); 
        // -----------------------------

        let cat = "easy";
        if (state.SIZE === 12) cat = "medium";
        if (state.SIZE === 16) cat = state.expert ? "expert" : "hard";

        Storage.saveScore(cat, state.seconds);
        Storage.unlockAchievement("perfect", "Partida Perfecta");
        if (state.seconds < 30) Storage.unlockAchievement("speed_demon", "Flash");
        if (state.flagsUsed === 0) Storage.unlockAchievement("no_flags", "Sin Banderas");
        Storage.unlockAchievement(cat === "expert" ? "expert" : cat === "hard" ? "hard" : cat === "medium" ? "intermediate" : "beginner", "Victoria en " + cat);
        
        UI.showWin();
    }
}

function placeMines(sx, sy) {
    let p = 0;
    while (p < state.MINES) {
        let x = Math.random() * state.SIZE | 0;
        let y = Math.random() * state.SIZE | 0;

        // Comprobamos que no haya bomba Y que no esté en el área de 3x3 del clic inicial
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
                if (nx >= 0 && nx < state.SIZE && ny >= 0 && ny < state.SIZE && !state.flagged[nx][ny]) reveal(nx, ny);
            }
        }
    }
}

function lose(hitX, hitY) {
    state.gameOver = true;
    clearInterval(state.timer);

    // --- AÑADE ESTA LÍNEA AQUÍ ---
    // Registra la derrota y suma 1 bomba explotada
    Storage.updateStats('lose', 1); 
    // -----------------------------

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
            cell.classList.add('revealed', 'bomb-explosion');
            cell.textContent = "💣";
            if (typeof UI.playSound === 'function') UI.playSound('boom');
            if (i === mines.length - 1) {
                setTimeout(() => UI.showLose(), 800);
            }
        }, i * 110); 
    });
}
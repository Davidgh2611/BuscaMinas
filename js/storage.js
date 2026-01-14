// js/storage.js

// --- ESTADÍSTICAS ---
export const stats = JSON.parse(localStorage.getItem("stats")) || {
    gamesPlayed: 0,
    wins: 0,
    bombsExploded: 0,
    currentStreak: 0,
    maxStreak: 0
};

export function saveStats() {
    localStorage.setItem("stats", JSON.stringify(stats));
}

export function updateStats(type, bombs = 0) {
    stats.gamesPlayed++;
    if (type === 'win') {
        stats.wins++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    } else {
        stats.bombsExploded += (bombs || 1); // Si no se pasa número, cuenta como 1
        stats.currentStreak = 0;
    }
    saveStats();
}

// --- LOGROS ---
export const achievements = JSON.parse(localStorage.getItem("achievements")) || {
    beginner: false, intermediate: false, hard: false, expert: false,
    speed_demon: false, no_flags: false, survivor: false, perfect: false
};

export function saveAch() {
    localStorage.setItem("achievements", JSON.stringify(achievements));
}

// IMPORTANTE: Importación dinámica para evitar el error de "referencia circular"
// ya que UI importa Storage y Storage importa UI.
export async function unlockAchievement(key, name) {
    if (!achievements[key]) {
        achievements[key] = true;
        saveAch();
        const UI = await import('./ui.js');
        UI.showAchievementNotification(name);
    }
}

// --- RANKINGS (MEJORES TIEMPOS) ---
export let rankings = JSON.parse(localStorage.getItem("rankings")) || {
    easy: [], medium: [], hard: [], expert: [], blitz: []
};

export function saveScore(category, time) {
    if (!rankings[category]) rankings[category] = [];
    
    rankings[category].push(time);
    rankings[category].sort((a, b) => a - b);
    rankings[category] = rankings[category].slice(0, 5);
    
    localStorage.setItem("rankings", JSON.stringify(rankings));
}

// --- HISTORIAL DETALLADO (Últimas 10 partidas) ---
export function saveToHistory(data) {
    let history = JSON.parse(localStorage.getItem('game_history') || '[]');
    const newEntry = {
        fecha: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        tiempo: data.seconds,
        dificultad: data.cat,
        resultado: data.win ? 'Victoria' : 'Derrota'
    };
    
    history.unshift(newEntry); 
    if (history.length > 10) history.pop(); 
    
    localStorage.setItem('game_history', JSON.stringify(history));
}

export function getHistory() {
    return JSON.parse(localStorage.getItem('game_history') || '[]');
}
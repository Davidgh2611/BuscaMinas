// js/storage.js
import { state } from './state.js';

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
    
    // SINCRONIZACIÓN NUBE: Si el usuario está logueado (state.playerName no es null), subimos stats
    if (state.playerName) {
        import('./db.js').then(DB => {
            DB.syncUserData(state.playerName, achievements, stats);
        });
    }
}

export function updateStats(type, bombs = 0) {
    stats.gamesPlayed++;
    if (type === 'win') {
        stats.wins++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    } else {
        stats.bombsExploded += (bombs || 1);
        stats.currentStreak = 0;
    }
    saveStats();
}

// --- LOGROS ---
export const achievements = JSON.parse(localStorage.getItem("achievements")) || {
    beginner: false, intermediate: false, hard: false, expert: false,
    speed_demon: false, no_flags: false, survivor: false, perfect: false,
    sonic: false, blitz_master: false, patience: false, lucky_guess: false,
    miner_100: false, miner_1000: false, streak_3: false, night_owl: false
};

export function saveAch() {
    localStorage.setItem("achievements", JSON.stringify(achievements));
    
    // SINCRONIZACIÓN NUBE: Si el usuario está logueado, subimos logros
    if (state.playerName) {
        import('./db.js').then(DB => {
            DB.syncUserData(state.playerName, achievements, stats);
        });
    }
}

export async function unlockAchievement(key, name) {
    if (achievements[key]) return;
    
    achievements[key] = true;
    saveAch();
    
    // Importamos UI justo cuando lo necesitamos para evitar referencias circulares
    const UI = await import('./ui.js');
    UI.showAchievementNotification(name);
}

// --- RANKINGS (MEJORES TIEMPOS LOCALES) ---
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

// --- GESTIÓN DE DATOS DE USUARIO / NUBE ---

export function setCloudData(cloudAchievements, cloudStats) {
    // 1. Limpiamos los objetos actuales para que no queden datos de sesiones anteriores
    for (let key in achievements) delete achievements[key];
    for (let key in stats) delete stats[key];

    // 2. Definimos estructuras por defecto
    const defaultStats = {
        gamesPlayed: 0,
        wins: 0,
        bombsExploded: 0,
        currentStreak: 0,
        maxStreak: 0
    };
    
    const defaultAch = {
        beginner: false, intermediate: false, hard: false, expert: false,
        speed_demon: false, no_flags: false, survivor: false, perfect: false,
        sonic: false, blitz_master: false, patience: false, lucky_guess: false,
        miner_100: false, miner_1000: false, streak_3: false, night_owl: false
    };

    // 3. Inyectamos los datos de la nube o los valores por defecto
    Object.assign(achievements, cloudAchievements || defaultAch);
    Object.assign(stats, cloudStats || defaultStats);

    // 4. Sincronizamos con el LocalStorage para que la UI refleje los cambios
    localStorage.setItem("achievements", JSON.stringify(achievements));
    localStorage.setItem("stats", JSON.stringify(stats));
}
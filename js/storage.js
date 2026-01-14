// js/storage.js

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
        stats.bombsExploded += bombs;
        stats.currentStreak = 0;
    }
    saveStats();
}

export const achievements = JSON.parse(localStorage.getItem("achievements")) || {
    beginner: false, intermediate: false, hard: false, expert: false,
    speed_demon: false, no_flags: false, survivor: false, perfect: false
};

export let rankings = JSON.parse(localStorage.getItem("rankings")) || {
    easy: [], medium: [], hard: [], expert: []
};

export function saveAch() {
    localStorage.setItem("achievements", JSON.stringify(achievements));
}

// NUEVA LÓGICA: Guardar solo los mejores 5
export function saveScore(category, time) {
    if (!rankings[category]) rankings[category] = [];
    
    rankings[category].push(time);
    // Ordenar de menor a mayor tiempo
    rankings[category].sort((a, b) => a - b);
    // Quedarse solo con los 5 mejores
    rankings[category] = rankings[category].slice(0, 5);
    
    localStorage.setItem("rankings", JSON.stringify(rankings));
}

import * as UI from './ui.js';
export function unlockAchievement(key, name) {
    if (!achievements[key]) {
        achievements[key] = true;
        saveAch();
        UI.showAchievementNotification(name);
    }
}
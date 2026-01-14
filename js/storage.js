// js/storage.js

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
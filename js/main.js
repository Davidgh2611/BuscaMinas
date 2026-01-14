import * as UI from './ui.js';
import * as Game from './game.js';
import { state } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando Buscaminas...");

    // Función para asignar eventos sin errores
    const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
        else console.warn(`No se encontró el elemento: ${id}`);
    };

    // Skins
    bind('skin-clasico', () => UI.setSkin('clasico'));
    bind('skin-moderno', () => UI.setSkin('moderno'));
    bind('skin-minimal', () => UI.setSkin('minimal'));

    // Dificultades
    bind('btn-easy',   () => Game.startGame(8, 10, false));
    bind('btn-medium', () => Game.startGame(12, 25, false));
    bind('btn-hard',   () => Game.startGame(16, 50, false));
    bind('btn-expert', () => Game.startGame(16, 50, true));

    // Menús
    bind('btn-achievements', UI.renderAchievements);
    bind('btn-ranking', UI.renderRanking);
    bind('btn-home-game', () => UI.showScreen('menu'));
    bind('btn-stats', UI.renderStats);

    // Botones con clases (Restart y Home en modales)
    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.onclick = () => UI.showScreen('menu');
    });

    document.querySelectorAll('.btn-restart').forEach(btn => {
        btn.onclick = () => Game.startGame(state.lastConfig.size, state.lastConfig.mines, state.lastConfig.expert);
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.onclick = () => btn.closest('.modal').style.display = 'none';
    });

    // Cargar skin inicial
    UI.setSkin(localStorage.getItem("skin") || "moderno");
});
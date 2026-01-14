import * as UI from './ui.js';
import * as Game from './game.js';
import { state } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando Buscaminas Pro...");

    // Función para asignar eventos de forma segura
    const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };

    // --- SISTEMA DE SKINS ---
    bind('skin-clasico', () => UI.setSkin('clasico'));
    bind('skin-moderno', () => UI.setSkin('moderno'));
    bind('skin-minimal', () => UI.setSkin('minimal'));
    bind('skin-winter', () => UI.setSkin('winter'));
    bind('skin-halloween', () => UI.setSkin('halloween'));
    bind('skin-cyberpunk', () => UI.setSkin('cyberpunk')); // Nueva skin Cyberpunk

    // --- DIFICULTADES (Resetean el modo Blitz) ---
    const startNormalGame = (s, m, e) => {
        state.isBlitz = false; // Desactivar Blitz al jugar normal
        Game.startGame(s, m, e);
    };

    bind('btn-easy',   () => startNormalGame(8, 10, false));
    bind('btn-medium', () => startNormalGame(12, 25, false));
    bind('btn-hard',   () => startNormalGame(16, 50, false));
    bind('btn-expert', () => startNormalGame(16, 50, true));
    
    // --- MODO BLITZ ---
    bind('btn-blitz', () => {
        console.log("Iniciando Modo Blitz...");
        Game.startBlitz(10, 15); // Tablero 10x10, 15 minas
    });

    // --- MODO PERSONALIZADO ---
    bind('btn-custom', () => document.getElementById('customModal').style.display = 'flex');
    bind('btn-start-custom', () => {
        const size = parseInt(document.getElementById('custom-size').value);
        const mines = parseInt(document.getElementById('custom-mines').value);
        if (size >= 8 && size <= 30 && mines < size * size) {
            document.getElementById('customModal').style.display = 'none';
            state.isBlitz = false;
            Game.startGame(size, mines, false);
        } else {
            alert("Configuración no válida (Mínimo 8x8, las minas no pueden superar el tablero)");
        }
    });

    // --- SISTEMA DE REPLAY ---
    document.querySelectorAll('.btn-replay, #btn-replay').forEach(btn => {
        btn.onclick = () => UI.runReplay();
    });

    // --- MENÚS Y ESTADÍSTICAS ---
    bind('btn-achievements', UI.renderAchievements);
    bind('btn-ranking', UI.renderRanking);
    bind('btn-stats', UI.renderStats);
    bind('btn-home-game', () => UI.showScreen('menu'));
    
    // --- TUTORIAL ---
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal && !localStorage.getItem('seenTutorial')) {
        setTimeout(() => {
            tutorialModal.style.display = 'flex';
        }, 1000);
    }

    const closeTutorial = () => {
        if (tutorialModal) tutorialModal.style.display = 'none';
        localStorage.setItem('seenTutorial', 'true');
    };

    bind('btn-close-tutorial', closeTutorial);
    const closeBtnTutorial = document.querySelector('.close-tutorial');
    if (closeBtnTutorial) closeBtnTutorial.onclick = closeTutorial;

    // --- BOTONES DINÁMICOS (Restart y Home) ---
    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            UI.showScreen('menu');
        };
    });

    document.querySelectorAll('.btn-restart').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            // Si el anterior era Blitz, reiniciamos Blitz
            if (state.isBlitz) {
                Game.startBlitz(state.lastConfig.size, state.lastConfig.mines);
            } else {
                Game.startGame(state.lastConfig.size, state.lastConfig.mines, state.lastConfig.expert);
            }
        };
    });
    
    // Cerrar modales genéricos
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.onclick = () => btn.closest('.modal').style.display = 'none';
    });

    // Cargar skin inicial guardada
    UI.setSkin(localStorage.getItem("skin") || "moderno");
});


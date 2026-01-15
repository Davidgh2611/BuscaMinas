import * as UI from './ui.js';
import * as Game from './game.js';
import { state } from './state.js';
import * as DB from './db.js'; // Importamos DB para las consultas globales

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando Buscaminas Pro con Ranking Global...");

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
    bind('skin-cyberpunk', () => UI.setSkin('cyberpunk'));

    // --- DIFICULTADES ---
    const startNormalGame = (s, m, e) => {
        state.isBlitz = false;
        Game.startGame(s, m, e);
    };

    bind('btn-easy',   () => startNormalGame(8, 10, false));
    bind('btn-medium', () => startNormalGame(12, 25, false));
    bind('btn-hard',   () => startNormalGame(16, 50, false));
    bind('btn-expert', () => startNormalGame(16, 50, true));
    
    // --- BOTONES DE METADATOS Y MODALES ---
    bind('btn-history-modal', () => UI.renderHistory());
    bind('btn-blitz', () => Game.startBlitz(10, 15));
    bind('btn-achievements', UI.renderAchievements);
    bind('btn-ranking', UI.renderRanking); // Récords locales
    bind('btn-stats', UI.renderStats);
    bind('btn-home-game', () => UI.showScreen('menu'));

    // --- NUEVO: RANKING GLOBAL (SUPABASE) ---
    bind('btn-ranking-global', () => {
        // Mostramos el modal y cargamos la categoría 'easy' por defecto
        document.getElementById('globalRankModal').style.display = 'flex';
        UI.renderGlobalRank('easy'); 
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

    // Exponer UI al objeto window para que los botones del HTML (onclick) funcionen
    window.UI = UI;

    // Cargar skin inicial guardada
    UI.setSkin(localStorage.getItem("skin") || "moderno");
});
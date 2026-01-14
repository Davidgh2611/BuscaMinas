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

    // --- SISTEMA DE SKINS (Incluye estacionales) ---
    bind('skin-clasico', () => UI.setSkin('clasico'));
    bind('skin-moderno', () => UI.setSkin('moderno'));
    bind('skin-minimal', () => UI.setSkin('minimal'));
    bind('skin-winter', () => UI.setSkin('winter'));    // Nueva skin
    bind('skin-halloween', () => UI.setSkin('halloween')); // Nueva skin

    // --- DIFICULTADES ---
    bind('btn-easy',   () => Game.startGame(8, 10, false));
    bind('btn-medium', () => Game.startGame(12, 25, false));
    bind('btn-hard',   () => Game.startGame(16, 50, false));
    bind('btn-expert', () => Game.startGame(16, 50, true));
    
    // --- MODO PERSONALIZADO ---
    bind('btn-custom', () => document.getElementById('customModal').style.display = 'flex');
    bind('btn-start-custom', () => {
        const size = parseInt(document.getElementById('custom-size').value);
        const mines = parseInt(document.getElementById('custom-mines').value);
        if (size >= 8 && size <= 30 && mines < size * size) {
            document.getElementById('customModal').style.display = 'none';
            Game.startGame(size, mines, false);
        } else {
            alert("Configuración no válida (Mínimo 8x8, las minas no pueden superar el tablero)");
        }
    });

    // --- SISTEMA DE REPLAY ---
    // Esto conectará cualquier botón que tenga la clase 'btn-replay' o el ID 'btn-replay'
    document.querySelectorAll('.btn-replay, #btn-replay').forEach(btn => {
        btn.onclick = () => UI.runReplay();
    });

    // --- MENÚS Y ESTADÍSTICAS ---
    bind('btn-achievements', UI.renderAchievements);
    bind('btn-ranking', UI.renderRanking);
    bind('btn-stats', UI.renderStats);
    bind('btn-home-game', () => UI.showScreen('menu'));
    

    // Lógica para el Tutorial Rápido
    const tutorialModal = document.getElementById('tutorialModal');
    const hasSeenTutorial = localStorage.getItem('seenTutorial');

    // Solo mostrar si no lo ha visto antes
    if (!hasSeenTutorial) {
        setTimeout(() => {
            tutorialModal.style.display = 'flex';
        }, 1000); // Aparece un segundo después de cargar para no agobiar
    }

    const closeTutorial = () => {
        tutorialModal.style.display = 'none';
        localStorage.setItem('seenTutorial', 'true');
    };

    document.getElementById('btn-close-tutorial').onclick = closeTutorial;
    document.querySelector('.close-tutorial').onclick = closeTutorial;

    // --- BOTONES DINÁMICOS (Restart y Home en modales) ---
    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.onclick = () => {
            // Cerramos modales antes de volver al menú
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            UI.showScreen('menu');
        };
    });

    document.querySelectorAll('.btn-restart').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            Game.startGame(state.lastConfig.size, state.lastConfig.mines, state.lastConfig.expert);
        };
    });

    // Cerrar cualquier modal con un botón genérico de cerrar
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.onclick = () => btn.closest('.modal').style.display = 'none';
    });

    // Cargar skin inicial guardada
    UI.setSkin(localStorage.getItem("skin") || "moderno");
});
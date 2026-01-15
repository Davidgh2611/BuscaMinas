import * as UI from './ui.js';
import * as Game from './game.js';
import { state } from './state.js';
import * as DB from './db.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando Buscaminas Pro con Ranking Global...");

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
        state.isDuel = false; // Desactivar duelo si se elige dificultad normal
        Game.startGame(s, m, e);
    };

    bind('btn-easy',   () => startNormalGame(8, 10, false));
    bind('btn-medium', () => startNormalGame(12, 25, false));
    bind('btn-hard',   () => startNormalGame(16, 50, false));
    bind('btn-expert', () => startNormalGame(16, 50, true));
    
    bind('btn-history-modal', () => UI.renderHistory());
    bind('btn-blitz', () => Game.startBlitz(10, 15));
    bind('btn-achievements', UI.renderAchievements);
    bind('btn-ranking', UI.renderRanking);
    bind('btn-stats', UI.renderStats);
    bind('btn-home-game', () => UI.showScreen('menu'));

    bind('btn-ranking-global', () => {
        document.getElementById('globalRankModal').style.display = 'flex';
        UI.renderGlobalRank('easy'); 
    });

    // --- MODO DUELO (SALA Y LINKS) ---
    bind('btn-create-duel', () => {
        const roomId = Math.random().toString(36).substring(2, 8);
        const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        const input = document.getElementById('duel-url');
        input.value = inviteUrl;
        document.getElementById('duel-link-container').style.display = 'block';
    });

    bind('btn-copy-link', () => {
        const copyText = document.getElementById('duel-url');
        copyText.select();
        navigator.clipboard.writeText(copyText.value);
        alert("¡Link de duelo copiado!");
    });

    // --- DETECTAR SALA DE DUELO AL CARGAR ---
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');

    if (room) {
        state.isDuel = true;
        state.roomID = room;
        // Mostramos la UI de duelo
        document.getElementById('duel-header').style.display = 'flex';
        document.getElementById('duel-chat').style.display = 'flex';
        
        // CORRECCIÓN DEL ERROR: Definimos el argumento como 'msg' para evitar confusiones
        DB.joinDuel(room, (msg) => {
            if (msg.type === 'reveal') {
                state.opponentScore += 10;
                UI.updateDuelScore();
                UI.createParticles(msg.x, msg.y); 
            } else if (msg.type === 'chat') {
                UI.showReaction(msg.text);
            }
        });
        
        // Iniciamos un juego estándar para el duelo
        Game.startGame(12, 25, false);
    }

    // --- MODO PERSONALIZADO ---
    bind('btn-custom', () => document.getElementById('customModal').style.display = 'flex');
    bind('btn-start-custom', () => {
        const size = parseInt(document.getElementById('custom-size').value);
        const mines = parseInt(document.getElementById('custom-mines').value);
        if (size >= 8 && size <= 30 && mines < size * size) {
            document.getElementById('customModal').style.display = 'none';
            state.isBlitz = false;
            Game.startGame(size, mines, false);
        }
    });

    // --- REPLAY Y RESTART ---
    document.querySelectorAll('.btn-replay, #btn-replay').forEach(btn => {
        btn.onclick = () => UI.runReplay();
    });

    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.onclick = () => {
            if (state.isDuel) window.location.href = window.location.pathname; // Limpiar URL de sala
            UI.showScreen('menu');
        };
    });

    document.querySelectorAll('.btn-restart').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            if (state.isBlitz) Game.startBlitz(state.lastConfig.size, state.lastConfig.mines);
            else Game.startGame(state.lastConfig.size, state.lastConfig.mines, state.lastConfig.expert);
        };
    });
    
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.onclick = () => btn.closest('.modal').style.display = 'none';
    });

    window.UI = UI;
    UI.setSkin(localStorage.getItem("skin") || "moderno");
});
import * as UI from './ui.js';
import * as Game from './game.js';
import { state } from './state.js';
import * as DB from './db.js';
import * as Storage from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando Buscaminas Pro con Sistema de Cuentas...");

    const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };

    // Función para bloquear/desbloquear el acceso visual
    const setGameLock = (locked) => {
        const targets = ['.difficulty-group', '.meta-buttons', '#duel-setup'];
        targets.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                locked ? el.classList.add('game-locked') : el.classList.remove('game-locked');
            }
        });
    };

    // --- GESTOR DE INTERFAZ CENTRALIZADO (Versión Anti-Parpadeo F5) ---
    const refreshUIState = () => {
        const savedUser = localStorage.getItem("session_user");
        const isGuest = localStorage.getItem("is_guest") === "true";
        
        const loggedOutDiv = document.getElementById('auth-logged-out');
        const loggedInDiv = document.getElementById('auth-logged-in');
        const gameMenu = document.getElementById('main-game-menu');
        const displayUserEl = document.getElementById('display-username');

        // Si los elementos críticos no existen aún (carga lenta), reintentamos brevemente
        if (!loggedOutDiv || !gameMenu || !loggedInDiv) {
            setTimeout(refreshUIState, 10);
            return;
        }

        if (savedUser || isGuest) {
            // ESTADO: SESIÓN ACTIVA
            state.playerName = savedUser || "Invitado (Local)";
            
            // Ocultar login con prioridad y mostrar menú
            loggedOutDiv.style.setProperty('display', 'none', 'important');
            loggedInDiv.style.display = 'block';
            
            gameMenu.style.display = 'block'; 
            gameMenu.style.opacity = '1';
            
            if (displayUserEl) displayUserEl.textContent = state.playerName;
            setGameLock(false);
            console.log("🔄 Sesión sincronizada:", state.playerName);
        } else {
            // ESTADO: REQUIERE LOGIN
            // Ocultar menú con prioridad y mostrar login
            gameMenu.style.setProperty('display', 'none', 'important');
            loggedInDiv.style.display = 'none';
            
            loggedOutDiv.style.display = 'block';
            
            setGameLock(true);
        }
    };

    // Lanzar la restauración de interfaz inmediatamente
    refreshUIState();

    // --- SISTEMA DE AUTENTICACIÓN ---
    
    bind('btn-register', async () => {
        // Verificamos conexión antes de proceder
        DB.getClient(); 
        
        const u = document.getElementById('auth-username').value.trim();
        const p = document.getElementById('auth-password').value.trim();
        if (!u || !p) return alert("Por favor, rellena usuario y contraseña.");

        try {
            await DB.registerUser(u, p);
            alert("✅ Registro exitoso. ¡Ya puedes iniciar sesión!");
        } catch (e) {
            alert("❌ Error: " + e.message);
        }
    });

    bind('btn-login', async () => {
        // Verificamos conexión antes de proceder
        DB.getClient();

        const u = document.getElementById('auth-username').value.trim();
        const p = document.getElementById('auth-password').value.trim();
        if (!u || !p) return alert("Introduce tus credenciales.");

        try {
            const userData = await DB.loginUser(u, p);
            state.playerName = userData.username;
            localStorage.setItem("session_user", userData.username);
            localStorage.removeItem("is_guest");
            
            if (userData.achievements && userData.stats) {
                Storage.setCloudData(userData.achievements, userData.stats);
            }
            
            refreshUIState(); // Actualizamos la vista tras login exitoso
            console.log("🔓 Sesión iniciada para: " + userData.username);
        } catch (e) {
            alert("❌ " + e.message);
        }
    });

    bind('btn-guest', () => {
        state.playerName = "Invitado (Local)"; 
        localStorage.setItem("is_guest", "true");
        localStorage.removeItem("session_user");
        refreshUIState();
        console.log("Modo invitado activo.");
    });

    bind('btn-logout', () => {
        if(confirm("¿Cerrar sesión? Los datos locales se limpiarán.")) {
            localStorage.removeItem("session_user");
            localStorage.removeItem("is_guest");
            localStorage.removeItem("achievements");
            localStorage.removeItem("stats");
            localStorage.removeItem("rankings");
            localStorage.removeItem("game_history");
            location.reload(); 
        }
    });

    // --- SISTEMA DE TEMAS ---
    const skinSelect = document.getElementById('skin-select');
    const themeSample = document.getElementById('theme-sample');
    const themeColors = {
        moderno: '#3498db', winter: '#ffffff', halloween: '#ff6600',
        cyberpunk: '#ffcc00', clasico: '#bdbdbd', minimal: '#333333'
    };

    const updateThemePreview = (skin) => {
        if (themeSample && themeColors[skin]) {
            themeSample.style.backgroundColor = themeColors[skin];
        }
    };

    if (skinSelect) {
        const currentSkin = localStorage.getItem("skin") || "moderno";
        skinSelect.value = currentSkin;
        UI.setSkin(currentSkin);
        updateThemePreview(currentSkin);
        skinSelect.onchange = (e) => {
            const selectedSkin = e.target.value;
            UI.setSkin(selectedSkin);
            updateThemePreview(selectedSkin);
        };
    }

    // --- DIFICULTADES Y MODOS ---
    const startNormalGame = (s, m, e, modeName) => {
        state.isBlitz = false;
        state.isDuel = false;
        state.currentMode = modeName; 
        Game.startGame(s, m, e);
    };

    bind('btn-easy',   () => startNormalGame(8, 10, false, 'easy'));
    bind('btn-medium', () => startNormalGame(12, 25, false, 'medium'));
    bind('btn-hard',   () => startNormalGame(16, 50, false, 'hard'));
    bind('btn-expert', () => startNormalGame(16, 50, true, 'expert'));
    
    bind('btn-history-modal', () => UI.renderHistory());
    bind('btn-blitz', () => {
        state.currentMode = 'blitz'; 
        Game.startBlitz(10, 15);
    });
    bind('btn-achievements', UI.renderAchievements);
    bind('btn-ranking', UI.renderRanking);
    bind('btn-stats', UI.renderStats);
    bind('btn-home-game', () => UI.showScreen('menu'));

    bind('btn-ranking-global', () => {
        DB.getClient(); // Asegurar conexión para el ranking
        const modal = document.getElementById('globalRankModal');
        if (modal) modal.style.display = 'flex';
        UI.renderGlobalRank('easy'); 
    });

    // --- MODO DUELO ---
    bind('btn-create-duel', () => {
        const roomId = Math.random().toString(36).substring(2, 8);
        const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        const input = document.getElementById('duel-url');
        if (input) input.value = inviteUrl;
        const container = document.getElementById('duel-link-container');
        if (container) container.style.display = 'block';
    });

    bind('btn-copy-link', () => {
        const copyText = document.getElementById('duel-url');
        if (copyText) {
            copyText.select();
            navigator.clipboard.writeText(copyText.value);
            alert("¡Link de duelo copiado!");
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');

    if (room) {
        state.isDuel = true;
        state.roomID = room;
        state.currentMode = 'duel'; 
        const duelHeader = document.getElementById('duel-header');
        const duelChat = document.getElementById('duel-chat');
        if (duelHeader) duelHeader.style.display = 'flex';
        if (duelChat) duelChat.style.display = 'flex';
        setGameLock(false);
        
        DB.joinDuel(room, (msg) => {
            if (msg.type === 'reveal') {
                state.opponentScore += 10;
                UI.updateDuelScore();
                UI.createParticles(msg.x, msg.y); 
            } else if (msg.type === 'chat') {
                UI.showReaction(msg.text);
            }
        });
        Game.startGame(12, 25, false);
    }

    // --- MODO PERSONALIZADO ---
    bind('btn-custom', () => {
        const modal = document.getElementById('customModal');
        if (modal) modal.style.display = 'flex';
    });
    bind('btn-start-custom', () => {
        const sizeInput = document.getElementById('custom-size');
        const minesInput = document.getElementById('custom-mines');
        if (sizeInput && minesInput) {
            const size = parseInt(sizeInput.value);
            const mines = parseInt(minesInput.value);
            if (size >= 8 && size <= 30 && mines < size * size) {
                const modal = document.getElementById('customModal');
                if (modal) modal.style.display = 'none';
                state.isBlitz = false;
                state.currentMode = 'custom'; 
                Game.startGame(size, mines, false);
            }
        }
    });

    // --- REPLAY Y RESTART ---
    document.querySelectorAll('.btn-replay, #btn-replay').forEach(btn => {
        btn.onclick = () => UI.runReplay();
    });

    document.querySelectorAll('.btn-home').forEach(btn => {
        btn.onclick = () => {
            if (state.isDuel) window.location.href = window.location.pathname;
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
        btn.onclick = () => {
            const modal = btn.closest('.modal');
            if (modal) modal.style.display = 'none';
        };
    });

    window.UI = UI;
});
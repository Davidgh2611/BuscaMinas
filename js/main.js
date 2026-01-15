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

    // Función para bloquear/desbloquear el acceso al juego y mostrar el menú principal
    const setGameLock = (locked) => {
        const gameMenu = document.getElementById('main-game-menu');
        const targets = ['.difficulty-group', '.meta-buttons', '#duel-setup'];
        
        if (locked) {
            if (gameMenu) gameMenu.style.display = 'none';
            targets.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.classList.add('game-locked');
            });
        } else {
            if (gameMenu) {
                gameMenu.style.display = 'block';
                gameMenu.style.opacity = '1';
            }
            targets.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.classList.remove('game-locked');
            });
        }
    };

    // Bloquear al inicio hasta que elija una opción
    setGameLock(true);

    // --- SISTEMA DE AUTENTICACIÓN ---
    
    bind('btn-register', async () => {
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
        const u = document.getElementById('auth-username').value.trim();
        const p = document.getElementById('auth-password').value.trim();
        if (!u || !p) return alert("Introduce tus credenciales.");

        try {
            const userData = await DB.loginUser(u, p);
            
            // Sincronización de estado global
            state.playerName = userData.username;
            
            // Si el login provee stats/logros, los cargamos
            if (userData.achievements && userData.stats) {
                Storage.setCloudData(userData.achievements, userData.stats);
            }
            
            document.getElementById('auth-logged-out').style.display = 'none';
            document.getElementById('auth-logged-in').style.display = 'block';
            document.getElementById('display-username').textContent = userData.username;
            
            setGameLock(false); 
            console.log("🔓 Sesión iniciada para: " + userData.username);
        } catch (e) {
            alert("❌ " + e.message);
        }
    });

    bind('btn-guest', () => {
        state.playerName = "Invitado (Local)"; 
        document.getElementById('auth-logged-out').style.display = 'none';
        document.getElementById('auth-logged-in').style.display = 'block';
        document.getElementById('display-username').textContent = state.playerName;
        
        setGameLock(false); 
        console.log("Modo invitado: Los datos se guardarán bajo el nombre 'Invitado'.");
    });

    bind('btn-logout', () => {
        if(confirm("¿Cerrar sesión? Los datos locales se limpiarán.")) {
            localStorage.removeItem("achievements");
            localStorage.removeItem("stats");
            localStorage.removeItem("rankings");
            localStorage.removeItem("game_history");
            location.reload(); 
        }
    });

    // --- SISTEMA DE TEMAS (DESPLEGABLE CON PREVIEW) ---
    const skinSelect = document.getElementById('skin-select');
    const themeSample = document.getElementById('theme-sample');

    const themeColors = {
        moderno: '#3498db',
        winter: '#ffffff',
        halloween: '#ff6600',
        cyberpunk: '#ffcc00',
        clasico: '#bdbdbd',
        minimal: '#333333'
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

    // --- DIFICULTADES ---
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
        state.currentMode = 'duel'; 
        document.getElementById('duel-header').style.display = 'flex';
        document.getElementById('duel-chat').style.display = 'flex';
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
    bind('btn-custom', () => document.getElementById('customModal').style.display = 'flex');
    bind('btn-start-custom', () => {
        const size = parseInt(document.getElementById('custom-size').value);
        const mines = parseInt(document.getElementById('custom-mines').value);
        if (size >= 8 && size <= 30 && mines < size * size) {
            document.getElementById('customModal').style.display = 'none';
            state.isBlitz = false;
            state.currentMode = 'custom'; 
            Game.startGame(size, mines, false);
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
        btn.onclick = () => btn.closest('.modal').style.display = 'none';
    });

    window.UI = UI;
});
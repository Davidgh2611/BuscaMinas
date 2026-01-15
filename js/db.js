// js/db.js
const SUPABASE_URL = "https://slsydjcxfuxawinnyfdz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bvs1GQADBZY_knrB7qdrgA_LO6NKwk5";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SISTEMA DE USUARIO Y CONTRASEÑA ---

/**
 * Registra un nuevo usuario en la tabla 'profiles'
 */
export async function registerUser(username, password) {
    // 1. Verificar si el usuario ya existe
    const { data: existing } = await supabaseClient
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

    if (existing) throw new Error("El nombre de usuario ya está ocupado.");

    // 2. Insertar nuevo usuario con valores iniciales
    const { error } = await supabaseClient
        .from('profiles')
        .insert([{ 
            username, 
            password, 
            achievements: {}, 
            stats: { wins: 0, gamesPlayed: 0, bombsExploded: 0 } 
        }]);

    if (error) throw error;
    return true;
}

/**
 * Valida las credenciales y devuelve los datos del usuario
 */
export async function loginUser(username, password) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (error || !data) throw new Error("Usuario o contraseña incorrectos.");
    
    return data; // Devuelve {username, achievements, stats...}
}

/**
 * Sincroniza los logros y stats locales con la base de datos
 */
export async function syncUserData(username, achievements, stats) {
    const { error } = await supabaseClient
        .from('profiles')
        .update({ achievements, stats })
        .eq('username', username);

    if (error) console.error('Error en sincronización:', error.message);
}

// --- RANKING GLOBAL ---

export async function saveGlobalScore(nombre, tiempo, categoria) {
    const { data, error } = await supabaseClient
        .from('rankings_global')
        .insert([{ nombre, tiempo, categoria }]);

    if (error) {
        console.error('Error al guardar en Supabase:', error.message);
        return null;
    }
    return data;
}

export async function getGlobalRankings(categoria) {
    const { data, error } = await supabaseClient
        .from('rankings_global')
        .select('*')
        .eq('categoria', categoria)
        .order('tiempo', { ascending: true })
        .limit(10);

    if (error) {
        console.error('Error al obtener rankings:', error.message);
        return [];
    }
    return data;
}

// --- MODO DUELO (BROADCAST) ---

let duelChannel = null;

export function joinDuel(roomID, onMessageReceived) {
    duelChannel = supabaseClient.channel(`duel_${roomID}`, {
        config: { broadcast: { self: false } }
    });

    duelChannel
        .on('broadcast', { event: 'move' }, (payload) => {
            onMessageReceived(payload.payload);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log("Conectado al duelo en sala:", roomID);
            }
        });
}

export function sendMove(moveData) {
    if (duelChannel) {
        duelChannel.send({
            type: 'broadcast',
            event: 'move',
            payload: moveData
        });
    }
}
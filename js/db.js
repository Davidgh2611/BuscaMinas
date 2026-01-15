// js/db.js
const SUPABASE_URL = "https://slsydjcxfuxawinnyfdz.supabase.co";
// La clave debe ir entre comillas porque es un texto (String)
const SUPABASE_ANON_KEY = "sb_publishable_bvs1GQADBZY_knrB7qdrgA_LO6NKwk5";

// Cambiamos el nombre de la constante a 'supabaseClient' para evitar el error
// "Cannot access 'supabase' before initialization"
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para guardar puntuación en la nube
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

// Función para obtener los 10 mejores de una categoría
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

// js/db.js (Añade esto al final)

let duelChannel = null;

export function joinDuel(roomID, onMessageReceived) {
    // Creamos o nos unimos a una sala específica
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
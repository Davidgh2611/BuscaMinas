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
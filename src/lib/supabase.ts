import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔥 Validación
if (!supabaseUrl) throw new Error('Falta VITE_SUPABASE_URL en .env');
if (!supabaseAnonKey) throw new Error('Falta VITE_SUPABASE_ANON_KEY en .env');

// (Opcional) Log para depuración
console.log('✅ SUPABASE_URL cargada correctamente');
console.log('✅ SUPABASE_ANON_KEY cargada correctamente');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
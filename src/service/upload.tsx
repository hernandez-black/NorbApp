// src/services/upload.ts
import { supabase } from '../lib/supabase';

/**
 * Sube un archivo a Supabase Storage
 * @param file - Archivo a subir
 * @param bucket - Nombre del bucket (ej. 'ordenes-evidencias')
 * @param path - Ruta dentro del bucket (ej. 'orden-123/recepcion-foto1.jpg')
 * @returns URL pública del archivo subido
 */
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  // 🔥 CORREGIDO: solo extraemos 'error', ignoramos 'data'
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }

  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
};

/**
 * Elimina un archivo de Supabase Storage
 */
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error al eliminar archivo:', error);
    throw error;
  }
};
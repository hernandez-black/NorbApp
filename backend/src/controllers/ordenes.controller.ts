// src/controllers/ordenes.controller.ts
import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Error interno del servidor' });
};

export const getOrdenes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ordenes')
      .select('*, clientes(nombre), vehiculos(marca, modelo, placas)')
      .order('creado_en', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const getOrdenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('ordenes')
      .select(`
        *,
        clientes(*),
        vehiculos(*),
        diagnosticos(*),
        cotizaciones(*),
        refacciones(*),
        evidencias(*),
        bitacora(*),
        checklist(*),
        checklist_extra(*),
        objetos_inventario(*),
        pagos(*),
        orden_mecanicos(mecanico_id, usuarios(id, nombre, email))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const createOrden = async (req: Request, res: Response) => {
  try {
    const { data: lastOrden } = await supabase
      .from('ordenes')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1)
      .single();

    const nextNum = (lastOrden?.numero || 0) + 1;

    const { cliente_id, vehiculo_id, motivo_ingreso, tipo, responsable_recepcion, anticipo, autorizado, autorizado_por } = req.body;

    const { data, error } = await supabase
      .from('ordenes')
      .insert({
        numero: nextNum,
        cliente_id,
        vehiculo_id,
        motivo_ingreso,
        tipo: tipo || 'Preventivo',
        responsable_recepcion,
        anticipo: anticipo || 0,
        autorizado: autorizado || false,
        autorizado_por
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateOrden = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('ordenes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteOrden = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('ordenes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

export const asignarMecanico = async (req: Request, res: Response) => {
  try {
    const { ordenId, mecanicoId } = req.body;
    const { data, error } = await supabase
      .from('orden_mecanicos')
      .insert({ orden_id: ordenId, mecanico_id: mecanicoId })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const removerMecanico = async (req: Request, res: Response) => {
  try {
    const { ordenId, mecanicoId } = req.params;
    const { error } = await supabase
      .from('orden_mecanicos')
      .delete()
      .eq('orden_id', ordenId)
      .eq('mecanico_id', mecanicoId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};
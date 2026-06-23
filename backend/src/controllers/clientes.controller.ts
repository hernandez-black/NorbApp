// src/controllers/clientes.controller.ts
import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

// ── Helper para manejar errores ──
const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Error interno del servidor' });
};

export const getClientes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const getClienteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const { nombre, telefono, correo, tipo, razon_social, rfc } = req.body;
    const { data, error } = await supabase
      .from('clientes')
      .insert({ nombre, telefono, correo, tipo, razon_social, rfc })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};
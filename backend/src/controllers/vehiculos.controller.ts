// src/controllers/vehiculos.controller.ts
import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Error interno del servidor' });
};

export const getVehiculos = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*, clientes(nombre)')
      .order('marca', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const getVehiculoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*, clientes(nombre)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const createVehiculo = async (req: Request, res: Response) => {
  try {
    const { cliente_id, marca, modelo, anio, color, placas, kilometraje, vin, motor, cilindraje } = req.body;
    const { data, error } = await supabase
      .from('vehiculos')
      .insert({ cliente_id, marca, modelo, anio, color, placas, kilometraje, vin, motor, cilindraje })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateVehiculo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('vehiculos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteVehiculo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('vehiculos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};
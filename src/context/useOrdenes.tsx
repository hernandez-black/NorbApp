import { useContext } from 'react';
import { OrdenContext } from './OrdenContext';

export const useOrdenes = () => {
  const context = useContext(OrdenContext);
  if (!context) throw new Error('useOrdenes debe usarse dentro de OrdenProvider');
  return context;
};
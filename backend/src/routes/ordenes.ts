// src/routes/ordenes.ts
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import {
  getOrdenes,
  getOrdenById,
  createOrden,
  updateOrden,
  deleteOrden,
  asignarMecanico,
  removerMecanico
} from '../controllers/ordenes.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/', getOrdenes);
router.get('/:id', getOrdenById);
router.post('/', requireRole('admin'), createOrden);
router.put('/:id', requireRole('admin'), updateOrden);
router.delete('/:id', requireRole('admin'), deleteOrden);

// Asignación de mecánicos (solo admin)
router.post('/:ordenId/mecanicos', requireRole('admin'), asignarMecanico);
router.delete('/:ordenId/mecanicos/:mecanicoId', requireRole('admin'), removerMecanico);

export default router;
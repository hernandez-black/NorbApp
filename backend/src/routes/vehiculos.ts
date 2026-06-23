// src/routes/vehiculos.ts
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import {
  getVehiculos,
  getVehiculoById,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo
} from '../controllers/vehiculos.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/', getVehiculos);
router.get('/:id', getVehiculoById);
router.post('/', requireRole('admin'), createVehiculo);
router.put('/:id', requireRole('admin'), updateVehiculo);
router.delete('/:id', requireRole('admin'), deleteVehiculo);

export default router;
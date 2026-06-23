// src/routes/clientes.ts
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/clientes.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', requireRole('admin'), createCliente);
router.put('/:id', requireRole('admin'), updateCliente);
router.delete('/:id', requireRole('admin'), deleteCliente);

export default router;
// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import clientesRoutes from './routes/clientes.js';
import vehiculosRoutes from './routes/vehiculos.js';
import ordenesRoutes from './routes/ordenes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Montar rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/ordenes', ordenesRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});
const express = require('express');
const router = express.Router();
const { 
  getProductos, 
  getProductoById, 
  getEstadisticas,
  getResumenPrecios
} = require('../controllers/product.controller');

/**
 * Rutas de productos
 * Todas las rutas tienen el prefijo /productos
 */

// Ruta para obtener productos con paginación y filtrado
router.get('/', getProductos);

// Rutas para estadísticas y análisis
router.get('/estadisticas', getEstadisticas);
router.get('/analisis/precios', getResumenPrecios);

// Ruta para obtener un producto específico por ID
// Nota: Esta ruta debe ir al final para evitar conflictos con otras rutas
router.get('/:id', getProductoById);

module.exports = router;

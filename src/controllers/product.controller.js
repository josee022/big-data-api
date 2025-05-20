const db = require('../db/connection');
const { getPaginationParams, getSortParams, paginatedResponse, formatError } = require('../utils/api.utils');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Obtiene productos con paginación, filtrado y ordenación
 */
exports.getProductos = asyncHandler(async (req, res) => {
  // Obtener parámetros de paginación y ordenación usando utilidades
  const { page, limit, offset } = getPaginationParams(req);
  const validOrderFields = ['id', 'nombre', 'categoria', 'precio', 'fecha_creacion'];
  const { orderBy, orderDir } = getSortParams(req, validOrderFields);
  
  // Parámetros de filtrado
  const categoria = req.query.categoria;
  const precioMin = req.query.precioMin;
  const precioMax = req.query.precioMax;
  const busqueda = req.query.busqueda;
  
  // Construir la consulta base
  let query = 'SELECT id, nombre, categoria, precio, fecha_creacion FROM productos';
  let countQuery = 'SELECT COUNT(*) as total FROM productos';
  let queryParams = [];
  let countParams = [];
  let whereConditions = [];
  
  // Añadir condiciones de filtrado si existen
  if (categoria) {
    whereConditions.push('categoria = ?');
    queryParams.push(categoria);
    countParams.push(categoria);
  }
  
  if (precioMin) {
    whereConditions.push('precio >= ?');
    queryParams.push(parseFloat(precioMin));
    countParams.push(parseFloat(precioMin));
  }
  
  if (precioMax) {
    whereConditions.push('precio <= ?');
    queryParams.push(parseFloat(precioMax));
    countParams.push(parseFloat(precioMax));
  }
  
  if (busqueda) {
    whereConditions.push('nombre LIKE ?');
    queryParams.push(`%${busqueda}%`);
    countParams.push(`%${busqueda}%`);
  }
  
  // Añadir WHERE si hay condiciones
  if (whereConditions.length > 0) {
    const whereClause = ' WHERE ' + whereConditions.join(' AND ');
    query += whereClause;
    countQuery += whereClause;
  }
  
  // Añadir ordenación
  query += ` ORDER BY ${orderBy} ${orderDir}`;
  
  // Añadir límite y offset para paginación
  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);
  
  // Ejecutar consultas en paralelo
  const [productosResult, totalResult] = await Promise.all([
    db.query(query, queryParams),
    db.query(countQuery, countParams)
  ]);
  
  const productos = productosResult[0];
  const totalProductos = totalResult[0][0].total;
  
  // Usar utilidad para construir respuesta paginada
  res.json(paginatedResponse(productos, { page, limit }, totalProductos));
});

/**
 * Obtiene un producto por su ID
 */
exports.getProductoById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    const error = new Error('ID de producto no válido');
    error.statusCode = 400;
    throw error;
  }
  
  const [productos] = await db.query(
    'SELECT id, nombre, categoria, precio, fecha_creacion FROM productos WHERE id = ?',
    [id]
  );
  
  if (productos.length === 0) {
    const error = new Error('Producto no encontrado');
    error.statusCode = 404;
    throw error;
  }
  
  res.json(productos[0]);
});

/**
 * Obtiene estadísticas de productos por categoría
 */
exports.getEstadisticas = asyncHandler(async (req, res) => {
  // Estadísticas por categoría con optimización de consulta
  const [categorias] = await db.query(`
    SELECT 
      categoria, 
      COUNT(*) as total, 
      MIN(precio) as precio_min, 
      MAX(precio) as precio_max, 
      ROUND(AVG(precio), 2) as precio_promedio,
      SUM(precio) as valor_total
    FROM productos 
    GROUP BY categoria 
    ORDER BY total DESC
  `);
  
  // Consulta optimizada para obtener múltiples estadísticas en una sola consulta
  const [generalStats] = await db.query(`
    SELECT 
      COUNT(*) as total_productos,
      ROUND(AVG(precio), 2) as precio_promedio,
      MIN(precio) as precio_minimo,
      MAX(precio) as precio_maximo,
      SUM(precio) as valor_inventario
    FROM productos
  `);
  
  // Obtener top productos más caros
  const [topProductos] = await db.query(`
    SELECT id, nombre, categoria, precio
    FROM productos
    ORDER BY precio DESC
    LIMIT 5
  `);
  
  res.json({
    resumen: generalStats[0],
    categorias,
    topProductos,
    timestamp: new Date().toISOString()
  });
});

/**
 * Obtiene un resumen de productos por rango de precios
 */
exports.getResumenPrecios = asyncHandler(async (req, res) => {
  // Definir rangos de precios para análisis
  const rangos = [
    { min: 0, max: 50, label: 'Bajo costo (0-50)' },
    { min: 50, max: 200, label: 'Costo medio (50-200)' },
    { min: 200, max: 500, label: 'Costo alto (200-500)' },
    { min: 500, max: null, label: 'Premium (500+)' }
  ];
  
  // Consultas para cada rango
  const promesas = rangos.map(rango => {
    let query = 'SELECT COUNT(*) as total FROM productos WHERE precio >= ?';
    let params = [rango.min];
    
    if (rango.max !== null) {
      query += ' AND precio < ?';
      params.push(rango.max);
    }
    
    return db.query(query, params);
  });
  
  // Ejecutar todas las consultas en paralelo
  const resultados = await Promise.all(promesas);
  
  // Formatear resultados
  const distribucionPrecios = rangos.map((rango, index) => ({
    rango: rango.label,
    total: resultados[index][0][0].total,
    min: rango.min,
    max: rango.max
  }));
  
  res.json({
    distribucionPrecios,
    timestamp: new Date().toISOString()
  });
});

/**
 * Utilidades para la API
 * Funciones auxiliares para operaciones comunes
 */

const config = require('../config');

/**
 * Procesa parámetros de paginación desde la solicitud
 * @param {Object} req - Objeto de solicitud Express
 * @returns {Object} Objeto con parámetros de paginación procesados
 */
exports.getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  let limit = parseInt(req.query.limit) || config.api.defaultPageSize;
  
  // Limitar el tamaño máximo de página para evitar sobrecarga
  limit = Math.min(limit, config.api.maxPageSize);
  
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

/**
 * Procesa parámetros de ordenación desde la solicitud
 * @param {Object} req - Objeto de solicitud Express
 * @param {Array} validFields - Campos válidos para ordenación
 * @returns {Object} Objeto con parámetros de ordenación procesados
 */
exports.getSortParams = (req, validFields = ['id']) => {
  let orderBy = req.query.orderBy || config.api.defaultSortField;
  const orderDir = req.query.orderDir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  // Validar campo de ordenación para prevenir SQL injection
  if (!validFields.includes(orderBy)) {
    orderBy = config.api.defaultSortField;
  }
  
  return { orderBy, orderDir };
};

/**
 * Construye una respuesta paginada
 * @param {Array} data - Datos a incluir en la respuesta
 * @param {Object} pagination - Información de paginación
 * @param {number} total - Total de elementos
 * @returns {Object} Respuesta formateada con metadatos de paginación
 */
exports.paginatedResponse = (data, pagination, total) => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Formatea un error para la respuesta API
 * @param {Error} error - Objeto de error
 * @param {number} statusCode - Código de estado HTTP
 * @returns {Object} Error formateado para respuesta API
 */
exports.formatError = (error, statusCode = 500) => {
  return {
    error: true,
    message: error.message || 'Error interno del servidor',
    statusCode,
    ...(config.server.isDev && { stack: error.stack })
  };
};

/**
 * Middleware para manejo centralizado de errores
 * Captura errores y proporciona respuestas consistentes
 */

// Middleware para capturar errores 404 (rutas no encontradas)
exports.notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Middleware para manejo de errores generales
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Estructura de respuesta de error
  const errorResponse = {
    error: true,
    message: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  // Registrar el error en la consola
  console.error(`[ERROR] ${err.message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
  
  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar errores asíncronos
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

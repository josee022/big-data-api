/**
 * Configuración centralizada de la aplicación
 * Carga variables de entorno y proporciona valores por defecto
 */
require('dotenv').config();

module.exports = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',
  },
  
  // Configuración de la base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'bigdata_db',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  },
  
  // Configuración de la API
  api: {
    defaultPageSize: 50,
    maxPageSize: 1000,
    defaultSortField: 'id',
    defaultSortOrder: 'ASC',
  },
  
  // Configuración de seguridad
  security: {
    rateLimitWindow: 15 * 60 * 1000, // 15 minutos en milisegundos
    rateLimitMax: 100, // Máximo número de solicitudes por ventana
  }
};

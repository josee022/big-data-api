const mysql = require('mysql2/promise');
const config = require('../config');

/**
 * Pool de conexiones a la base de datos MySQL
 * Utiliza la configuración centralizada del proyecto
 */
const db = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: config.database.connectionLimit,
  queueLimit: 0,
  // Configuración adicional para mejorar el rendimiento
  namedPlaceholders: true,
});

// Verificar conexión a la base de datos al iniciar
db.getConnection()
  .then(connection => {
    console.log(`Conexión a la base de datos ${config.database.name} establecida correctamente`);
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err.message);
  });

module.exports = db;

const app = require('./app');
const config = require('./config');

// Iniciar el servidor HTTP
const server = app.listen(config.server.port, () => {
  console.log(`===========================================`);
  console.log(`Servidor corriendo en puerto ${config.server.port}`);
  console.log(`Entorno: ${config.server.nodeEnv}`);
  console.log(`===========================================`);
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Función para cierre controlado del servidor
 */
function gracefulShutdown() {
  console.log('Recibida señal de terminación, cerrando servidor...');
  server.close(() => {
    console.log('Servidor HTTP cerrado correctamente');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos si no se cierra correctamente
  setTimeout(() => {
    console.error('No se pudo cerrar el servidor correctamente, forzando salida');
    process.exit(1);
  }, 10000);
}

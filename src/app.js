const express = require('express');
const productRoutes = require('./routes/product.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const config = require('./config');

// Inicializar aplicación Express
const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    return res.status(200).json({});
  }
  next();
});

// Middleware para logging básico
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Ruta de estado de la API
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/productos', productRoutes);

// Middleware para manejar rutas no encontradas
app.use(notFoundHandler);

// Middleware para manejo de errores
app.use(errorHandler);

module.exports = app;

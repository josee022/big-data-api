# Big Data API - Guía Completa

## Descripción General

Big Data API es un proyecto diseñado específicamente para practicar y demostrar técnicas de manejo de grandes volúmenes de datos en un entorno backend. Este proyecto implementa una API REST completa optimizada para gestionar más de 100.000 registros con eficiencia, utilizando técnicas de paginación, filtrado, ordenación y análisis estadístico.

El propósito principal es servir como herramienta de aprendizaje y demostración para entrevistas técnicas, especialmente en roles que requieren conocimientos de gestión de datos masivos, optimización de consultas y arquitectura de APIs.

## ¿Para qué sirve este proyecto?

- **Aprendizaje práctico**: Permite experimentar con técnicas de manejo de grandes volúmenes de datos
- **Preparación para entrevistas**: Demuestra conocimientos en desarrollo backend, bases de datos y optimización
- **Demostración de habilidades**: Muestra capacidad para implementar soluciones escalables y eficientes
- **Experimentación**: Sirve como base para probar diferentes estrategias de consulta y optimización

## Características Principales

- **Manejo de Grandes Volúmenes**: Optimizado para trabajar con 100.000+ registros de manera eficiente
- **Paginación Avanzada**: Implementación eficiente con `LIMIT` y `OFFSET` y metadatos de navegación
- **Filtrado Múltiple**: Capacidad para filtrar por categoría, rango de precios y búsqueda por texto
- **Ordenación Dinámica**: Ordenación configurable por cualquier campo y dirección
- **Análisis Estadístico**: Endpoints para obtener estadísticas y distribuciones de datos
- **Arquitectura Modular**: Estructura profesional siguiendo el patrón MVC
- **Manejo de Errores**: Sistema centralizado para captura y respuesta consistente de errores

## Estructura del Proyecto Explicada

```
├── src/                  # Código fuente de la aplicación
│   ├── config/           # Configuración centralizada de la aplicación
│   │   └── index.js      # Exporta configuraciones desde variables de entorno
│   │
│   ├── controllers/      # Controladores que manejan la lógica de negocio
│   │   └── product.controller.js  # Controlador para operaciones con productos
│   │
│   ├── db/               # Todo lo relacionado con la base de datos
│   │   ├── connection.js # Establece y configura la conexión a MySQL
│   │   ├── generateData.js # Script para generar datos masivos de prueba
│   │   └── init.sql      # Script SQL para inicializar la estructura de la BD
│   │
│   ├── middleware/       # Middleware para procesar solicitudes
│   │   └── error.middleware.js # Manejo centralizado de errores
│   │
│   ├── routes/           # Definición de rutas de la API
│   │   └── product.routes.js # Rutas para los endpoints de productos
│   │
│   ├── utils/            # Utilidades y funciones auxiliares
│   │   └── api.utils.js  # Funciones para paginación, ordenación, etc.
│   │
│   ├── app.js            # Configuración de la aplicación Express
│   └── server.js         # Punto de entrada que inicia el servidor
│
├── .env                  # Variables de entorno (configuración)
├── package.json          # Dependencias y scripts
└── README.md             # Esta documentación
```

## Detalle de cada archivo y su función

### Archivos de Configuración

- **`.env`**: Almacena variables de entorno como credenciales de base de datos y puerto del servidor.
- **`src/config/index.js`**: Centraliza toda la configuración de la aplicación, cargando variables desde `.env` y proporcionando valores por defecto.

### Archivos de Servidor

- **`src/server.js`**: Punto de entrada principal. Inicia el servidor HTTP y configura el manejo de señales para un cierre graceful.
- **`src/app.js`**: Configura la aplicación Express, registra middleware global y define las rutas principales.

### Base de Datos

- **`src/db/connection.js`**: Establece la conexión a MySQL usando un pool de conexiones para mejor rendimiento.
- **`src/db/generateData.js`**: Script que genera 100.000 productos de prueba con datos realistas usando Faker.
- **`src/db/init.sql`**: Define la estructura de la tabla `productos` con sus campos y tipos de datos.

### Controladores

- **`src/controllers/product.controller.js`**: Implementa la lógica de negocio para:
  - Obtener productos con paginación, filtrado y ordenación
  - Obtener un producto específico por ID
  - Generar estadísticas por categoría
  - Analizar distribución de productos por rangos de precio

### Rutas

- **`src/routes/product.routes.js`**: Define los endpoints de la API y los conecta con sus respectivos controladores.

### Middleware

- **`src/middleware/error.middleware.js`**: Proporciona funciones para capturar errores 404, manejar errores generales y envolver controladores asíncronos.

### Utilidades

- **`src/utils/api.utils.js`**: Contiene funciones auxiliares para:
  - Procesar parámetros de paginación
  - Validar y procesar parámetros de ordenación
  - Construir respuestas paginadas con metadatos
  - Formatear errores para respuestas consistentes

## Cómo funciona el manejo de grandes volúmenes de datos

El proyecto implementa varias estrategias para manejar eficientemente grandes volúmenes de datos:

### 1. Paginación Eficiente

En lugar de cargar todos los registros a la vez, la API utiliza paginación con `LIMIT` y `OFFSET` en las consultas SQL:

```sql
SELECT * FROM productos LIMIT 50 OFFSET 100
```

Esto permite cargar solo los registros necesarios para cada página, reduciendo significativamente el uso de memoria y mejorando el tiempo de respuesta.

### 2. Consultas Optimizadas

- **Selección específica de columnas**: En lugar de usar `SELECT *`, se seleccionan solo las columnas necesarias.
- **Condiciones WHERE eficientes**: Se construyen dinámicamente basadas en los filtros aplicados.
- **Índices**: La tabla está diseñada para aprovechar índices en campos frecuentemente consultados.

### 3. Ejecución en Paralelo

Se utiliza `Promise.all` para ejecutar múltiples consultas simultáneamente cuando es necesario, como al obtener datos y contar el total de registros:

```javascript
const [productosResult, totalResult] = await Promise.all([
  db.query(query, queryParams),
  db.query(countQuery, countParams)
]);
```

### 4. Pool de Conexiones

Se implementa un pool de conexiones a la base de datos para reutilizar conexiones y mejorar el rendimiento:

```javascript
const db = mysql.createPool({
  // configuración...
  connectionLimit: config.database.connectionLimit,
  queueLimit: 0
});
```

### 5. Procesamiento por Lotes

La generación de datos masivos se realiza en lotes de 1.000 registros para optimizar la inserción:

```javascript
for (let i = 0; i < 100000; i += 1000) {
  // Insertar lote de 1000 registros
}
```

## Endpoints de la API Detallados

### Productos

#### `GET /productos`
Obtiene una lista paginada de productos con opciones de filtrado y ordenación.

**Parámetros de query:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 50, max: 1000)
- `orderBy`: Campo para ordenar (id, nombre, categoria, precio, fecha_creacion)
- `orderDir`: Dirección de ordenación (ASC, DESC)
- `categoria`: Filtrar por categoría específica
- `precioMin`: Filtrar por precio mínimo
- `precioMax`: Filtrar por precio máximo
- `busqueda`: Buscar por nombre (búsqueda parcial)

**Respuesta:**
```json
{
  "data": [
    {"id": 1, "nombre": "Producto 1", "categoria": "Electrónica", "precio": 299.99, "fecha_creacion": "2025-05-20T14:00:00.000Z"},
    // Más productos...
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "totalItems": 100000,
    "totalPages": 2000,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### `GET /productos/:id`
Obtiene un producto específico por su ID.

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Producto 1",
  "categoria": "Electrónica",
  "precio": 299.99,
  "fecha_creacion": "2025-05-20T14:00:00.000Z"
}
```

### Estadísticas y Análisis

#### `GET /productos/estadisticas`
Obtiene estadísticas generales y por categoría.

**Respuesta:**
```json
{
  "resumen": {
    "total_productos": 100000,
    "precio_promedio": 500.25,
    "precio_minimo": 1.00,
    "precio_maximo": 999.99,
    "valor_inventario": 50025000.00
  },
  "categorias": [
    {"categoria": "Electrónica", "total": 6756, "precio_min": 1.00, "precio_max": 999.99, "precio_promedio": 550.75, "valor_total": 3720867.00},
    // Más categorías...
  ],
  "topProductos": [
    {"id": 5042, "nombre": "Producto Premium", "categoria": "Electrónica", "precio": 999.99},
    // Más productos caros...
  ],
  "timestamp": "2025-05-20T15:03:38.000Z"
}
```

#### `GET /productos/analisis/precios`
Obtiene la distribución de productos por rangos de precio.

**Respuesta:**
```json
{
  "distribucionPrecios": [
    {"rango": "Bajo costo (0-50)", "total": 25000, "min": 0, "max": 50},
    {"rango": "Costo medio (50-200)", "total": 35000, "min": 50, "max": 200},
    {"rango": "Costo alto (200-500)", "total": 30000, "min": 200, "max": 500},
    {"rango": "Premium (500+)", "total": 10000, "min": 500, "max": null}
  ],
  "timestamp": "2025-05-20T15:03:38.000Z"
}
```

### Estado del Servidor

#### `GET /status`
Verifica el estado del servidor.

**Respuesta:**
```json
{
  "status": "online",
  "environment": "development",
  "timestamp": "2025-05-20T15:03:38.000Z"
}
```

## Instalación y Configuración Paso a Paso

### 1. Requisitos Previos

- Node.js (v14+)
- MySQL (v5.7+)
- npm o yarn

### 2. Configuración del Proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar base de datos:**
   - Asegúrate de tener MySQL en ejecución
   - Crea una base de datos llamada `bigdata_db`:
     ```sql
     CREATE DATABASE IF NOT EXISTS bigdata_db;
     ```
   - Verifica que las credenciales en el archivo `.env` sean correctas

3. **Generar datos de prueba:**
   ```bash
   npm run generate
   ```
   Este proceso generará 100.000 productos con datos realistas.

4. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   El servidor se iniciará en el puerto 3000 (o el configurado en `.env`).

### 3. Probar la API

Puedes probar los endpoints usando un navegador, Postman o curl:

```bash
curl http://localhost:3000/productos?page=1&limit=10
```

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución JavaScript del lado del servidor
- **Express**: Framework web para crear APIs RESTful
- **MySQL**: Sistema de gestión de bases de datos relacional
- **mysql2**: Cliente MySQL con soporte para promesas
- **Faker**: Biblioteca para generar datos de prueba realistas
- **dotenv**: Para gestionar variables de entorno

## Buenas Prácticas Implementadas

- **Arquitectura MVC**: Separación clara de responsabilidades
- **Manejo centralizado de errores**: Middleware para capturar y formatear errores
- **Validación de parámetros**: Prevención de inyección SQL y validación de entradas
- **Respuestas consistentes**: Formato estándar para todas las respuestas
- **Cierre graceful del servidor**: Manejo adecuado de señales de terminación
- **Logging**: Registro de solicitudes y errores
- **Configuración centralizada**: Variables de entorno y configuraciones en un solo lugar
- **Documentación**: Comentarios en el código y documentación externa completa

## Consideraciones de Rendimiento

- **Paginación**: Limita la cantidad de datos transferidos en cada solicitud
- **Consultas optimizadas**: Selección específica de columnas y condiciones WHERE eficientes
- **Índices**: Uso de índices en campos frecuentemente consultados
- **Ejecución en paralelo**: Uso de Promise.all para ejecutar consultas simultáneamente
- **Pool de conexiones**: Reutilización de conexiones a la base de datos
- **Procesamiento por lotes**: Inserción de datos en lotes para mejor rendimiento

## Conclusión

Este proyecto demuestra cómo implementar una API REST optimizada para manejar grandes volúmenes de datos, siguiendo las mejores prácticas de desarrollo backend. Es una excelente herramienta para aprender y demostrar habilidades en el manejo eficiente de datos masivos, optimización de consultas y arquitectura de APIs.

const faker = require('faker');
const db = require('./connection');

// Configurar faker para usar locale español
faker.locale = 'es';

// Categorías predefinidas para tener datos más realistas
const categorias = [
  'Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes',
  'Jardín', 'Alimentación', 'Belleza', 'Salud', 'Libros',
  'Música', 'Automóvil', 'Bebés', 'Mascotas', 'Oficina'
];

/**
 * Genera un producto aleatorio con datos realistas
 * @returns {Array} Array con los datos del producto
 */
const generarProducto = () => {
  const categoria = categorias[Math.floor(Math.random() * categorias.length)];
  const precio = parseFloat((Math.random() * 1000 + 1).toFixed(2));
  
  // Generar nombre de producto más específico según la categoría
  let nombre;
  switch (categoria) {
    case 'Electrónica':
      nombre = `${faker.commerce.productAdjective()} ${faker.random.arrayElement(['Smartphone', 'Tablet', 'Portátil', 'TV', 'Auriculares', 'Altavoz'])} ${faker.company.companyName().split(' ')[0]}`;
      break;
    case 'Ropa':
      nombre = `${faker.commerce.productAdjective()} ${faker.random.arrayElement(['Camiseta', 'Pantalón', 'Vestido', 'Chaqueta', 'Zapatillas', 'Calcetines'])} ${faker.commerce.color()}`;
      break;
    case 'Hogar':
      nombre = `${faker.commerce.productAdjective()} ${faker.random.arrayElement(['Sofá', 'Mesa', 'Lámpara', 'Silla', 'Estantería', 'Alfombra'])} ${faker.commerce.productMaterial()}`;
      break;
    default:
      nombre = faker.commerce.productName();
  }
  
  return [nombre, categoria, precio];
};

/**
 * Inserta múltiples productos en la base de datos
 * @param {number} total - Total de productos a insertar
 * @param {number} batchSize - Tamaño de cada lote
 */
const insertMany = async (total = 100000, batchSize = 1000) => {
  try {
    console.log(`Iniciando generación de ${total} productos...`);
    console.time('Tiempo total');
    
    // Crear tabla si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255),
        categoria VARCHAR(100),
        precio DECIMAL(10,2),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Limpiar tabla existente
    await db.query('TRUNCATE TABLE productos');
    console.log('Tabla productos limpiada correctamente');
    
    // Insertar datos en lotes
    for (let i = 0; i < total; i += batchSize) {
      const values = [];
      const currentBatch = Math.min(batchSize, total - i);
      
      for (let j = 0; j < currentBatch; j++) {
        values.push(generarProducto());
      }
      
      await db.query('INSERT INTO productos (nombre, categoria, precio) VALUES ?', [values]);
      console.log(`Progreso: ${Math.min(i + batchSize, total)}/${total} productos insertados (${((Math.min(i + batchSize, total) / total) * 100).toFixed(2)}%)`);
    }
    
    console.timeEnd('Tiempo total');
    console.log('Generación de datos completada con éxito');
    
    // Mostrar estadísticas
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM productos');
    const [catResult] = await db.query('SELECT categoria, COUNT(*) as total FROM productos GROUP BY categoria ORDER BY total DESC');
    
    console.log(`\nTotal de productos insertados: ${countResult[0].total}`);
    console.log('\nDistribución por categorías:');
    catResult.forEach(cat => {
      console.log(`- ${cat.categoria}: ${cat.total} productos`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error al generar datos:', err);
    process.exit(1);
  }
};

// Ejecutar la función principal
insertMany();

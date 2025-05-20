-- ============================================================================
-- CONSULTAS SQL AVANZADAS PARA BIG-DATA-API
-- ============================================================================
-- Este archivo contiene consultas SQL avanzadas para practicar y demostrar
-- habilidades con MySQL utilizando la base de datos del proyecto big-data-api.
-- Las consultas están organizadas por tipo y complejidad.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CONSULTAS BÁSICAS
-- ----------------------------------------------------------------------------

-- 1. Seleccionar todos los productos con límite
SELECT id, nombre, categoria, precio, fecha_creacion 
FROM productos 
LIMIT 10;

-- 2. Filtrar por categoría
SELECT id, nombre, categoria, precio 
FROM productos 
WHERE categoria = 'Electrónica' 
LIMIT 10;

-- 3. Ordenar por precio descendente
SELECT id, nombre, categoria, precio 
FROM productos 
ORDER BY precio DESC 
LIMIT 10;

-- ----------------------------------------------------------------------------
-- CONSULTAS DE AGREGACIÓN
-- ----------------------------------------------------------------------------

-- 4. Contar productos por categoría
SELECT categoria, COUNT(*) as total_productos 
FROM productos 
GROUP BY categoria 
ORDER BY total_productos DESC;

-- 5. Precio promedio, mínimo y máximo por categoría
SELECT 
    categoria, 
    COUNT(*) as total_productos,
    MIN(precio) as precio_minimo,
    MAX(precio) as precio_maximo,
    AVG(precio) as precio_promedio,
    SUM(precio) as valor_total
FROM productos 
GROUP BY categoria 
ORDER BY total_productos DESC;

-- 6. Categorías con más de 6700 productos
SELECT 
    categoria, 
    COUNT(*) as total_productos
FROM productos 
GROUP BY categoria 
HAVING total_productos > 6700
ORDER BY total_productos DESC;

-- ----------------------------------------------------------------------------
-- SUBCONSULTAS
-- ----------------------------------------------------------------------------

-- 7. Productos con precio mayor al promedio
SELECT id, nombre, categoria, precio 
FROM productos 
WHERE precio > (SELECT AVG(precio) FROM productos)
ORDER BY precio ASC
LIMIT 10;

-- 8. Productos en categorías con más de 6700 productos
SELECT id, nombre, categoria, precio 
FROM productos 
WHERE categoria IN (
    SELECT categoria 
    FROM productos 
    GROUP BY categoria 
    HAVING COUNT(*) > 6700
)
LIMIT 10;

-- 9. Subconsulta correlacionada: Productos con precio mayor al promedio de su categoría
SELECT p1.id, p1.nombre, p1.categoria, p1.precio
FROM productos p1
WHERE p1.precio > (
    SELECT AVG(p2.precio) 
    FROM productos p2 
    WHERE p2.categoria = p1.categoria
)
ORDER BY p1.categoria, p1.precio
LIMIT 20;

-- ----------------------------------------------------------------------------
-- JOINS (SIMULADOS CON AUTO-JOIN, YA QUE SOLO TENEMOS UNA TABLA)
-- ----------------------------------------------------------------------------

-- 10. Auto-join: Productos con el mismo precio
SELECT 
    p1.id as id1, 
    p1.nombre as nombre1, 
    p2.id as id2, 
    p2.nombre as nombre2, 
    p1.precio
FROM productos p1
JOIN productos p2 ON p1.precio = p2.precio AND p1.id < p2.id
WHERE p1.categoria = 'Electrónica' AND p2.categoria = 'Electrónica'
LIMIT 10;

-- 11. Simulación de join con subconsulta: Productos con mismo precio pero diferente categoría
SELECT 
    p1.id, 
    p1.nombre, 
    p1.categoria as categoria1, 
    p2.categoria as categoria2, 
    p1.precio
FROM productos p1
JOIN productos p2 ON p1.precio = p2.precio AND p1.id != p2.id AND p1.categoria != p2.categoria
LIMIT 15;

-- ----------------------------------------------------------------------------
-- FUNCIONES DE VENTANA (WINDOW FUNCTIONS)
-- ----------------------------------------------------------------------------

-- 12. Ranking de productos más caros por categoría
SELECT 
    id, 
    nombre, 
    categoria, 
    precio,
    RANK() OVER (PARTITION BY categoria ORDER BY precio DESC) as ranking_precio
FROM productos
WHERE categoria IN ('Electrónica', 'Ropa', 'Hogar')
AND RANK() OVER (PARTITION BY categoria ORDER BY precio DESC) <= 5;

-- 13. Productos con precio y promedio de su categoría
SELECT 
    id, 
    nombre, 
    categoria, 
    precio,
    AVG(precio) OVER (PARTITION BY categoria) as precio_promedio_categoria,
    precio - AVG(precio) OVER (PARTITION BY categoria) as diferencia_del_promedio
FROM productos
LIMIT 20;

-- 14. Productos con su percentil de precio dentro de su categoría
SELECT 
    id, 
    nombre, 
    categoria, 
    precio,
    PERCENT_RANK() OVER (PARTITION BY categoria ORDER BY precio) as percentil_precio
FROM productos
WHERE categoria = 'Electrónica'
LIMIT 20;

-- ----------------------------------------------------------------------------
-- CONSULTAS CON EXPRESIONES DE TABLA COMÚN (CTE)
-- ----------------------------------------------------------------------------

-- 15. CTE para análisis de rangos de precio
WITH rangos_precio AS (
    SELECT 
        CASE 
            WHEN precio BETWEEN 0 AND 50 THEN 'Bajo costo (0-50)'
            WHEN precio BETWEEN 50.01 AND 200 THEN 'Costo medio (50-200)'
            WHEN precio BETWEEN 200.01 AND 500 THEN 'Costo alto (200-500)'
            ELSE 'Premium (500+)'
        END as rango_precio,
        id, nombre, categoria, precio
    FROM productos
)
SELECT 
    rango_precio, 
    COUNT(*) as total_productos,
    MIN(precio) as precio_minimo,
    MAX(precio) as precio_maximo,
    AVG(precio) as precio_promedio
FROM rangos_precio
GROUP BY rango_precio
ORDER BY MIN(precio);

-- 16. CTE para análisis de categorías top
WITH categorias_top AS (
    SELECT 
        categoria,
        COUNT(*) as total_productos
    FROM productos
    GROUP BY categoria
    ORDER BY total_productos DESC
    LIMIT 5
)
SELECT 
    p.id, 
    p.nombre, 
    p.categoria, 
    p.precio
FROM productos p
JOIN categorias_top ct ON p.categoria = ct.categoria
ORDER BY p.categoria, p.precio DESC
LIMIT 20;

-- ----------------------------------------------------------------------------
-- CONSULTAS CON UNIONES
-- ----------------------------------------------------------------------------

-- 17. Unión de productos caros y baratos
(SELECT id, nombre, categoria, precio, 'Caro' as tipo
FROM productos
WHERE precio > 900
ORDER BY precio DESC
LIMIT 5)
UNION ALL
(SELECT id, nombre, categoria, precio, 'Barato' as tipo
FROM productos
WHERE precio < 10
ORDER BY precio ASC
LIMIT 5);

-- 18. Intersección simulada (productos que están en dos categorías de precio)
SELECT id, nombre, categoria, precio
FROM productos
WHERE precio BETWEEN 100 AND 200
AND categoria = 'Electrónica'
INTERSECT
SELECT id, nombre, categoria, precio
FROM productos
WHERE precio BETWEEN 100 AND 300;

-- ----------------------------------------------------------------------------
-- CONSULTAS AVANZADAS CON MÚLTIPLES TÉCNICAS
-- ----------------------------------------------------------------------------

-- 19. Análisis completo por categoría con subconsultas y funciones de ventana
WITH stats_categoria AS (
    SELECT 
        categoria,
        COUNT(*) as total,
        MIN(precio) as precio_min,
        MAX(precio) as precio_max,
        AVG(precio) as precio_avg,
        STDDEV(precio) as precio_stddev
    FROM productos
    GROUP BY categoria
),
productos_con_stats AS (
    SELECT 
        p.id,
        p.nombre,
        p.categoria,
        p.precio,
        s.total as total_en_categoria,
        s.precio_avg as precio_promedio_categoria,
        (p.precio - s.precio_avg) / s.precio_stddev as z_score,
        PERCENT_RANK() OVER (PARTITION BY p.categoria ORDER BY p.precio) as percentil
    FROM productos p
    JOIN stats_categoria s ON p.categoria = s.categoria
)
SELECT *
FROM productos_con_stats
WHERE z_score > 2  -- Productos con precio más de 2 desviaciones estándar sobre la media
ORDER BY z_score DESC
LIMIT 20;

-- 20. Análisis de tendencias temporales (simulado con fecha_creacion)
WITH meses AS (
    SELECT 
        DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
        categoria,
        COUNT(*) as total_productos,
        AVG(precio) as precio_promedio
    FROM productos
    GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m'), categoria
)
SELECT 
    mes,
    categoria,
    total_productos,
    precio_promedio,
    LAG(precio_promedio) OVER (PARTITION BY categoria ORDER BY mes) as precio_promedio_mes_anterior,
    precio_promedio - LAG(precio_promedio) OVER (PARTITION BY categoria ORDER BY mes) as cambio_precio
FROM meses
ORDER BY categoria, mes
LIMIT 30;

-- ----------------------------------------------------------------------------
-- CONSULTAS PARA OPTIMIZACIÓN Y RENDIMIENTO
-- ----------------------------------------------------------------------------

-- 21. Consulta para analizar la distribución de datos (útil para índices)
SELECT 
    LEFT(nombre, 1) as inicial,
    COUNT(*) as total,
    MIN(precio) as precio_min,
    MAX(precio) as precio_max,
    AVG(precio) as precio_avg
FROM productos
GROUP BY inicial
ORDER BY total DESC;

-- 22. Consulta para identificar valores atípicos (outliers)
SELECT id, nombre, categoria, precio
FROM productos
WHERE precio > (
    SELECT AVG(precio) + 3 * STDDEV(precio)
    FROM productos
)
ORDER BY precio DESC;

-- 23. Consulta para analizar la cardinalidad de las columnas
SELECT 
    'categoria' as columna,
    COUNT(DISTINCT categoria) as valores_distintos,
    COUNT(*) as total_filas,
    COUNT(*) / COUNT(DISTINCT categoria) as promedio_filas_por_valor
FROM productos
UNION ALL
SELECT 
    'rango_precio' as columna,
    COUNT(DISTINCT 
        CASE 
            WHEN precio BETWEEN 0 AND 50 THEN 'Bajo costo'
            WHEN precio BETWEEN 50.01 AND 200 THEN 'Costo medio'
            WHEN precio BETWEEN 200.01 AND 500 THEN 'Costo alto'
            ELSE 'Premium'
        END
    ) as valores_distintos,
    COUNT(*) as total_filas,
    COUNT(*) / COUNT(DISTINCT 
        CASE 
            WHEN precio BETWEEN 0 AND 50 THEN 'Bajo costo'
            WHEN precio BETWEEN 50.01 AND 200 THEN 'Costo medio'
            WHEN precio BETWEEN 200.01 AND 500 THEN 'Costo alto'
            ELSE 'Premium'
        END
    ) as promedio_filas_por_valor
FROM productos;

-- ----------------------------------------------------------------------------
-- CONSULTAS PARA DEMOSTRACIÓN DE ÍNDICES
-- ----------------------------------------------------------------------------

-- 24. Crear índices para mejorar el rendimiento
-- Nota: Ejecutar estas consultas solo si se necesita mejorar el rendimiento

-- Índice para búsquedas por categoría
-- CREATE INDEX idx_categoria ON productos(categoria);

-- Índice para ordenación por precio
-- CREATE INDEX idx_precio ON productos(precio);

-- Índice compuesto para filtrado por categoría y ordenación por precio
-- CREATE INDEX idx_categoria_precio ON productos(categoria, precio);

-- 25. Consulta para comparar rendimiento con y sin índices
-- Primero ejecutar sin índice, luego con índice y comparar tiempos
-- EXPLAIN SELECT * FROM productos WHERE categoria = 'Electrónica' ORDER BY precio DESC LIMIT 100;

-- ----------------------------------------------------------------------------
-- CONSULTAS PARA MANTENIMIENTO
-- ----------------------------------------------------------------------------

-- 26. Analizar la tabla para estadísticas
-- ANALYZE TABLE productos;

-- 27. Optimizar la tabla
-- OPTIMIZE TABLE productos;

-- 28. Verificar el estado de la tabla
-- CHECK TABLE productos;

-- ----------------------------------------------------------------------------
-- PROCEDIMIENTOS ALMACENADOS Y FUNCIONES
-- ----------------------------------------------------------------------------

-- 29. Procedimiento almacenado para obtener productos por rango de precio
/*
DELIMITER //
CREATE PROCEDURE GetProductosPorRangoPrecio(
    IN precio_min DECIMAL(10,2),
    IN precio_max DECIMAL(10,2),
    IN limite INT
)
BEGIN
    SELECT id, nombre, categoria, precio
    FROM productos
    WHERE precio BETWEEN precio_min AND precio_max
    ORDER BY precio
    LIMIT limite;
END //
DELIMITER ;

-- Llamar al procedimiento
CALL GetProductosPorRangoPrecio(100, 200, 10);
*/

-- 30. Función para calcular el valor total del inventario por categoría
/*
DELIMITER //
CREATE FUNCTION ValorInventarioPorCategoria(
    categoria_param VARCHAR(100)
)
RETURNS DECIMAL(15,2)
DETERMINISTIC
BEGIN
    DECLARE valor_total DECIMAL(15,2);
    
    SELECT SUM(precio) INTO valor_total
    FROM productos
    WHERE categoria = categoria_param;
    
    RETURN valor_total;
END //
DELIMITER ;

-- Usar la función
SELECT ValorInventarioPorCategoria('Electrónica') as valor_inventario_electronica;
*/

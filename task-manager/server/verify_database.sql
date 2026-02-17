-- Script de Verificación de Base de Datos
-- Ejecuta este script en phpMyAdmin para verificar que todo esté configurado correctamente

-- 1. Verificar que la base de datos existe
SHOW DATABASES LIKE 'task_manager';

-- 2. Usar la base de datos
USE task_manager;

-- 3. Mostrar todas las tablas
SHOW TABLES;

-- 4. Verificar estructura de la tabla usuarios
DESCRIBE usuarios;

-- 5. Verificar estructura de la tabla tareas
DESCRIBE tareas;

-- 6. Verificar que existe el usuario por defecto
SELECT * FROM usuarios WHERE id = 1;

-- 7. Mostrar todas las tareas guardadas
SELECT 
    id,
    titulo,
    descripcion,
    fecha_limite,
    prioridad,
    estado,
    fecha_creacion
FROM tareas
ORDER BY fecha_creacion DESC;

-- 8. Contar cuántas tareas hay en total
SELECT COUNT(*) as total_tareas FROM tareas;

-- 9. Contar tareas por estado
SELECT 
    estado,
    COUNT(*) as cantidad
FROM tareas
GROUP BY estado;

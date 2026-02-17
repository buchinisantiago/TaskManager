ALTER TABLE tareas MODIFY COLUMN estado ENUM('Pendiente', 'En progreso', 'Completada', 'Cancelada') DEFAULT 'Pendiente';

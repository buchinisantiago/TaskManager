
use task_manager;

ALTER TABLE tareas
ADD COLUMN responsable VARCHAR(100) DEFAULT 'Cache',
ADD COLUMN fecha_completada DATETIME DEFAULT NULL;

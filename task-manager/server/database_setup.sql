-- Task Manager Database Setup
-- IMPORTANTE: Este script solo debe ejecutarse UNA VEZ para crear la base de datos inicial
-- Si ya tienes tareas guardadas, NO vuelvas a ejecutar este script completo
-- Solo ejecuta las partes que necesites (por ejemplo, crear solo la base de datos o las tablas)

CREATE DATABASE IF NOT EXISTS task_manager;
USE task_manager;

-- Create default user if not exists
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user for development (if not exists)
INSERT IGNORE INTO usuarios (id, nombre, email, password_hash) 
VALUES (1, 'Usuario Default', 'default@taskmanager.local', 'no-auth');

-- Create tareas table (IF NOT EXISTS para no borrar datos existentes)
CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT DEFAULT 1,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE,
    prioridad ENUM('Alta', 'Media', 'Baja') DEFAULT 'Media',
    estado ENUM('Pendiente', 'En progreso', 'Completada') DEFAULT 'Pendiente',
    categoria VARCHAR(50) DEFAULT 'Otros',
    recordatorio_especial BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- FIX: Insert missing default user
-- This script fixes the foreign key constraint error

USE task_manager;

-- First, check if user exists and delete if necessary to recreate
DELETE FROM usuarios WHERE id = 1;

-- Insert the default user
INSERT INTO usuarios (id, nombre, email, password_hash, fecha_registro) 
VALUES (1, 'Usuario Default', 'default@taskmanager.local', 'no-auth', NOW());

-- Verify the user was created
SELECT * FROM usuarios WHERE id = 1;

<?php
/**
 * Migration Script: Export MySQL tasks as PostgreSQL INSERT statements for Supabase
 * Run this in your browser: http://localhost/APP-Prueba/task-manager/server/public/export_for_supabase.php
 */

// Connect to local MySQL
try {
    $mysql = new PDO("mysql:host=localhost;dbname=task_manager", "root", "");
    $mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("MySQL Connection Error: " . $e->getMessage());
}

// Fetch all tasks
$stmt = $mysql->query("SELECT * FROM tareas ORDER BY id");
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: text/plain; charset=utf-8');

echo "-- ===========================================\n";
echo "-- Migration: MySQL tasks -> Supabase (PostgreSQL)\n";
echo "-- Generated: " . date('Y-m-d H:i:s') . "\n";
echo "-- Total tasks: " . count($tasks) . "\n";
echo "-- ===========================================\n\n";

echo "-- INSTRUCTIONS:\n";
echo "-- 1. Copy ALL of this output\n";
echo "-- 2. Go to Supabase -> SQL Editor\n";
echo "-- 3. Paste and Execute\n\n";

foreach ($tasks as $task) {
    $id = (int) $task['id'];
    $usuario_id = (int) ($task['usuario_id'] ?? 1);
    $titulo = str_replace("'", "''", $task['titulo'] ?? '');
    $descripcion = str_replace("'", "''", $task['descripcion'] ?? '');
    $fecha_limite = $task['fecha_limite'] ? "'" . $task['fecha_limite'] . "'" : "NULL";
    $prioridad = str_replace("'", "''", $task['prioridad'] ?? 'Media');
    $estado = str_replace("'", "''", $task['estado'] ?? 'Pendiente');
    $categoria = str_replace("'", "''", $task['categoria'] ?? 'Otros');
    $recordatorio = ($task['recordatorio_especial'] ?? 0) ? 'TRUE' : 'FALSE';
    $fecha_creacion = $task['fecha_creacion'] ? "'" . $task['fecha_creacion'] . "'" : "CURRENT_TIMESTAMP";
    $responsable = str_replace("'", "''", $task['responsable'] ?? 'Cache');
    $fecha_completada = $task['fecha_completada'] ? "'" . $task['fecha_completada'] . "'" : "NULL";

    echo "INSERT INTO tareas (id, usuario_id, titulo, descripcion, fecha_limite, prioridad, estado, categoria, recordatorio_especial, fecha_creacion, responsable, fecha_completada) VALUES (\n";
    echo "  $id, $usuario_id, '$titulo', '$descripcion', $fecha_limite, '$prioridad', '$estado', '$categoria', $recordatorio, $fecha_creacion, '$responsable', $fecha_completada\n";
    echo ") ON CONFLICT (id) DO NOTHING;\n\n";
}

// Reset the sequence to continue after the last ID
echo "-- Reset the ID sequence so new tasks get the next ID\n";
echo "SELECT setval(pg_get_serial_sequence('tareas', 'id'), (SELECT MAX(id) FROM tareas));\n";

echo "\n-- Migration complete! ✅\n";
?>
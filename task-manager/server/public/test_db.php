<?php
// Test script to diagnose database issues
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Task Manager Database Test ===\n\n";

// Test 1: Database connection
echo "1. Testing database connection...\n";
include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "✓ Database connection successful\n\n";
} else {
    echo "✗ Database connection failed\n";
    exit(1);
}

// Test 2: Check if database exists
echo "2. Checking if task_manager database exists...\n";
try {
    $stmt = $db->query("SELECT DATABASE()");
    $current_db = $stmt->fetchColumn();
    echo "✓ Current database: $current_db\n\n";
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// Test 3: Check if usuarios table exists
echo "3. Checking if usuarios table exists...\n";
try {
    $stmt = $db->query("SHOW TABLES LIKE 'usuarios'");
    if ($stmt->rowCount() > 0) {
        echo "✓ usuarios table exists\n";

        // Check if default user exists
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE id = 1");
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            echo "✓ Default user exists: " . $user['nombre'] . "\n\n";
        } else {
            echo "✗ Default user (ID=1) does not exist\n";
            echo "  Run this SQL to fix: INSERT INTO usuarios (id, nombre, email, password_hash) VALUES (1, 'Usuario Default', 'default@taskmanager.local', 'no-auth');\n\n";
        }
    } else {
        echo "✗ usuarios table does not exist\n\n";
    }
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// Test 4: Check if tareas table exists
echo "4. Checking if tareas table exists...\n";
try {
    $stmt = $db->query("SHOW TABLES LIKE 'tareas'");
    if ($stmt->rowCount() > 0) {
        echo "✓ tareas table exists\n";

        // Get table structure
        $stmt = $db->query("DESCRIBE tareas");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "  Columns:\n";
        foreach ($columns as $col) {
            echo "    - {$col['Field']} ({$col['Type']})\n";
        }
        echo "\n";
    } else {
        echo "✗ tareas table does not exist\n";
        echo "  You need to run the database_setup.sql script\n\n";
    }
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// Test 5: Try to insert a test task
echo "5. Testing task insertion...\n";
try {
    $stmt = $db->prepare("INSERT INTO tareas (usuario_id, titulo, descripcion, fecha_limite, prioridad, estado) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        1,
        'Test Task',
        'This is a test task',
        '2026-02-10',
        'Media',
        'Pendiente'
    ]);

    $newId = $db->lastInsertId();
    echo "✓ Task inserted successfully with ID: $newId\n";

    // Clean up test task
    $stmt = $db->prepare("DELETE FROM tareas WHERE id = ?");
    $stmt->execute([$newId]);
    echo "✓ Test task cleaned up\n\n";

} catch (PDOException $e) {
    echo "✗ Error inserting task: " . $e->getMessage() . "\n";
    echo "  Error Code: " . $e->getCode() . "\n\n";
}

// Test 6: Count existing tasks
echo "6. Counting existing tasks...\n";
try {
    $stmt = $db->query("SELECT COUNT(*) as total FROM tareas");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ Total tasks in database: " . $count['total'] . "\n\n";
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

echo "=== Test Complete ===\n";
?>
<?php
// Automatic fix script - Creates the missing default user
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Fixing Missing Default User ===\n\n";

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "✗ Database connection failed\n";
    exit(1);
}

try {
    // First, delete any existing user with ID=1 (in case it's corrupted)
    echo "1. Cleaning up any existing user with ID=1...\n";
    $stmt = $db->prepare("DELETE FROM usuarios WHERE id = 1");
    $stmt->execute();
    echo "✓ Cleanup complete\n\n";

    // Insert the default user
    echo "2. Creating default user...\n";
    $stmt = $db->prepare("INSERT INTO usuarios (id, nombre, email, password_hash, fecha_registro) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([1, 'Usuario Default', 'default@taskmanager.local', 'no-auth']);
    echo "✓ Default user created successfully\n\n";

    // Verify
    echo "3. Verifying user creation...\n";
    $stmt = $db->prepare("SELECT * FROM usuarios WHERE id = 1");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "✓ User verified:\n";
        echo "  - ID: {$user['id']}\n";
        echo "  - Nombre: {$user['nombre']}\n";
        echo "  - Email: {$user['email']}\n\n";
    } else {
        echo "✗ User verification failed\n";
        exit(1);
    }

    // Test task insertion
    echo "4. Testing task insertion...\n";
    $stmt = $db->prepare("INSERT INTO tareas (usuario_id, titulo, descripcion, fecha_limite, prioridad, estado) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([1, 'Test Task - Auto Fix', 'Testing after fix', '2026-02-10', 'Media', 'Pendiente']);

    $newId = $db->lastInsertId();
    echo "✓ Task created successfully with ID: $newId\n";

    // Clean up test task
    $stmt = $db->prepare("DELETE FROM tareas WHERE id = ?");
    $stmt->execute([$newId]);
    echo "✓ Test task cleaned up\n\n";

    echo "=== Fix Complete! ===\n";
    echo "You can now create tasks in your application.\n";

} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
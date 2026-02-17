<?php
require_once 'config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $sql = file_get_contents('update_schema_v2.sql');

    // Split by semicolon if multiple queries, but here it's arguably one or two.
    // The use statement might confuse PDO if not handled right, but let's try direct execution.
    // PDO doesn't support 'USE' usually inside the same call if it expects a single statement prepared, 
    // but exec() can handle it or we relying on config/db.php to select DB.
    // config/db.php likely selects the DB. Content of sql has 'use'.

    // Let's remove 'use task_manager;' to be safe if db.php already connects to it.
    // Actually, let's just run the ALTER.

    $queries = explode(';', $sql);

    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            $db->exec($query);
            echo "Executed: " . substr($query, 0, 50) . "...\n";
        }
    }

    echo "Migration v2 applied successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
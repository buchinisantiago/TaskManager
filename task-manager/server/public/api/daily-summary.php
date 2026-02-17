<?php
// Daily Summary Endpoint for Google Apps Script
// Returns tasks for today and tomorrow in JSON format

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Basic security: Only allow requests with a secret token
// You can make this more secure by checking IP, using OAuth, etc.
$SECRET_TOKEN = "tu_token_secreto_aqui_123"; // CHANGE THIS!

if (!isset($_GET['token']) || $_GET['token'] !== $SECRET_TOKEN) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

include_once '../../config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

try {
    // Get today's date
    $today = date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime('+1 day'));

    // Get tasks for today
    $stmtToday = $db->prepare("
        SELECT id, titulo, descripcion, fecha_limite, prioridad, estado 
        FROM tareas 
        WHERE fecha_limite = ? AND estado != 'Completada'
        ORDER BY prioridad DESC, titulo ASC
    ");
    $stmtToday->execute([$today]);
    $tasksToday = $stmtToday->fetchAll(PDO::FETCH_ASSOC);

    // Get tasks for tomorrow
    $stmtTomorrow = $db->prepare("
        SELECT id, titulo, descripcion, fecha_limite, prioridad, estado 
        FROM tareas 
        WHERE fecha_limite = ? AND estado != 'Completada'
        ORDER BY prioridad DESC, titulo ASC
    ");
    $stmtTomorrow->execute([$tomorrow]);
    $tasksTomorrow = $stmtTomorrow->fetchAll(PDO::FETCH_ASSOC);

    // Format response
    $response = [
        "success" => true,
        "today" => [
            "date" => $today,
            "count" => count($tasksToday),
            "tasks" => $tasksToday
        ],
        "tomorrow" => [
            "date" => $tomorrow,
            "count" => count($tasksTomorrow),
            "tasks" => $tasksTomorrow
        ],
        "generated_at" => date('Y-m-d H:i:s')
    ];

    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database error",
        "message" => $e->getMessage()
    ]);
}
?>
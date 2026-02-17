<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS"); // Added POST
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db_name = 'task_manager';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get input data
    $data = json_decode(file_get_contents("php://input"));
    $cutoff_date = isset($data->date) ? $data->date : null;

    if (!$cutoff_date) {
        throw new Exception("Fecha de corte requerida");
    }

    // 1. SELECT tasks to be deleted (Comparison on dueDate)
    // We purge Completada/Cancelada tasks where dueDate <= cutoff_date
    $sqlSelect = "SELECT * FROM tareas 
                  WHERE estado IN ('Completada', 'Cancelada') 
                  AND fecha_limite <= :date";

    $stmtSelect = $conn->prepare($sqlSelect);
    $stmtSelect->bindParam(':date', $cutoff_date);
    $stmtSelect->execute();
    $tasks = $stmtSelect->fetchAll(PDO::FETCH_ASSOC);

    if (count($tasks) === 0) {
        echo json_encode(["message" => "No tasks found to purge", "deleted_count" => 0, "csv_data" => null]);
        exit();
    }

    // 2. Generate CSV Content
    $csv_output = fopen('php://temp', 'r+');
    // Add headers
    fputcsv($csv_output, ['ID', 'Titulo', 'Descripcion', 'Estado', 'Prioridad', 'Fecha Limite', 'Fecha Creacion', 'Responsable', 'Fecha Completada']);

    foreach ($tasks as $task) {
        fputcsv($csv_output, [
            $task['id'],
            $task['titulo'],
            $task['descripcion'],
            $task['estado'],
            $task['prioridad'],
            $task['fecha_limite'],
            $task['fecha_creacion'],
            $task['responsable'],
            $task['fecha_completada']
        ]);
    }

    rewind($csv_output);
    $csv_content = stream_get_contents($csv_output);
    fclose($csv_output);

    // 3. DELETE the tasks
    $sqlDelete = "DELETE FROM tareas 
                  WHERE estado IN ('Completada', 'Cancelada') 
                  AND fecha_limite <= :date";
    $stmtDelete = $conn->prepare($sqlDelete);
    $stmtDelete->bindParam(':date', $cutoff_date);
    $stmtDelete->execute();
    $deleted_count = $stmtDelete->rowCount();

    echo json_encode([
        "message" => "Purge successful",
        "deleted_count" => $deleted_count,
        "csv_data" => base64_encode($csv_content) // Encode to safely pass in JSON
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Purge failed: " . $e->getMessage()]);
}
?>
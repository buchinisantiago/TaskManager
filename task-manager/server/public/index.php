<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/db.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Parse the request
$request = $_SERVER['REQUEST_URI'];
$request = strtok($request, '?');
$method = $_SERVER['REQUEST_METHOD'];

// Extract task ID if present (e.g., /api/tasks/123)
$taskId = null;
if (preg_match('/\/api\/tasks\/(\d+)/', $request, $matches)) {
    $taskId = $matches[1];
}

// Route: /api/daily-summary.php
if ($request === '/api/daily-summary.php' || $request === '/api/daily-summary') {
    require_once __DIR__ . '/api/daily-summary.php';
    exit;
}

// Route: /api/purge_tasks.php
if ($request === '/api/purge_tasks.php' || $request === '/api/purge_tasks') {
    require_once __DIR__ . '/api/purge_tasks.php';
    exit;
}

// Route: /api/tasks
if (strpos($request, '/api/tasks') !== false) {

    // GET - List all tasks or get single task
    if ($method === 'GET') {
        try {
            if ($taskId) {
                $stmt = $db->prepare("SELECT * FROM tareas WHERE id = ?");
                $stmt->execute([$taskId]);
                $task = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($task) {
                    echo json_encode($task);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Task not found"]);
                }
            } else {
                // Get all tasks (using usuario_id = 1 for now, no auth)
                $stmt = $db->prepare("SELECT * FROM tareas ORDER BY fecha_creacion DESC");
                $stmt->execute();
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($tasks);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error fetching tasks", "error" => $e->getMessage()]);
        }
        exit;
    }

    // POST - Create new task
    if ($method === 'POST') {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!isset($data['titulo']) || empty($data['titulo'])) {
                http_response_code(400);
                echo json_encode(["message" => "Title is required"]);
                exit;
            }

            $stmt = $db->prepare("INSERT INTO tareas (usuario_id, titulo, descripcion, fecha_limite, prioridad, estado, responsable) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                1, // Default user ID (no auth for now)
                $data['titulo'],
                $data['descripcion'] ?? '',
                $data['fecha_limite'] ?? null,
                $data['prioridad'] ?? 'Baja',
                $data['estado'] ?? 'Pendiente',
                $data['responsable'] ?? 'Cache'
            ]);

            $newId = $db->lastInsertId();

            // Fetch the created task
            $stmt = $db->prepare("SELECT * FROM tareas WHERE id = ?");
            $stmt->execute([$newId]);
            $task = $stmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(201);
            echo json_encode($task);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error creating task", "error" => $e->getMessage()]);
        }
        exit;
    }

    // PUT - Update task
    if ($method === 'PUT' && $taskId) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            // Build dynamic update query
            $fields = [];
            $values = [];

            if (isset($data['titulo'])) {
                $fields[] = "titulo = ?";
                $values[] = $data['titulo'];
            }
            if (isset($data['descripcion'])) {
                $fields[] = "descripcion = ?";
                $values[] = $data['descripcion'];
            }
            if (isset($data['fecha_limite'])) {
                $fields[] = "fecha_limite = ?";
                $values[] = $data['fecha_limite'];
            }
            if (isset($data['prioridad'])) {
                $fields[] = "prioridad = ?";
                $values[] = $data['prioridad'];
            }
            if (isset($data['estado'])) {
                $fields[] = "estado = ?";
                $values[] = $data['estado'];

                // Handle completion date logic
                if ($data['estado'] === 'Completada') {
                    $fields[] = "fecha_completada = NOW()";
                } else {
                    $fields[] = "fecha_completada = NULL";
                }
            }
            if (isset($data['responsable'])) {
                $fields[] = "responsable = ?";
                $values[] = $data['responsable'];
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(["message" => "No fields to update"]);
                exit;
            }

            $values[] = $taskId;
            $sql = "UPDATE tareas SET " . implode(", ", $fields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($values);

            // Fetch the updated task
            $stmt = $db->prepare("SELECT * FROM tareas WHERE id = ?");
            $stmt->execute([$taskId]);
            $task = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode($task);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error updating task", "error" => $e->getMessage()]);
        }
        exit;
    }

    // DELETE - Delete task
    if ($method === 'DELETE' && $taskId) {
        try {
            $stmt = $db->prepare("DELETE FROM tareas WHERE id = ?");
            $stmt->execute([$taskId]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["message" => "Task deleted successfully"]);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Task not found"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error deleting task", "error" => $e->getMessage()]);
        }
        exit;
    }
}

// Test endpoint
if (strpos($request, '/api/test') !== false) {
    echo json_encode(["message" => "Task Manager API is running (PHP)"]);
    exit;
}

// Default 404
http_response_code(404);
echo json_encode(["message" => "Endpoint not found", "path" => $request]);
?>
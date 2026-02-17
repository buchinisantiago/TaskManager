<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = 'localhost';
$db_name = 'task_manager';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = file_get_contents(__DIR__ . '/update_schema_v3.sql');
    $conn->exec($sql);

    echo json_encode(["message" => "Migration v3 applied successfully"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Migration failed: " . $e->getMessage()]);
}
?>
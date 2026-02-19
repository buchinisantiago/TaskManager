<?php
class Database
{
    private $conn;

    public function getConnection()
    {
        $this->conn = null;

        // Check for environment variable (Render/Supabase)
        $database_url = getenv('DATABASE_URL');

        try {
            if ($database_url) {
                // Production Connection (PostgreSQL)
                $dbopts = parse_url($database_url);
                $host = $dbopts["host"];
                $port = $dbopts["port"];
                $user = $dbopts["user"];
                $pass = $dbopts["pass"];
                $dbname = ltrim($dbopts["path"], '/');

                $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
                $this->conn = new PDO($dsn, $user, $pass);
            } else {
                // Local Connection (MySQL - XAMPP)
                $host = "localhost";
                $db_name = "task_manager";
                $username = "root";
                $password = "";

                $this->conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
                $this->conn->exec("set names utf8");
            }

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
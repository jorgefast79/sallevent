<?php
// databaseOperations/connect.php

class ConectionDB {

    // Evitar instanciación
    private function __construct() {}

    // Cargar .env simple (si existe). No requiere composer.
    private static function load_dotenv($path) {
        if (!file_exists($path)) return;
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            if (strpos($line, '=') === false) continue;
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            // Quitar comillas si existen
            if ((substr($val,0,1) === '"' && substr($val,-1) === '"') ||
                (substr($val,0,1) === "'" && substr($val,-1) === "'")) {
                $val = substr($val,1,-1);
            }
            // Sólo setear si no existe en el entorno
            if (getenv($key) === false) {
                putenv(sprintf('%s=%s', $key, $val));
                $_ENV[$key] = $val;
                $_SERVER[$key] = $val;
            }
        }
    }

    public static function get_connection(): mysqli {
        // Intentar cargar .env desde la raíz del proyecto (ajusta si tu estructura es distinta)
        $projectRoot = dirname(__DIR__, 1); // ../ desde databaseOperations
        $dotenvPath = $projectRoot . '/.env';
        self::load_dotenv($dotenvPath);

        // Leer variables de entorno (si no están, usar valores por defecto locales)
        $servername = getenv('DB_HOST') ?: '127.0.0.1';
        $username   = getenv('DB_USER') ?: 'root';
        $password   = getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'Universo_800';
        $database   = getenv('DB_NAME') ?: 'sallevent';
        $port_env   = getenv('DB_PORT') ?: '3306';

        $port = intval($port_env);

        // Habilitar reporting para que mysqli lance excepciones (útil en dev)
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        try {
            $connection = new mysqli($servername, $username, $password, $database, $port);
            // Forzar charset utf8mb4 si quieres:
            if ($connection instanceof mysqli) {
                $connection->set_charset("utf8mb4");
            }
            return $connection;
        } catch (mysqli_sql_exception $ex) {
            // Mensaje más claro para debugeo. En producción usa logs en vez de die.
            die("DB connection failed: (" . $ex->getCode() . ") " . $ex->getMessage());
        }
    }
}
?>

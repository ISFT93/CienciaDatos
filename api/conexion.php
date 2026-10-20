<?php
// Conexión a la base de datos.

const DB_HOST = 'localhost';
const DB_NAME = 'ciencia_datos';
const DB_USER = 'root';
const DB_PASS = '';

// Abre la conexión a MySQL. Se usa utf8mb4 para guardar bien acentos y "ñ", y
// los errores de SQL lanzan excepciones (las atrapa el manejador de utilidades.php).
// EMULATE_PREPARES en false hace que las consultas preparadas las resuelva MySQL.
function conectar(): PDO
{
    return new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
}

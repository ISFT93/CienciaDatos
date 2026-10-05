<?php

$conexion = new mysqli(
    "localhost",
    "root",
    "",
    "ciencia_datos"
);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

?>
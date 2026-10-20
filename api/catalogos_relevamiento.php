<?php
// Devuelve las opciones de los desplegables, chips y destinos del formulario.

require __DIR__ . '/conexion.php';
require __DIR__ . '/utilidades.php';

$pdo = conectar();

$lista = fn(string $sql): array => $pdo->query($sql)->fetchAll();

responder([
    'tipos'       => $lista('SELECT codigo, nombre FROM tipos_establecimiento WHERE activo = 1 ORDER BY nombre'),
    'localidades' => $lista('SELECT codigo, nombre FROM localidades WHERE activo = 1 ORDER BY nombre'),
    'productos'   => $lista('SELECT codigo, nombre FROM productos_lacteos WHERE activo = 1 ORDER BY nombre'),
    'destinos'    => $lista('SELECT codigo, nombre FROM destinos_lactosuero WHERE activo = 1 ORDER BY orden, nombre'),
]);

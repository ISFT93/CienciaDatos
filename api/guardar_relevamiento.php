<?php
// Recibe el relevamiento (JSON), lo valida y lo guarda en una transacción.

require __DIR__ . '/conexion.php';
require __DIR__ . '/utilidades.php';

// Corta con un error de validación (HTTP 422). El mensaje se muestra al usuario.
function fallo(string $mensaje): never
{
    responder(['ok' => false, 'error' => $mensaje], 422);
}

// Devuelve el texto recortado y limitado a $max caracteres, o null si está vacío.
function texto(mixed $valor, int $max): ?string
{
    if (!is_string($valor)) return null;
    $valor = trim($valor);
    return $valor === '' ? null : mb_substr($valor, 0, $max);
}

// Valida que el valor sea numérico y esté entre $min y $max. Vacío es null,
// salvo que el campo sea requerido.
function numero(mixed $valor, string $campo, float $min, float $max, bool $requerido = false): ?float
{
    if ($valor === null || $valor === '') {
        if ($requerido) fallo("$campo es obligatorio.");
        return null;
    }
    if (!is_numeric($valor) || $valor < $min || $valor > $max) {
        fallo("$campo debe ser un número entre $min y $max.");
    }
    return (float)$valor;
}

// Traduce el "codigo" que manda el navegador (p. ej. 'san-vicente') al id de la
// tabla de catálogo. Devuelve null si no existe o está inactivo: así el cliente
// no puede guardar opciones inventadas.
// $tabla viene siempre de literales de este archivo, nunca del cliente.
function idPorCodigo(PDO $pdo, string $tabla, mixed $codigo): ?int
{
    if (!is_string($codigo) || $codigo === '') return null;
    $st = $pdo->prepare("SELECT id FROM $tabla WHERE codigo = ? AND activo = 1");
    $st->execute([$codigo]);
    $id = $st->fetchColumn();
    return $id === false ? null : (int)$id;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

// El cuerpo llega como JSON (no como formulario clásico), así que se lee de php://input.
$d = json_decode(file_get_contents('php://input'), true);
if (!is_array($d)) {
    responder(['ok' => false, 'error' => 'Datos inválidos.'], 400);
}

$pdo = conectar();

// Se valida todo acá aunque el JS ya lo haga: cualquiera puede llamar a este
// endpoint sin pasar por el formulario.

// --- Identificación
$nombre = texto($d['nombre_establecimiento'] ?? null, 150) ?? fallo('El nombre del establecimiento es obligatorio.');
$tipoId = idPorCodigo($pdo, 'tipos_establecimiento', $d['tipo'] ?? null) ?? fallo('Seleccioná un tipo de establecimiento válido.');

$localidadId = null;
$localidadOtro = null;
if (($d['localidad'] ?? null) === 'otro') {
    $localidadOtro = texto($d['localidad_otro'] ?? null, 100) ?? fallo('Especificá la localidad.');
} else {
    $localidadId = idPorCodigo($pdo, 'localidades', $d['localidad'] ?? null) ?? fallo('Seleccioná una localidad válida.');
}

$direccion = texto($d['direccion'] ?? null, 255);

$latitud = $longitud = null;
if (is_string($d['coordenadas'] ?? null) && preg_match('/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/', $d['coordenadas'], $m)) {
    if (abs((float)$m[1]) <= 90 && abs((float)$m[2]) <= 180) {
        $latitud = (float)$m[1];
        $longitud = (float)$m[2];
    }
}

// --- Producción
$leche = numero($d['litros_leche_dia'] ?? null, 'Litros de leche por día', 0, 99999999, true);
$dias = (int)numero($d['dias_produccion'] ?? null, 'Días de producción por semana', 1, 7, true);

$productosIds = [];
foreach (array_unique((array)($d['productos'] ?? [])) as $codigo) {
    $productosIds[] = idPorCodigo($pdo, 'productos_lacteos', $codigo) ?? fallo('Producto lácteo inválido.');
}
$productosOtro = texto($d['productos_otro'] ?? null, 150);

// --- Lactosuero
$generaTexto = $d['genera_lactosuero'] ?? null;
if (!in_array($generaTexto, ['si', 'no'], true)) fallo('Indicá si genera lactosuero.');
$genera = $generaTexto === 'si';

// Si no genera lactosuero se ignoran los litros y los destinos, aunque vengan en el JSON.
$suero = null;
$destinos = [];
if ($genera) {
    $suero = numero($d['litros_suero_dia'] ?? null, 'Litros de lactosuero por día', 0, 99999999);
    $suma = 0.0;
    foreach ((array)($d['destinos'] ?? []) as $codigo => $porcentaje) {
        if ($porcentaje === null || $porcentaje === '') continue;
        $pct = numero($porcentaje, 'El porcentaje de destino', 0, 100);
        $destinoId = idPorCodigo($pdo, 'destinos_lactosuero', $codigo) ?? fallo('Destino de lactosuero inválido.');
        $destinos[$destinoId] = $pct;
        $suma += $pct;
    }
    if ($suma > 100) fallo('La suma de los porcentajes no puede superar 100%.');
}

// --- Estacionalidad
$niveles = ['alta', 'media', 'baja', 'no_produce'];
$estacionalidad = [];
foreach ((array)($d['estacionalidad'] ?? []) as $mes => $nivel) {
    if (!in_array((int)$mes, range(1, 12), true) || !in_array($nivel, $niveles, true)) {
        fallo('Estacionalidad inválida.');
    }
    $estacionalidad[(int)$mes] = $nivel;
}

// --- Infraestructura e interés
$frio = $d['almacenamiento_frio'] ?? null;
if ($frio !== null && $frio !== '' && !in_array($frio, ['si', 'no', 'nosabe'], true)) fallo('Opción de frío inválida.');
$frio = $frio === '' ? null : $frio;
$litrosFrio = $frio === 'si' ? numero($d['litros_frio'] ?? null, 'Litros de almacenamiento en frío', 0, 99999999) : null;

$interes = $d['interes_alternativas'] ?? null;
if ($interes !== null && $interes !== '' && !in_array($interes, ['si', 'no', 'tal_vez'], true)) fallo('Opción de interés inválida.');
$interes = $interes === '' ? null : $interes;

// --- Guardado
// Transacción: se insertan el relevamiento y todas sus filas hijas, o ninguna.
// Si algo falla a mitad de camino, el rollBack evita datos incompletos.
$pdo->beginTransaction();
try {
    $pdo->prepare(
        'INSERT INTO relevamientos
            (nombre_establecimiento, tipo_id, localidad_id, localidad_otro, direccion, latitud, longitud,
             litros_leche_dia, dias_produccion, genera_lactosuero, litros_suero_dia, productos_otro,
             almacenamiento_frio, litros_frio, interes_alternativas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $nombre, $tipoId, $localidadId, $localidadOtro, $direccion, $latitud, $longitud,
        $leche, $dias, (int)$genera, $suero, $productosOtro,
        $frio, $litrosFrio, $interes,
    ]);
    $id = (int)$pdo->lastInsertId();

    $st = $pdo->prepare('INSERT INTO relevamiento_productos (relevamiento_id, producto_id) VALUES (?, ?)');
    foreach ($productosIds as $productoId) $st->execute([$id, $productoId]);

    $st = $pdo->prepare('INSERT INTO relevamiento_destinos (relevamiento_id, destino_id, porcentaje) VALUES (?, ?, ?)');
    foreach ($destinos as $destinoId => $pct) $st->execute([$id, $destinoId, $pct]);

    $st = $pdo->prepare('INSERT INTO relevamiento_estacionalidad (relevamiento_id, mes, nivel) VALUES (?, ?, ?)');
    foreach ($estacionalidad as $mes => $nivel) $st->execute([$id, $mes, $nivel]);

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}

responder(['ok' => true, 'id' => $id], 201);

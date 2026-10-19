<?php
// Devuelve los relevamientos cargados y los datos que arma el dashboard de lactosuero.html.

require __DIR__ . '/conexion.php';
require __DIR__ . '/utilidades.php';

$pdo = conectar();

$etiquetasInteres = ['si' => 'Sí', 'no' => 'No', 'tal_vez' => 'Tal vez'];

// Un registro por relevamiento, indexado por id. Las consultas siguientes
// (productos y estacionalidad) completan cada registro usando ese id.
$registros = [];
$filas = $pdo->query(
    'SELECT r.id, r.nombre_establecimiento AS nombre, COALESCE(l.nombre, r.localidad_otro) AS localidad,
            t.nombre AS tipo, r.litros_leche_dia AS leche, r.genera_lactosuero AS genera,
            r.litros_suero_dia AS suero, r.interes_alternativas AS interes, r.almacenamiento_frio AS frio
       FROM relevamientos r
       JOIN tipos_establecimiento t ON t.id = r.tipo_id
       LEFT JOIN localidades l ON l.id = r.localidad_id
      ORDER BY r.id'
)->fetchAll();

foreach ($filas as $f) {
    $registros[$f['id']] = [
        'nombre'         => $f['nombre'],
        'localidad'      => $f['localidad'],
        'tipo'           => $f['tipo'],
        'leche'          => (float)$f['leche'],
        'generaSuero'    => (bool)$f['genera'],
        'suero'          => $f['suero'] === null ? null : (float)$f['suero'],
        'interes'        => $etiquetasInteres[$f['interes']] ?? '—',
        'frio'           => $f['frio'],
        'productos'      => [],
        'estacionalidad' => array_fill(0, 12, null),
    ];
}

$filas = $pdo->query(
    'SELECT rp.relevamiento_id AS id, p.codigo
       FROM relevamiento_productos rp JOIN productos_lacteos p ON p.id = rp.producto_id'
)->fetchAll();
foreach ($filas as $f) $registros[$f['id']]['productos'][] = $f['codigo'];

// estacionalidad es un array de 12 posiciones (enero = 0). Los meses que el
// establecimiento no respondió quedan en null.
$filas = $pdo->query('SELECT relevamiento_id AS id, mes, nivel FROM relevamiento_estacionalidad')->fetchAll();
foreach ($filas as $f) $registros[$f['id']]['estacionalidad'][$f['mes'] - 1] = $f['nivel'];

// Destinos: el porcentaje de cada uno es su parte del total declarado (suma 100).
$destinos = $pdo->query(
    'SELECT d.codigo, d.nombre AS etiqueta, COALESCE(SUM(rd.porcentaje), 0) AS total
       FROM destinos_lactosuero d
       LEFT JOIN relevamiento_destinos rd ON rd.destino_id = d.id
      WHERE d.activo = 1 OR d.id IN (SELECT destino_id FROM relevamiento_destinos)
      GROUP BY d.id
      ORDER BY d.orden, d.nombre'
)->fetchAll();

$sumaTotal = array_sum(array_column($destinos, 'total'));
foreach ($destinos as &$d) {
    $d['porcentaje'] = $sumaTotal > 0 ? (int)round($d['total'] / $sumaTotal * 100) : 0;
    unset($d['total']);
}
unset($d);
if ($sumaTotal > 0 && $destinos) {
    // El redondeo puede dejar la suma en 99 o 101: se corrige en el primer destino.
    $destinos[0]['porcentaje'] += 100 - array_sum(array_column($destinos, 'porcentaje'));
}

$productos = $pdo->query(
    'SELECT codigo AS clave, nombre AS etiqueta FROM productos_lacteos
      WHERE activo = 1 OR id IN (SELECT producto_id FROM relevamiento_productos)
      ORDER BY nombre'
)->fetchAll();

responder([
    'registros' => array_values($registros),
    'destinos'  => $destinos,
    'productos' => $productos,
]);

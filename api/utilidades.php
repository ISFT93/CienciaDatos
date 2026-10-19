<?php
// Utilidades compartidas por los endpoints de /api.

// Termina la petición devolviendo JSON. Todos los endpoints responden por acá.
function responder(array $datos, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Cualquier excepción no controlada (p. ej. MySQL apagado) devuelve un 500 en JSON
// sin exponer detalles internos al navegador.
set_exception_handler(function (Throwable $e) {
    error_log($e->getMessage());
    responder(['ok' => false, 'error' => 'Error interno del servidor.'], 500);
});

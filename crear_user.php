<?php

require_once "conexion.php";

$usuario = "CAMBIAR_USUARIO";
$password = "CAMBIAR_CONTRASEÑA";

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conexion->prepare(
    "INSERT INTO usuarios_admin (usuario, password)
     VALUES (?, ?)"
);

$stmt->bind_param("ss", $usuario, $password_hash);

$stmt->execute();

$stmt->close();

echo "Usuario administrador creado correctamente.";

?>
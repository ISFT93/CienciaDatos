<?php

session_start();

if (!isset($_SESSION["admin_id"])) {
    header("Location: login.php");
    exit;
}

require_once "conexion.php";

$resultado = $conexion->query(
    "SELECT id_consulta, nombre, email, consulta, fecha
     FROM consultas
     ORDER BY fecha DESC"
);

?>

<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Panel | Ciencia de Datos</title>

    <link rel="stylesheet" href="css/styles.css">

</head>

<body>

    <main>

        <section class="seccion activa">

            <h1 class="titulo-panel">Panel de administración</h1>

            <p>
                Bienvenido, <?php echo htmlspecialchars($_SESSION["admin_usuario"]); ?>.
            </p>

            <a href="logout.php" class="btn-cerrar-sesion">
                Cerrar sesión
            </a>

            <h2 class="titulo-consultas">
                Consultas recibidas
            </h2>

            <div class="tabla-contenedor">
            <table class="tabla-consultas">

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Consulta</th>
                    <th>Fecha</th>
                </tr>
            </thead>

            <tbody>

                <?php while ($consulta = $resultado->fetch_assoc()): ?>

                    <tr>

                        <td>
                            <?php echo $consulta["id_consulta"]; ?>
                        </td>

                        <td>
                            <?php echo htmlspecialchars($consulta["nombre"]); ?>
                        </td>

                        <td>
                            <?php echo htmlspecialchars($consulta["email"]); ?>
                        </td>

                        <td>
                            <?php echo htmlspecialchars($consulta["consulta"]); ?>
                        </td>

                        <td>
                            <?php echo $consulta["fecha"]; ?>
                        </td>

                    </tr>

                <?php endwhile; ?>

            </tbody>

        </table>
        </div>

        </section>

    </main>

</body>

</html>
<?php

require_once "conexion.php";

$mensaje = "";

if (isset($_GET["enviada"]) && $_GET["enviada"] == "1") {
    $mensaje = "Consulta enviada correctamente.";
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $nombre = trim($_POST["nombre"]);
    $email = trim($_POST["email"]);
    $consulta = trim($_POST["consulta"]);

    $stmt = $conexion->prepare(
        "INSERT INTO consultas (nombre, email, consulta) VALUES (?, ?, ?)"
    );

    $stmt->bind_param("sss", $nombre, $email, $consulta);

    $stmt->execute();

    $stmt->close();

    header("Location: consultas.php?enviada=1");
    exit;

    
}

?>

<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Consultas | Ciencia de Datos</title>

    <link rel="stylesheet" href="css/styles.css">

</head>

<body>

    <div id="navbar"></div>

    <main>

        <section class="seccion activa">

            <h1>Consultas</h1>

            <p>
                ¿Tenés alguna pregunta? Dejanos tu consulta y nos pondremos en contacto.
            </p>

            <form method="POST" action="consultas.php" class="form-consultas">

                <div class="campo">
                    <label for="nombre">Nombre</label>
                    <input type="text" id="nombre" name="nombre" required>
                </div>

                <div class="campo">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <div class="campo">
                    <label for="consulta">Consulta</label>
                    <textarea id="consulta" name="consulta" rows="6" required></textarea>
                </div>

                <button type="submit">Enviar consulta</button>

                <?php if ($mensaje != ""): ?>

                    <div class="mensaje-consulta">
                        <?php echo $mensaje; ?>
                    </div>

                <?php endif; ?>

            </form>

        </section>

        <footer class="footer" id="footer"></footer>

    </main>

    <script src="js/navbar.js"></script>
    <script src="js/footer.js"></script>

    <script>

        setTimeout(function() {

            const mensaje = document.querySelector(".mensaje-consulta");

            if (mensaje) {
                mensaje.remove();
            }

        }, 3000);

    </script>

</body>

</html>
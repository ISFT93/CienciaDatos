<?php

session_set_cookie_params([
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

if (empty($_SESSION["csrf_token"])) {
    $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
}

require_once "conexion.php";

$mensaje = "";

if (!isset($_SESSION["intentos_login"])) {
    $_SESSION["intentos_login"] = 0;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    if (
        !isset($_POST["csrf_token"]) ||
        !hash_equals($_SESSION["csrf_token"], $_POST["csrf_token"])
    ) {
        die("Solicitud no válida.");
    }

    /*
     * COMPROBAR BLOQUEO
     */

    if (
        isset($_SESSION["bloqueo_login"]) &&
        time() - $_SESSION["bloqueo_login"] < 300
    ) {

        $mensaje = "Demasiados intentos. Volvé a intentar en 5 minutos.";

    } else {

        /*
         * SI PASARON LOS 5 MINUTOS, REINICIAR
         */

        if (
            isset($_SESSION["bloqueo_login"]) &&
            time() - $_SESSION["bloqueo_login"] >= 300
        ) {
            $_SESSION["intentos_login"] = 0;
            unset($_SESSION["bloqueo_login"]);
        }

        $usuario = trim($_POST["usuario"]);
        $password = $_POST["password"];

        $stmt = $conexion->prepare(
            "SELECT id_admin, usuario, password
             FROM usuarios_admin
             WHERE usuario = ?"
        );

        $stmt->bind_param("s", $usuario);
        $stmt->execute();

        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 1) {

            $admin = $resultado->fetch_assoc();

            if (password_verify($password, $admin["password"])) {

                session_regenerate_id(true);

                $_SESSION["intentos_login"] = 0;

                unset($_SESSION["bloqueo_login"]);

                $_SESSION["admin_id"] = $admin["id_admin"];
                $_SESSION["admin_usuario"] = $admin["usuario"];

                header("Location: panel.php");
                exit;
            }
        }

        /*
         * LOGIN INCORRECTO
         */

        $_SESSION["intentos_login"]++;

        if ($_SESSION["intentos_login"] >= 5) {

            $_SESSION["bloqueo_login"] = time();

            $mensaje = "Demasiados intentos. Volvé a intentar en 5 minutos.";

        } else {

            $mensaje = "Usuario o contraseña incorrectos.";
        }

        $stmt->close();
    }
}

?>

<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Acceso | Ciencia de Datos</title>

    <link rel="stylesheet" href="css/styles.css">

</head>

<body>

    <main>

        <section class="seccion activa">

            <h1>Acceso administrador</h1>

            <form method="POST" class="form-consultas">

                <input
                    type="hidden"
                    name="csrf_token"
                    value="<?php echo $_SESSION["csrf_token"]; ?>"
                >

                <div class="campo">

                    <label for="usuario">Usuario</label>

                    <input
                        type="text"
                        id="usuario"
                        name="usuario"
                        required
                    >

                </div>

                <div class="campo">

                    <label for="password">Contraseña</label>

                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                    >

                </div>

                <button type="submit">
                    Ingresar
                </button>

                <?php if ($mensaje != ""): ?>

                    <div class="mensaje-consulta">
                        <?php echo htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8'); ?>
                    </div>

                <?php endif; ?>

            </form>

        </section>

    </main>

</body>

</html>
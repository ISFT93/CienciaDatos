<?php

require "conexion.php";

$sql = "SELECT * FROM alumnos ORDER BY id";

$resultado = $conexion->query($sql);

?>

<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Alumnos | Ciencia de Datos</title>

    <link rel="icon" type="image/png" href="img/iso_logo.png">
    <link rel="stylesheet" href="css/styles.css">

</head>

<body>

    <div id="navbar"></div>

    <!-- SITIO PRINCIPAL -->
    <main class="web-principal visible">

        <!-- CONTENIDO -->
        <div class="contenido-principal">

            <!-- ALUMNOS -->
            <section id="alumnos" class="seccion activa">

                <div class="titulo-seccion">

                    <span class="numero">
                        02 / ALUMNOS
                    </span>

                    <h2>
                        Nuestros <span>alumnos.</span>
                    </h2>

                    <p>
                        Conocé a quienes forman parte de nuestro curso.
                    </p>

                </div>


                <!-- INFORMACIÓN INSTITUCIONAL -->

                <div class="info-grid">

                    <div class="info-texto">

                        <h3>
                            Instituto Superior de Formación Docente y Técnica N.º 93
                        </h3>

                        <p>
                            "Presidente Arturo Humberto Illia"
                        </p>

                        <p>
                            Tecnicatura Superior en Ciencia de Datos e IA
                        </p>

                    </div>


                    <div class="contacto">

                        <div class="contacto-item">

                            <span>
                                DIRECTORA
                            </span>

                            <strong>
                                Betiana Maricel Jacobsen
                            </strong>

                        </div>


                        <div class="contacto-item">

                            <span>
                                PROFESOR
                            </span>

                            <strong>
                                Soria, Sergio Daniel
                            </strong>

                        </div>


                        <div class="contacto-item">

                            <span>
                                CURSO / AÑO
                            </span>

                            <strong>
                                1.er año / 2026
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- CARDS DE ALUMNOS -->

                <div class="alumnos-grid">

                    <?php while ($alumno = $resultado->fetch_assoc()): ?>

                        <?php

                        $nombre = htmlspecialchars($alumno["nombre"], ENT_QUOTES, "UTF-8");
                        $iniciales = htmlspecialchars($alumno["iniciales"], ENT_QUOTES, "UTF-8");
                        $anio = htmlspecialchars($alumno["año"], ENT_QUOTES, "UTF-8");

                        ?>

                            <article
                                class="alumno"
                                onclick='abrirAlumno(
                                    <?php echo json_encode($alumno["nombre"]); ?>,
                                    <?php echo json_encode($alumno["iniciales"]); ?>,
                                    "",
                                    ""
                                )'>

                            <div class="avatar">
                                <?php echo $iniciales; ?>
                            </div>

                            <h3>
                                <?php echo $nombre; ?>
                            </h3>

                            <p>
                                1.er año · <?php echo $anio; ?>
                            </p>

                        </article>

                    <?php endwhile; ?>

                </div>


                <!-- TARJETA FLOTANTE DEL ALUMNO -->

                <div id="modalAlumno" class="modal-alumno">

                    <div class="tarjeta-alumno">

                        <button
                            class="cerrar-modal"
                            onclick="cerrarAlumno()">
                            ×
                        </button>

                        <img
                            id="fotoAlumno"
                            src=""
                            alt="Foto del alumno">

                        <h2 id="nombreAlumno">
                            Nombre
                        </h2>

                        <p id="telefonoAlumno"></p>

                        <p id="emailAlumno"></p>

                    </div>

                </div>

            </section>

        </div>


        <!-- FOOTER -->

        <footer class="footer" id="footer"></footer>

    </main>


    <script src="js/alumnos.js"></script>
    <script src="js/footer.js"></script>
    <script src="js/navbar.js"></script>

</body>

</html>


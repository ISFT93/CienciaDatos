document.addEventListener("DOMContentLoaded", function () {

    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    navbar.innerHTML = `
        <header class="navbar">

            <a href="index.html" class="logo">
                <img src="img/iso_logo.png" alt="Ciencia de Datos">

                <div>
                    <strong>Ciencia de Datos</strong>
                    <small>Curso 2026</small>
                </div>
            </a>

            <nav id="menuNavegacion">
                <a href="inicio.html">Inicio</a>
                <a href="nosotros.html">Nosotros</a>
                <a href="alumnos.php">Alumnos</a>
                <a href="proyectos.html">Proyectos</a>
                <a href="informacion.html">Información</a>
            </nav>

            <button class="btn-tema" id="btnTema">
                ☀
            </button>

            <button class="menu-hamburguesa" id="menuHamburguesa">
                ☰
            </button>

        </header>
    `;


    const botonMenu = document.getElementById("menuHamburguesa");
    const menu = document.getElementById("menuNavegacion");


    botonMenu.addEventListener("click", function () {

        menu.classList.toggle("menu-abierto");

    });

    const botonTema = document.getElementById("btnTema");

    const temaGuardado = localStorage.getItem("tema");

    if (temaGuardado === "claro") {
        document.body.classList.add("modo-claro");
        botonTema.textContent = "🌙";
    }

    botonTema.addEventListener("click", function () {

        document.body.classList.toggle("modo-claro");

        if (document.body.classList.contains("modo-claro")) {

            botonTema.textContent = "🌙";
            localStorage.setItem("tema", "claro");

        } else {

            botonTema.textContent = "☀";
            localStorage.setItem("tema", "oscuro");

        }

    });

});
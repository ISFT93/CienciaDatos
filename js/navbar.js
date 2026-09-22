document.addEventListener("DOMContentLoaded", function () {

    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    navbar.innerHTML = `
        <header class="navbar">

            <div class="logo">
                <img src="../img/logo2.png" alt="Ciencia de Datos">
            </div>

            <button class="menu-hamburguesa" id="menuHamburguesa">
                ☰
            </button>

            <nav id="menuNavegacion">
                <a href="inicio.html">Inicio</a>
                <a href="nosotros.html">Nosotros</a>
                <a href="alumnos.html">Alumnos</a>
                <a href="proyectos.html">Proyectos</a>
                <a href="informacion.html">Información</a>
            </nav>

        </header>
    `;


    const botonMenu = document.getElementById("menuHamburguesa");
    const menu = document.getElementById("menuNavegacion");


    botonMenu.addEventListener("click", function () {

        menu.classList.toggle("menu-abierto");

    });

});
/* =========================================
   FOOTER COMPARTIDO
   -----------------------------------------
   El footer se escribe UNA SOLA VEZ en este
   archivo y se carga en todas las páginas.

   Cada página solo tiene:
     <footer class="footer" id="footer"></footer>
     <script src="footer.js"></script>

   Para cambiar el footer en todo el sitio,
   se modifica únicamente este archivo.
========================================= */


/* =========================================
   REDES Y CONTACTO
   -----------------------------------------
   Para agregar, quitar o cambiar una red,
   se edita esta lista. Cada red tiene:
     nombre -> texto que se muestra
     url    -> link al que lleva
     icono  -> dibujo SVG (ver ICONOS abajo)
========================================= */

const REDES = [
    {
        nombre: "Instagram",
        url: "https://www.instagram.com/isft93sv/",
        icono: "instagram"
    },
    {
        nombre: "Facebook",
        url: "https://www.facebook.com/",
        icono: "facebook"
    },
    {
        nombre: "Web del instituto",
        url: "https://isfdyt93-bue.infd.edu.ar/sitio/",
        icono: "web"
    },
    {
        // Abre Gmail con un correo nuevo para esta dirección
        nombre: "cienciadedatos@curso.edu",
        url: "https://mail.google.com/mail/?view=cm&fs=1&to=cienciadedatos@curso.edu",
        icono: "email"
    }
];


/* =========================================
   LINKS DE NAVEGACIÓN
========================================= */

const PAGINAS = [
    { nombre: "Inicio",      url: "inicio.html" },
    { nombre: "Nosotros",    url: "nosotros.html" },
    { nombre: "Alumnos",     url: "alumnos.php" },
    { nombre: "Proyectos",   url: "proyectos.html" },
    { nombre: "Información", url: "informacion.html" }
];


/* =========================================
   ICONOS (dibujos SVG)
========================================= */

const ICONOS = {

    instagram: `
        <rect x="3" y="3" width="18" height="18" rx="5"></rect>
        <circle cx="12" cy="12" r="4"></circle>
        <circle cx="17.5" cy="6.5" r="0.6"></circle>`,

    facebook: `
        <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z"></path>`,

    web: `
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"></path>`,

    email: `
        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
        <path d="M3 7l9 6 9-6"></path>`
};


/* =========================================
   ARMADO DEL FOOTER
========================================= */

function crearFooter() {

    const footer = document.getElementById("footer");

    // Si la página no tiene el hueco del footer, no hace nada
    if (!footer) {
        return;
    }

    // Arma un <li> por cada página de la lista PAGINAS
    const linksPaginas = PAGINAS.map(pagina => `
        <li>
            <a href="${pagina.url}">${pagina.nombre}</a>
        </li>
    `).join("");

    // Arma un <li> con ícono por cada red de la lista REDES
    const linksRedes = REDES.map(red => `
        <li>
            <a href="${red.url}" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    ${ICONOS[red.icono]}
                </svg>
                ${red.nombre}
            </a>
        </li>
    `).join("");

    // Inserta todo el footer dentro de <footer id="footer">
    footer.innerHTML = `

        <div class="footer-top">

            <div class="footer-marca">

                <div class="logo">
                    <img src="img/iso_logo.png" alt="Ciencia de Datos">

                    <div>
                        <strong>Ciencia de Datos</strong>
                        <small>Curso 2026</small>
                    </div>
                </div>

                <p>
                    Aprendemos a transformar datos en información,
                    información en conocimiento y conocimiento en decisiones.
                </p>

            </div>

            <div class="footer-col">
                <h4>Navegación</h4>
                <ul>${linksPaginas}</ul>
            </div>

            <div class="footer-col">
                <h4>Seguinos</h4>
                <ul class="footer-redes">${linksRedes}</ul>
            </div>

        </div>

        <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} CIENCIA DE DATOS · INSTITUTO 93</span>
            <span>DATOS · ANÁLISIS · INNOVACIÓN</span>
        </div>
    `;
}

crearFooter();

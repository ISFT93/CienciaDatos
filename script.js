/* =========================================
   ANIMACIÓN DEL BOTÓN INICIAR
========================================= */

const btnIniciar = document.getElementById("btnIniciar");
const pantallaInicio = document.getElementById("inicio");

btnIniciar.addEventListener("click", () => {

    // Activa la animación de salida
    pantallaInicio.classList.add("salir");

    // Después de la animación, abre la página principal
    setTimeout(() => {
        window.location.href = "inicio.html";
    }, 1500);

});



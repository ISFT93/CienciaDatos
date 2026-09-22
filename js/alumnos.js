/* =========================================
   TARJETA DE INFORMACIÓN DEL ALUMNO
========================================= */

function abrirAlumno(nombre, iniciales, telefono, email) {

    const modal = document.getElementById("modalAlumno");

    const nombreElemento = document.getElementById("nombreAlumno");
    const telefonoElemento = document.getElementById("telefonoAlumno");
    const emailElemento = document.getElementById("emailAlumno");
    const fotoElemento = document.getElementById("fotoAlumno");

    nombreElemento.textContent = nombre;
    telefonoElemento.textContent = "📞 " + telefono;
    emailElemento.textContent = "✉ " + email;

    /*
       Por ahora usamos una imagen genérica.
       Después podemos poner una foto diferente
       para cada alumno.
    */
    fotoElemento.src = "https://i.pravatar.cc/300?u=" + iniciales;

    modal.classList.add("activo");
}


function cerrarAlumno() {

    const modal = document.getElementById("modalAlumno");

    modal.classList.remove("activo");
}


/* Cerrar haciendo clic fuera de la tarjeta */

document.getElementById("modalAlumno").addEventListener("click", function(event) {

    if (event.target === this) {
        cerrarAlumno();
    }

});
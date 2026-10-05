/* =========================================
   RELEVAMIENTO — WIZARD MULTI-PASO
   (sin guardado, sin backend: solo interacción
   en el navegador para mostrar el diseño)
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("form-relevamiento");

    if (!form) return;

    const TOTAL_PASOS = form.querySelectorAll(".form-paso").length;
    let pasoActual = 1;

    generarTablaEstacionalidad();
    inicializarChips(form);
    inicializarCamposOtro(form);
    inicializarCamposCondicionales(form);
    inicializarCamposCondicionalesSelect(form);
    inicializarPorcentajes(form);
    inicializarGeolocalizacion();
    inicializarValidacionNumerica(form);

    const elementosNav = {
        btnAnterior: document.getElementById("btn-anterior"),
        btnSiguiente: document.getElementById("btn-siguiente"),
        btnFinalizar: document.getElementById("btn-finalizar"),
        btnLimpiar: document.getElementById("btn-limpiar"),
    };

    mostrarPaso(form, pasoActual, TOTAL_PASOS, elementosNav);

    elementosNav.btnSiguiente.addEventListener("click", () => {

        if (!validarPaso(form, pasoActual)) return;

        pasoActual = Math.min(pasoActual + 1, TOTAL_PASOS);
        mostrarPaso(form, pasoActual, TOTAL_PASOS, elementosNav);
    });

    elementosNav.btnAnterior.addEventListener("click", () => {
        pasoActual = Math.max(pasoActual - 1, 1);
        mostrarPaso(form, pasoActual, TOTAL_PASOS, elementosNav);
    });

    const reiniciarFormulario = () => {
        form.reset();
        form.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("chip-seleccionado"));
        form.querySelectorAll(".input-otro").forEach((input) => {
            input.disabled = true;
            input.hidden = true;
            limpiarError(input);
        });
        form.querySelectorAll("[data-porcentaje-toggle]").forEach((checkbox) => {
            const input = document.getElementById(checkbox.dataset.porcentajeToggle);
            if (input) {
                input.disabled = true;
                input.value = "";
                limpiarError(input);
            }
        });
        form.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(limpiarError);
        form.querySelectorAll(".campo-condicional").forEach((campo) => (campo.hidden = true));
        const geolocEstado = document.getElementById("geoloc-estado");
        geolocEstado.hidden = true;
        geolocEstado.textContent = "";
        pasoActual = 1;
        mostrarPaso(form, pasoActual, TOTAL_PASOS, elementosNav);
    };

    elementosNav.btnLimpiar.addEventListener("click", reiniciarFormulario);

    form.addEventListener("submit", (evento) => {

        evento.preventDefault();

        if (!validarPaso(form, TOTAL_PASOS)) return;

        mostrarModalEnvio(reiniciarFormulario);
    });

    document.getElementById("wizard-pasos").addEventListener("click", (evento) => {

        const item = evento.target.closest(".wizard-paso-item");
        if (!item) return;

        const destino = Number(item.dataset.paso);

        if (destino > pasoActual && !validarRango(form, pasoActual, destino)) return;

        pasoActual = destino;
        mostrarPaso(form, pasoActual, TOTAL_PASOS, elementosNav);
    });

});


/* =========================================
   NAVEGACIÓN ENTRE PASOS
========================================= */

function mostrarPaso(form, paso, totalPasos, nav) {

    form.querySelectorAll(".form-paso").forEach((el) => {
        el.classList.toggle("activo", Number(el.dataset.paso) === paso);
    });

    document.querySelectorAll(".wizard-paso-item").forEach((item) => {
        const numero = Number(item.dataset.paso);
        item.classList.toggle("activo", numero === paso);
        item.classList.toggle("completado", numero < paso);
    });

    const porcentaje = ((paso - 1) / (totalPasos - 1)) * 100;
    document.getElementById("wizard-progreso-relleno").style.width = `${porcentaje}%`;

    nav.btnAnterior.hidden = paso === 1;
    nav.btnSiguiente.hidden = paso === totalPasos;
    nav.btnFinalizar.hidden = paso !== totalPasos;

    const contenedorPaso = form.querySelector(`.form-paso[data-paso="${paso}"]`);
    if (contenedorPaso) {
        contenedorPaso.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function validarRango(form, desde, hasta) {

    for (let paso = desde; paso < hasta; paso++) {
        if (!validarPaso(form, paso)) return false;
    }

    return true;
}


/* =========================================
   CHIPS (tarjetas seleccionables)
========================================= */

function inicializarChips(form) {

    const chips = form.querySelectorAll(".chip");

    chips.forEach((chip) => {

        const input = chip.querySelector("input");

        const actualizar = () => {

            if (input.type === "radio" && input.checked) {
                form.querySelectorAll(`.chip input[name="${input.name}"]`).forEach((hermano) => {
                    hermano.closest(".chip").classList.toggle("chip-seleccionado", hermano.checked);
                });
            } else {
                chip.classList.toggle("chip-seleccionado", input.checked);
            }
        };

        input.addEventListener("change", actualizar);
        actualizar();
    });
}


/* =========================================
   CAMPOS "OTRO" → habilitan su input de texto
========================================= */

function inicializarCamposOtro(form) {

    const disparadores = form.querySelectorAll("[data-otro-toggle]");

    disparadores.forEach((disparador) => {

        const inputTexto = document.getElementById(disparador.dataset.otroToggle);

        if (!inputTexto) return;

        // El disparador puede ser un checkbox/radio, o una <option> dentro
        // de un <select> (en cuyo caso se escucha el "change" del <select>).
        if (disparador.tagName === "OPTION") {

            const select = disparador.closest("select");
            if (!select) return;

            const actualizar = () => {

                const debeMostrarse = select.value === disparador.value;

                inputTexto.disabled = !debeMostrarse;
                inputTexto.hidden = !debeMostrarse;

                if (inputTexto.disabled) {
                    inputTexto.value = "";
                    limpiarError(inputTexto);
                }
            };

            select.addEventListener("change", actualizar);
            actualizar();
            return;
        }

        const actualizar = () => {

            inputTexto.disabled = !disparador.checked;
            inputTexto.hidden = !disparador.checked;

            if (inputTexto.disabled) {
                inputTexto.value = "";
                limpiarError(inputTexto);
            }
        };

        form.querySelectorAll(`[name="${disparador.name}"]`).forEach((el) => {
            el.addEventListener("change", actualizar);
        });

        actualizar();
    });
}


/* =========================================
   CAMPOS CONDICIONALES
========================================= */

function inicializarCamposCondicionales(form) {

    const condicionales = form.querySelectorAll("[data-depende-de]");

    condicionales.forEach((campo) => {

        const nombreDelQueDepende = campo.dataset.dependeDe;
        const valorEsperado = campo.dataset.dependeValor;

        const actualizar = () => {

            const seleccionado = form.querySelector(
                `[name="${nombreDelQueDepende}"]:checked`
            );

            const debeMostrarse = seleccionado && seleccionado.value === valorEsperado;

            campo.hidden = !debeMostrarse;

            if (!debeMostrarse) {
                campo.querySelectorAll("input, textarea").forEach(limpiarError);
            }
        };

        form.querySelectorAll(`[name="${nombreDelQueDepende}"]`).forEach((el) => {
            el.addEventListener("change", actualizar);
        });

        actualizar();
    });
}


/* =========================================
   CAMPOS CONDICIONALES BASADOS EN <select>
========================================= */

function inicializarCamposCondicionalesSelect(form) {

    const condicionales = form.querySelectorAll("[data-depende-select-de]");

    condicionales.forEach((campo) => {

        const select = document.getElementById(campo.dataset.dependeSelectDe);
        const valorEsperado = campo.dataset.dependeValor;

        if (!select) return;

        const actualizar = () => {

            const debeMostrarse = select.value === valorEsperado;

            campo.hidden = !debeMostrarse;

            if (!debeMostrarse) {
                campo.querySelectorAll("input, textarea").forEach((input) => {
                    input.value = "";
                    limpiarError(input);
                });
            }
        };

        select.addEventListener("change", actualizar);
        actualizar();
    });
}


/* =========================================
   TABLA DE ESTACIONALIDAD (12 MESES)
========================================= */

function generarTablaEstacionalidad() {

    const cuerpoTabla = document.getElementById("tabla-meses");

    if (!cuerpoTabla) return;

    const meses = [
        { nombre: "Enero", slug: "enero" },
        { nombre: "Febrero", slug: "febrero" },
        { nombre: "Marzo", slug: "marzo" },
        { nombre: "Abril", slug: "abril" },
        { nombre: "Mayo", slug: "mayo" },
        { nombre: "Junio", slug: "junio" },
        { nombre: "Julio", slug: "julio" },
        { nombre: "Agosto", slug: "agosto" },
        { nombre: "Septiembre", slug: "septiembre" },
        { nombre: "Octubre", slug: "octubre" },
        { nombre: "Noviembre", slug: "noviembre" },
        { nombre: "Diciembre", slug: "diciembre" },
    ];

    const niveles = [
        { valor: "alta", etiqueta: "Alta" },
        { valor: "media", etiqueta: "Media" },
        { valor: "baja", etiqueta: "Baja" },
        { valor: "no", etiqueta: "No produce" },
    ];

    meses.forEach(({ nombre: mes, slug }) => {

        const nombreCampo = `estacionalidad_${slug}`;

        const fila = document.createElement("tr");

        const celdaMes = document.createElement("td");
        celdaMes.textContent = mes;
        celdaMes.className = "celda-mes";
        fila.appendChild(celdaMes);

        niveles.forEach((nivel) => {

            const celda = document.createElement("td");

            const input = document.createElement("input");
            input.type = "radio";
            input.name = nombreCampo;
            input.value = nivel.valor;
            input.setAttribute("aria-label", `${mes} - ${nivel.etiqueta}`);

            celda.appendChild(input);
            fila.appendChild(celda);
        });

        cuerpoTabla.appendChild(fila);
    });
}


/* =========================================
   PORCENTAJES DE DESTINO DEL LACTOSUERO
   - Cada checkbox habilita su input de %
   - La suma de los porcentajes no puede superar 100
========================================= */

function inicializarPorcentajes(form) {

    const checkboxes = form.querySelectorAll("[data-porcentaje-toggle]");

    if (checkboxes.length === 0) return;

    const validarSuma = () => {

        const error = document.getElementById("error-porcentajes");

        let suma = 0;

        checkboxes.forEach((checkbox) => {
            const input = document.getElementById(checkbox.dataset.porcentajeToggle);
            if (checkbox.checked && input.value !== "") {
                suma += Number(input.value);
            }
        });

        const excedeLimite = suma > 100;

        error.hidden = !excedeLimite;

        return !excedeLimite;
    };

    checkboxes.forEach((checkbox) => {

        const input = document.getElementById(checkbox.dataset.porcentajeToggle);

        if (!input) return;

        const actualizarHabilitado = () => {

            input.disabled = !checkbox.checked;
            checkbox.closest(".porcentaje-item").classList.toggle("porcentaje-activo", checkbox.checked);

            if (input.disabled) {
                input.value = "";
                limpiarError(input);
            }

            validarSuma();
        };

        checkbox.addEventListener("change", actualizarHabilitado);
        input.addEventListener("input", validarSuma);

        actualizarHabilitado();
    });
}


/* =========================================
   GEOLOCALIZACIÓN (simulada)
   Todavía no se solicitan permisos reales del
   navegador: se deja preparado el flujo visual
   para cuando se integre la API definitiva.
========================================= */

function inicializarGeolocalizacion() {

    const boton = document.getElementById("btn-geolocalizacion");
    const coordenadas = document.getElementById("coordenadas");
    const estado = document.getElementById("geoloc-estado");

    if (!boton) return;

    boton.addEventListener("click", () => {

        boton.disabled = true;
        boton.textContent = "Obteniendo ubicación...";

        setTimeout(() => {

            coordenadas.value = "-34.6037, -58.3816";

            estado.textContent = "Ubicación obtenida ✓ (simulada — se integrará el GPS del dispositivo)";
            estado.hidden = false;

            boton.textContent = "📍 Ubicación compartida";
            boton.disabled = false;
        }, 900);
    });
}


/* =========================================
   VALIDACIÓN DE CAMPOS NUMÉRICOS
   - Bloquea letras y símbolos mientras se tipea
   - Solo permite números positivos (y decimales)
========================================= */

function inicializarValidacionNumerica(form) {

    const camposNumericos = form.querySelectorAll('input[type="number"]');

    camposNumericos.forEach((input) => {

        input.addEventListener("keydown", (evento) => {

            const teclasPermitidas = [
                "Backspace", "Delete", "Tab", "Escape", "Enter",
                "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
                "Home", "End",
            ];

            if (teclasPermitidas.includes(evento.key)) return;
            if (evento.ctrlKey || evento.metaKey) return;

            const esNumero = /^[0-9]$/.test(evento.key);
            const esPuntoDecimal = evento.key === "." && !input.value.includes(".");

            if (!esNumero && !esPuntoDecimal) {
                evento.preventDefault();
            }
        });

        input.addEventListener("paste", (evento) => {

            const texto = (evento.clipboardData || window.clipboardData).getData("text");

            if (!/^\d*\.?\d*$/.test(texto)) {
                evento.preventDefault();
            }
        });

        input.addEventListener("input", () => limpiarError(input));
    });
}


/* =========================================
   VALIDACIÓN POR PASO
========================================= */

function validarPaso(form, paso) {

    const contenedor = form.querySelector(`.form-paso[data-paso="${paso}"]`);

    if (!contenedor) return true;

    let esValido = true;

    contenedor.querySelectorAll('input[type="number"]:not(:disabled)').forEach((input) => {

        const campoCondicional = input.closest(".campo-condicional");
        if (campoCondicional && campoCondicional.hidden) return;

        limpiarError(input);

        if (input.value === "") {
            if (input.required) {
                mostrarError(input, "Este dato es obligatorio.");
                esValido = false;
            }
            return;
        }

        const valor = Number(input.value);
        const minimo = input.min !== "" ? Number(input.min) : null;
        const maximo = input.max !== "" ? Number(input.max) : null;

        if (Number.isNaN(valor) || valor < 0) {
            mostrarError(input, "Ingresá solo un número válido, mayor o igual a 0.");
            esValido = false;
        } else if (minimo !== null && valor < minimo) {
            mostrarError(input, `El valor mínimo es ${minimo}.`);
            esValido = false;
        } else if (maximo !== null && valor > maximo) {
            mostrarError(input, `El valor máximo es ${maximo}.`);
            esValido = false;
        }
    });

    contenedor.querySelectorAll("input[type='text']:not(:disabled)[required], select:not(:disabled)[required]").forEach((input) => {

        limpiarError(input);

        if (input.value.trim() === "") {
            mostrarError(input, "Este dato es obligatorio.");
            esValido = false;
        }
    });

    contenedor.querySelectorAll(".input-otro:not(:disabled)").forEach((input) => {

        limpiarError(input);

        if (input.value.trim() === "") {
            mostrarError(input, 'Especificá esta opción o desmarcá "Otro".');
            esValido = false;
        }
    });

    const gruposRequeridos = new Set();
    contenedor.querySelectorAll('input[type="radio"][required]').forEach((radio) => gruposRequeridos.add(radio.name));

    gruposRequeridos.forEach((nombre) => {
        const marcado = contenedor.querySelector(`input[name="${nombre}"]:checked`);
        if (!marcado) esValido = false;
    });

    const errorPorcentajes = contenedor.querySelector("#error-porcentajes");
    if (errorPorcentajes && !errorPorcentajes.hidden) {
        esValido = false;
    }

    return esValido;
}

let contadorIdsError = 0;

// El mensaje de error de cada input se identifica por su propio id (nunca
// por posición en el DOM): dentro de .form-paso.activo (display:grid),
// cualquier elemento insertado "como hermano suelto" cae en la celda
// siguiente libre del grid en vez de quedar debajo del campo que falló,
// así que el <span> de error se ancla SIEMPRE dentro de .campo.
function obtenerIdError(input) {

    if (!input.dataset.errorId) {
        contadorIdsError += 1;
        input.dataset.errorId = `error-${input.id || "campo"}-${contadorIdsError}`;
    }

    return input.dataset.errorId;
}

function mostrarError(input, mensaje) {

    input.classList.add("campo-invalido");

    const campo = input.closest(".campo") || input.parentElement;
    const idError = obtenerIdError(input);

    let error = campo.querySelector(`#${idError}`);

    if (!error) {
        error = document.createElement("span");
        error.id = idError;
        error.className = "mensaje-error";
        campo.appendChild(error);
    }

    error.textContent = mensaje;
    error.hidden = false;
}

function limpiarError(input) {

    input.classList.remove("campo-invalido");

    const campo = input.closest(".campo") || input.parentElement;
    const idError = input.dataset.errorId;

    if (!idError) return;

    const error = campo.querySelector(`#${idError}`);

    if (error) error.hidden = true;
}


/* =========================================
   MODAL DE CONFIRMACIÓN DE ENVÍO
========================================= */

function mostrarModalEnvio(alCerrar) {

    const modal = document.getElementById("modal-envio");
    const btnCerrar = document.getElementById("modal-envio-cerrar");

    modal.hidden = false;
    btnCerrar.focus();

    const cerrar = () => {
        modal.hidden = true;
        btnCerrar.removeEventListener("click", cerrar);
        modal.removeEventListener("click", cerrarSiEsOverlay);
        document.removeEventListener("keydown", cerrarConEscape);
        alCerrar();
    };

    const cerrarSiEsOverlay = (evento) => {
        if (evento.target === modal) cerrar();
    };

    const cerrarConEscape = (evento) => {
        if (evento.key === "Escape") cerrar();
    };

    btnCerrar.addEventListener("click", cerrar);
    modal.addEventListener("click", cerrarSiEsOverlay);
    document.addEventListener("keydown", cerrarConEscape);
}

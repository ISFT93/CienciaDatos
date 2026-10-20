/* =========================================
   RESULTADOS LACTOSUERO
   Los datos se leen de api/resultados_lactosuero.php
   (relevamientos guardados en la base).
========================================= */

(() => {

    const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // Nivel ordinal -> peso numérico, para promediar el mes entre establecimientos.
    const PESO_NIVEL = { alta: 3, media: 2, baja: 1, no_produce: 0 };

    const FRIO_ETIQUETAS = {
        si: "Sí, con capacidad",
        no: "No dispone",
        nosabe: "No sabe / no estima",
    };

    const fmt = (n) => n.toLocaleString("es-AR");

    // Los nombres los cargan los usuarios del formulario: se escapan antes de usar innerHTML.
    const esc = (texto) => String(texto ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

    const sinDatos = '<p style="opacity: 0.7;">Todavía no hay relevamientos cargados.</p>';

    // Cuenta cuántos establecimientos elaboran cada producto.
    function contarProductos(registros, productos) {
        return productos.map((p) => ({
            ...p,
            cantidad: registros.filter((r) => r.productos.includes(p.clave)).length,
        })).sort((a, b) => b.cantidad - a.cantidad);
    }

    // Promedia el nivel de producción del grupo para cada mes (0 a 3).
    // Solo cuentan los establecimientos que respondieron ese mes.
    function calcularEstacionalidad(registros) {
        return MESES.map((mes, i) => {
            const niveles = registros.map((r) => r.estacionalidad[i]).filter((n) => n !== null);
            const promedio = niveles.length
                ? niveles.reduce((a, n) => a + PESO_NIVEL[n], 0) / niveles.length
                : null;
            return { mes, promedio };
        });
    }

    function contarFrio(registros) {
        const conteo = { si: 0, no: 0, nosabe: 0 };
        registros.forEach((r) => { if (r.frio in conteo) conteo[r.frio]++; });
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        return Object.keys(conteo).map((clave) => ({
            clave,
            etiqueta: FRIO_ETIQUETAS[clave],
            cantidad: conteo[clave],
            porcentaje: total ? Math.round((conteo[clave] / total) * 100) : 0,
        }));
    }

    // Pide los relevamientos a api/resultados_lactosuero.php y calcula los totales y
    // agregados que muestran las tarjetas y los gráficos.
    async function cargarDatos() {
        const respuesta = await fetch("api/resultados_lactosuero.php");

        if (!respuesta.ok) throw new Error("No se pudieron cargar los resultados");

        const api = await respuesta.json();
        const registros = api.registros;

        const conSuero = registros.filter((r) => r.generaSuero);

        return {
            registros,
            destinos: api.destinos.map((d, i) => ({ ...d, color: `var(--series-${(i % 5) + 1})` })),
            productos: contarProductos(registros, api.productos),
            estacionalidad: calcularEstacionalidad(registros),
            frio: contarFrio(registros),
            resumen: {
                establecimientos: registros.length,
                totalLeche: registros.reduce((a, r) => a + r.leche, 0),
                conSuero: conSuero.length,
                totalSuero: conSuero.reduce((a, r) => a + (r.suero || 0), 0),
                interesados: registros.filter((r) => r.interes === "Sí").length,
            },
        };
    }

    function renderStats(resumen) {
        const cont = document.getElementById("stats-grid");
        cont.innerHTML = `
            <div class="stat-tile">
                <span class="stat-label">Establecimientos relevados</span>
                <span class="stat-value">${resumen.establecimientos}</span>
            </div>
            <div class="stat-tile">
                <span class="stat-label">Litros de leche / día (total)</span>
                <span class="stat-value">${fmt(resumen.totalLeche)}</span>
            </div>
            <div class="stat-tile">
                <span class="stat-label">Generan lactosuero</span>
                <span class="stat-value">${resumen.conSuero} <small>de ${resumen.establecimientos}</small></span>
            </div>
            <div class="stat-tile">
                <span class="stat-label">Litros de suero / día (total)</span>
                <span class="stat-value">${fmt(resumen.totalSuero)}</span>
            </div>
            <div class="stat-tile">
                <span class="stat-label">Interesados en valorizarlo</span>
                <span class="stat-value">${resumen.interesados} <small>de ${resumen.establecimientos}</small></span>
            </div>
        `;
    }

    function renderBarChart(registros) {
        const cont = document.getElementById("bar-chart");
        const maxLeche = Math.max(...registros.map((r) => r.leche), 1);

        cont.innerHTML = registros.map((r) => {
            const ancho = Math.round((r.leche / maxLeche) * 100);
            return `
                <div class="bar-row">
                    <span class="bar-etiqueta">${esc(r.nombre)}</span>
                    <div class="bar-pista">
                        <div class="bar-fill" style="width: ${ancho}%;"></div>
                    </div>
                    <span class="bar-valor">${fmt(r.leche)} L</span>
                </div>
            `;
        }).join("");
    }

    function renderDestinos(destinos, conSuero) {
        const barra = document.getElementById("stacked-bar");
        const leyenda = document.getElementById("leyenda-destino");
        const subtitulo = document.getElementById("destino-subtitulo");

        subtitulo.textContent = `Promedio entre los ${conSuero} establecimientos que generan lactosuero`;

        barra.innerHTML = destinos.map((d) =>
            `<div class="stacked-segmento" style="width: ${d.porcentaje}%; background: ${d.color};"></div>`
        ).join("");

        leyenda.innerHTML = destinos.map((d) =>
            `<li><span class="leyenda-punto" style="background: ${d.color};"></span>${esc(d.etiqueta)} — ${d.porcentaje}%</li>`
        ).join("");
    }

    function renderProductos(productos) {
        const cont = document.getElementById("bar-productos");
        const maxCantidad = Math.max(...productos.map((p) => p.cantidad), 1);

        cont.innerHTML = productos.map((p) => {
            const ancho = Math.round((p.cantidad / maxCantidad) * 100);
            return `
                <div class="bar-row bar-row-compacto">
                    <span class="bar-etiqueta">${esc(p.etiqueta)}</span>
                    <div class="bar-pista">
                        <div class="bar-fill" style="width: ${ancho}%;"></div>
                    </div>
                    <span class="bar-valor">${p.cantidad}</span>
                </div>
            `;
        }).join("");
    }

    // Heatmap de una fila, en estilo "semáforo": verde = producción alta,
    // rojo = nula. El nivel también se escribe siempre en la celda —
    // con solo 4 colores de familias distintas, dos pasos intermedios
    // (ámbar/naranja) quedan algo cerca entre sí para un lector con
    // daltonismo, así que el texto es el canal que desambigua, nunca
    // el color solo.
    function nivelDesdePromedio(promedio) {
        if (promedio === null) return { nombre: "S/D", clave: "nula", color: "var(--estado-nula)" };
        if (promedio >= 2.5) return { nombre: "Alta", clave: "alta", color: "var(--estado-alta)" };
        if (promedio >= 1.5) return { nombre: "Media", clave: "media", color: "var(--estado-media)" };
        if (promedio >= 0.5) return { nombre: "Baja", clave: "baja", color: "var(--estado-baja)" };
        return { nombre: "Nula", clave: "nula", color: "var(--estado-nula)" };
    }

    function renderEstacionalidad(estacionalidad) {
        const cont = document.getElementById("heatmap-mensual");

        cont.innerHTML = estacionalidad.map((m) => {
            const { nombre, clave, color } = nivelDesdePromedio(m.promedio);
            const detalle = m.promedio === null ? "sin datos" : `producción ${nombre.toLowerCase()}`;
            return `
                <div class="heatmap-celda">
                    <div class="heatmap-color nivel-${clave}" style="background: ${color};" title="${m.mes}: ${detalle}">
                        <span class="heatmap-nivel">${nombre}</span>
                    </div>
                    <span class="heatmap-mes">${m.mes}</span>
                </div>
            `;
        }).join("");
    }

    // 3 categorías que se leen mejor como número directo que como
    // proporción de un anillo — el valor es el protagonista, no la forma.
    function renderFrio(frio) {
        const cont = document.getElementById("frio-stats");

        cont.innerHTML = frio.map((f, i) => `
            <div class="frio-tile">
                <span class="frio-tile-punto" style="background: var(--series-${i + 1});"></span>
                <span class="frio-tile-valor">${f.cantidad}</span>
                <span class="frio-tile-label">${f.etiqueta}</span>
                <span class="frio-tile-porcentaje">${f.porcentaje}%</span>
            </div>
        `).join("");
    }

    function renderTabla(registros) {
        const cuerpo = document.getElementById("tabla-body");
        const subtitulo = document.getElementById("tabla-subtitulo");

        subtitulo.textContent = `Detalle de los ${registros.length} relevamientos cargados`;

        cuerpo.innerHTML = registros.map((r) => `
            <tr>
                <td>${esc(r.nombre)}</td>
                <td>${esc(r.localidad)}</td>
                <td>${esc(r.tipo)}</td>
                <td class="col-numerica">${fmt(r.leche)}</td>
                <td class="col-numerica"><span class="chip-estado ${r.generaSuero ? "si" : "no"}">${r.generaSuero ? "Sí" : "No"}</span></td>
                <td class="col-numerica">${r.generaSuero && r.suero !== null ? fmt(r.suero) : "—"}</td>
                <td>${esc(r.interes)}</td>
            </tr>
        `).join("");
    }

    function renderVacio() {
        ["bar-chart", "bar-productos", "heatmap-mensual", "frio-stats"].forEach((id) => {
            document.getElementById(id).innerHTML = sinDatos;
        });
        document.getElementById("stacked-bar").innerHTML = "";
        document.getElementById("leyenda-destino").innerHTML = "";
        document.getElementById("destino-subtitulo").textContent = "Todavía no hay establecimientos que generen lactosuero";
        document.getElementById("tabla-body").innerHTML = '<tr><td colspan="7">Todavía no hay relevamientos cargados.</td></tr>';
        document.getElementById("tabla-subtitulo").textContent = "Detalle de los relevamientos";
    }

    function renderTimestamp(texto) {
        const el = document.getElementById("ultima-actualizacion");

        if (texto) {
            el.textContent = texto;
            return;
        }

        const hora = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        el.textContent = `Actualizado a las ${hora}`;
    }

    // Con la base vacía no se dibujan los gráficos (evita divisiones por cero):
    // se muestra un mensaje en cada tarjeta.
    function render(datos) {
        renderStats(datos.resumen);

        if (datos.registros.length === 0) {
            renderVacio();
        } else {
            renderBarChart(datos.registros);
            renderDestinos(datos.destinos, datos.resumen.conSuero);
            renderEstacionalidad(datos.estacionalidad);
            renderProductos(datos.productos);
            renderFrio(datos.frio);
            renderTabla(datos.registros);
        }

        renderTimestamp();
    }

    // Carga y dibuja los datos. Si el servidor no responde, avisa en el texto de
    // "última actualización" en lugar de dejar la pantalla en blanco.
    async function actualizar() {
        try {
            render(await cargarDatos());
        } catch (error) {
            renderTimestamp("No se pudieron cargar los datos. ¿Está activo el servidor?");
        }
    }

    function iniciar() {
        actualizar();

        const boton = document.getElementById("btn-recargar");

        boton.addEventListener("click", async () => {
            if (boton.classList.contains("cargando")) return;

            boton.classList.add("cargando");
            await actualizar();
            boton.classList.remove("cargando");
        });
    }

    document.addEventListener("DOMContentLoaded", iniciar);

})();

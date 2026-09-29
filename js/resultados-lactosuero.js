/* =========================================
   RESULTADOS LACTOSUERO
   Datos ficticios de demostración. Simulan
   relevamientos cargándose en vivo mientras
   otro alumno hace la encuesta en el campo.
========================================= */

(() => {

    const DESTINOS = [
        { clave: "animal", etiqueta: "Alimentación animal", color: "var(--series-1)" },
        { clave: "otro", etiqueta: "Elaboración de otro producto", color: "var(--series-2)" },
        { clave: "venta", etiqueta: "Venta a terceros", color: "var(--series-3)" },
        { clave: "efluente", etiqueta: "Tratamiento como efluente", color: "var(--series-4)" },
        { clave: "descarte", etiqueta: "Descarte sin aprovechamiento", color: "var(--series-5)" },
    ];

    // Establecimientos base — cada recarga varía sus valores
    // dentro de un rango realista, simulando nuevas respuestas.
    // Los productos y la estacionalidad respetan las mismas opciones
    // que ofrece el formulario (pasos 2, 4 y 5 de relevamiento.html).
    // Estacionalidad de referencia para la cuenca lechera pampeana:
    // pico en primavera (Sep–Nov, post-parición y buena pastura) y en
    // otoño (Mar–Abr); baja marcada en verano (Dic–Feb, estrés calórico)
    // y un valle menor en pleno invierno (Jun–Jul). Cada establecimiento
    // sigue este patrón con corrimientos leves, no al azar puro.
    const ESTACIONALIDAD_TIPO = ["baja", "baja", "alta", "alta", "media", "baja", "baja", "media", "alta", "alta", "alta", "media"];

    const BASE = [
        {
            nombre: "Napoli", localidad: "San Vicente", tipo: "Fábrica láctea / quesería",
            leche: 1800, generaSuero: true, interes: "Sí",
            productos: ["mozzarella", "semiduros"], frio: "si",
            estacionalidad: ESTACIONALIDAD_TIPO,
        },
        {
            nombre: "Tambo San Martín", localidad: "Alejandro Korn", tipo: "Tambo con elaboración propia",
            leche: 900, generaSuero: true, interes: "Tal vez",
            productos: ["blandos", "ricota"], frio: "no",
            estacionalidad: ["baja", "baja", "media", "alta", "alta", "media", "baja", "baja", "media", "alta", "alta", "media"],
        },
        {
            nombre: "Cooperativa Domselaar", localidad: "Domselaar", tipo: "Cooperativa",
            leche: 2200, generaSuero: true, interes: "Sí",
            productos: ["duros", "semiduros", "mozzarella"], frio: "si",
            estacionalidad: ESTACIONALIDAD_TIPO,
        },
        {
            nombre: "Quesería El Alba", localidad: "San Vicente", tipo: "Fábrica láctea / quesería",
            leche: 650, generaSuero: false, interes: "Sí",
            productos: ["blandos"], frio: "nosabe",
            estacionalidad: ["baja", "baja", "baja", "media", "alta", "media", "baja", "baja", "media", "alta", "media", "baja"],
        },
        {
            nombre: "Tambo Los Ceibos", localidad: "Alejandro Korn", tipo: "Tambo con elaboración propia",
            leche: 1000, generaSuero: true, interes: "No",
            productos: ["ricota", "mozzarella"], frio: "no",
            estacionalidad: ["baja", "media", "alta", "alta", "media", "baja", "baja", "media", "alta", "alta", "media", "baja"],
        },
    ];

    const PRODUCTOS = [
        { clave: "mozzarella", etiqueta: "Mozzarella" },
        { clave: "blandos", etiqueta: "Quesos blandos" },
        { clave: "semiduros", etiqueta: "Quesos semiduros" },
        { clave: "duros", etiqueta: "Quesos duros" },
        { clave: "ricota", etiqueta: "Ricota" },
    ];

    const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // Nivel ordinal -> peso numérico, para promediar el mes entre establecimientos.
    const PESO_NIVEL = { alta: 3, media: 2, baja: 1, no_produce: 0 };

    const FRIO_ETIQUETAS = {
        si: "Sí, con capacidad",
        no: "No dispone",
        nosabe: "No sabe / no estima",
    };

    const fmt = (n) => n.toLocaleString("es-AR");

    const azar = (min, max) => Math.round(min + Math.random() * (max - min));

    // Genera porcentajes de destino que suman 100, con algo de variación.
    function generarDestinos() {
        let valores = DESTINOS.map(() => azar(8, 40));
        const suma = valores.reduce((a, b) => a + b, 0);
        valores = valores.map((v) => Math.round((v / suma) * 100));

        // Ajuste de redondeo para que sumen exactamente 100.
        const diferencia = 100 - valores.reduce((a, b) => a + b, 0);
        valores[0] += diferencia;

        return DESTINOS.map((d, i) => ({ ...d, porcentaje: valores[i] }));
    }

    // Cuenta cuántos establecimientos elaboran cada producto.
    function contarProductos(registros) {
        return PRODUCTOS.map((p) => ({
            ...p,
            cantidad: registros.filter((r) => r.productos.includes(p.clave)).length,
        })).sort((a, b) => b.cantidad - a.cantidad);
    }

    // Promedia el nivel de producción del grupo para cada mes (0 a 3).
    function calcularEstacionalidad(registros) {
        return MESES.map((mes, i) => {
            const promedio = registros.reduce((a, r) => a + PESO_NIVEL[r.estacionalidad[i]], 0) / registros.length;
            return { mes, promedio };
        });
    }

    function contarFrio(registros) {
        const total = registros.length;
        const conteo = { si: 0, no: 0, nosabe: 0 };
        registros.forEach((r) => conteo[r.frio]++);
        return Object.keys(conteo).map((clave) => ({
            clave,
            etiqueta: FRIO_ETIQUETAS[clave],
            cantidad: conteo[clave],
            porcentaje: Math.round((conteo[clave] / total) * 100),
        }));
    }

    function generarDatos() {
        const registros = BASE.map((est) => {
            const leche = Math.max(200, est.leche + azar(-120, 120));
            const generaSuero = est.generaSuero;
            const suero = generaSuero ? Math.round(leche * (0.35 + Math.random() * 0.25)) : null;
            return { ...est, leche, suero };
        });

        const totalLeche = registros.reduce((a, r) => a + r.leche, 0);
        const conSuero = registros.filter((r) => r.generaSuero);
        const totalSuero = conSuero.reduce((a, r) => a + r.suero, 0);
        const interesados = registros.filter((r) => r.interes === "Sí").length;

        return {
            registros,
            destinos: generarDestinos(),
            productos: contarProductos(registros),
            estacionalidad: calcularEstacionalidad(registros),
            frio: contarFrio(registros),
            resumen: {
                establecimientos: registros.length,
                totalLeche,
                conSuero: conSuero.length,
                totalSuero,
                interesados,
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
        const maxLeche = Math.max(...registros.map((r) => r.leche));

        cont.innerHTML = registros.map((r) => {
            const ancho = Math.round((r.leche / maxLeche) * 100);
            return `
                <div class="bar-row">
                    <span class="bar-etiqueta">${r.nombre}</span>
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
            `<li><span class="leyenda-punto" style="background: ${d.color};"></span>${d.etiqueta} — ${d.porcentaje}%</li>`
        ).join("");
    }

    function renderProductos(productos) {
        const cont = document.getElementById("bar-productos");
        const maxCantidad = Math.max(...productos.map((p) => p.cantidad), 1);

        cont.innerHTML = productos.map((p) => {
            const ancho = Math.round((p.cantidad / maxCantidad) * 100);
            return `
                <div class="bar-row bar-row-compacto">
                    <span class="bar-etiqueta">${p.etiqueta}</span>
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
        if (promedio >= 2.5) return { nombre: "Alta", clave: "alta", color: "var(--estado-alta)" };
        if (promedio >= 1.5) return { nombre: "Media", clave: "media", color: "var(--estado-media)" };
        if (promedio >= 0.5) return { nombre: "Baja", clave: "baja", color: "var(--estado-baja)" };
        return { nombre: "Nula", clave: "nula", color: "var(--estado-nula)" };
    }

    function renderEstacionalidad(estacionalidad) {
        const cont = document.getElementById("heatmap-mensual");

        cont.innerHTML = estacionalidad.map((m) => {
            const { nombre, clave, color } = nivelDesdePromedio(m.promedio);
            return `
                <div class="heatmap-celda">
                    <div class="heatmap-color nivel-${clave}" style="background: ${color};" title="${m.mes}: producción ${nombre.toLowerCase()}">
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

        subtitulo.textContent = `Detalle de los ${registros.length} relevamientos de ejemplo`;

        cuerpo.innerHTML = registros.map((r) => `
            <tr>
                <td>${r.nombre}</td>
                <td>${r.localidad}</td>
                <td>${r.tipo}</td>
                <td class="col-numerica">${fmt(r.leche)}</td>
                <td class="col-numerica"><span class="chip-estado ${r.generaSuero ? "si" : "no"}">${r.generaSuero ? "Sí" : "No"}</span></td>
                <td class="col-numerica">${r.generaSuero ? fmt(r.suero) : "—"}</td>
                <td>${r.interes}</td>
            </tr>
        `).join("");
    }

    function renderTimestamp() {
        const el = document.getElementById("ultima-actualizacion");
        const ahora = new Date();
        const hora = ahora.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        el.textContent = `Actualizado a las ${hora}`;
    }

    function render(datos) {
        renderStats(datos.resumen);
        renderBarChart(datos.registros);
        renderDestinos(datos.destinos, datos.resumen.conSuero);
        renderEstacionalidad(datos.estacionalidad);
        renderProductos(datos.productos);
        renderFrio(datos.frio);
        renderTabla(datos.registros);
        renderTimestamp();
    }

    function iniciar() {
        render(generarDatos());

        const boton = document.getElementById("btn-recargar");

        boton.addEventListener("click", () => {
            if (boton.classList.contains("cargando")) return;

            boton.classList.add("cargando");

            // Simula el tiempo de ida y vuelta al cargar nuevas
            // respuestas del relevamiento (uso en vivo, en campo).
            window.setTimeout(() => {
                render(generarDatos());
                boton.classList.remove("cargando");
            }, 700);
        });
    }

    document.addEventListener("DOMContentLoaded", iniciar);

})();

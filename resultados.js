// =========================================
// RESULTADOS DE LA ENCUESTA
// =========================================


// =========================================
// 1. OBTENER ENCUESTAS
// =========================================
Chart.register(ChartDataLabels);

const encuestas =
    JSON.parse(
        localStorage.getItem(
            "encuestasLactosuero"
        )
    ) || [];


console.log(
    "Encuestas encontradas:",
    encuestas
);


// =========================================
// 2. ELEMENTOS DE LA PÁGINA
// =========================================

const totalEncuestas =
    document.getElementById(
        "totalEncuestas"
    );


const totalEstablecimientos =
    document.getElementById(
        "totalEstablecimientos"
    );


const totalGeneranSuero =
    document.getElementById(
        "totalGeneranSuero"
    );

const porcentajeGeneranSuero =
    document.getElementById("porcentajeGeneranSuero");

const promedioLitrosSuero =
    document.getElementById("promedioLitrosSuero");

const totalAlmacenamiento =
    document.getElementById("totalAlmacenamiento");

const totalLitrosSuero =
    document.getElementById(
        "totalLitrosSuero"
    );


const sinDatos =
    document.getElementById(
        "sinDatos"
    );


const contenidoResultados =
    document.getElementById(
        "contenidoResultados"
    );


// =========================================
// 3. COMPROBAR SI HAY DATOS
// =========================================

if (encuestas.length === 0) {

    sinDatos.hidden = false;

    contenidoResultados.hidden = true;

} else {

    sinDatos.hidden = true;

    contenidoResultados.hidden = false;

}


// =========================================
// 4. TOTAL DE ENCUESTAS
// =========================================

totalEncuestas.textContent =
    encuestas.length;


// =========================================
// 5. TOTAL DE ESTABLECIMIENTOS
// =========================================

const establecimientos =
    new Set();


encuestas.forEach(function(encuesta) {

    const nombre =
        encuesta.identificacion
            ?.nombreEstablecimiento
            ?.trim()
            .toLowerCase();


    if (nombre) {

        establecimientos.add(
            nombre
        );

    }

});


totalEstablecimientos.textContent =
    establecimientos.size;


// =========================================
// 6. ESTABLECIMIENTOS QUE GENERAN LACTOSUERO
// =========================================

const encuestasConSuero =
    encuestas.filter(function(encuesta) {

        return (
            encuesta.lactosuero?.genera === "si"
        );

    });


totalGeneranSuero.textContent =
    encuestasConSuero.length;

const porcentajeSuero =
    encuestas.length > 0
        ? (encuestasConSuero.length / encuestas.length) * 100
        : 0;


porcentajeGeneranSuero.textContent =
    Math.round(porcentajeSuero * 10) / 10 + "%";


// =========================================
// 7. TOTAL DE LITROS DE LACTOSUERO
// =========================================

let litrosTotales = 0;

encuestasConSuero.forEach(function(encuesta) {

    litrosTotales +=
        Number(
            encuesta.lactosuero?.litrosDia
        ) || 0;

});


totalLitrosSuero.textContent =
    litrosTotales.toLocaleString("es-AR");


const promedio =
    encuestasConSuero.length > 0
        ? litrosTotales / encuestasConSuero.length
        : 0;


promedioLitrosSuero.textContent =
    Math.round(promedio).toLocaleString("es-AR");

let capacidadTotal = 0;

encuestas.forEach(function(encuesta) {

    if (
        encuesta.infraestructura?.almacenamientoFrio === "si"
    ) {

        capacidadTotal +=
            Number(
                encuesta.infraestructura?.litrosFrio
            ) || 0;

    }

});


totalAlmacenamiento.textContent =
    capacidadTotal.toLocaleString("es-AR") + " L";

// =========================================
// 8. GRÁFICO DE GENERACIÓN DE LACTOSUERO
// =========================================

const cantidadConSuero =
    encuestas.filter(function(encuesta) {

        return (
            encuesta.lactosuero?.genera === "si"
        );

    }).length;


const cantidadSinSuero =
    encuestas.filter(function(encuesta) {

        return (
            encuesta.lactosuero?.genera === "no"
        );

    }).length;



// =========================================
// 9. GRÁFICO DE DESTINO DEL LACTOSUERO
// =========================================

const totalesDestinos = {

    animal: 0,

    otro: 0,

    venta: 0,

    efluente: 0,

    descarte: 0

};


encuestas.forEach(function(encuesta) {

    const destinosEncuesta =
        encuesta.lactosuero?.destinos || [];


    destinosEncuesta.forEach(function(destino) {

        if (
            Object.prototype.hasOwnProperty.call(
                totalesDestinos,
                destino.tipo
            )
        ) {

            totalesDestinos[destino.tipo] +=
                Number(
                    destino.porcentaje
                ) || 0;

        }

    });

});


// =========================================
// CREAR GRÁFICO
// =========================================

const canvasDestinos =
    document.getElementById(
        "graficoDestinos"
    );


if (canvasDestinos) {

    new Chart(
        canvasDestinos,
        {

            type: "doughnut",

            data: {

                labels: [

                    "Alimentación animal",

                    "Elaboración de otro producto",

                    "Entrega / venta a terceros",

                    "Tratamiento como efluente",

                    "Descarte sin aprovechamiento"

                ],

                datasets: [

                    {

                        data: [

                            totalesDestinos.animal,

                            totalesDestinos.otro,

                            totalesDestinos.venta,

                            totalesDestinos.efluente,

                            totalesDestinos.descarte

                        ]

                    }

                ]

            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {

                    datalabels: {

                        color: "#071018",

                        font: {
                            weight: "bold",
                            size: 14
                        },

                        formatter: function(value, context) {

                            const datos =
                                context.chart.data.datasets[0].data;

                            const total =
                                datos.reduce(function(a, b) {
                                    return a + b;
                                }, 0);

                            if (value === 0 || total === 0) {
                                return "";
                            }

                            return Math.round(
                                (value / total) * 100
                            ) + "%";
                        }
                    },

                    legend: {
                        position: "right",

                        labels: {
                            padding: 18,
                            boxWidth: 14,

                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }

        }

    );

}

// =========================================
// GRÁFICO · PRODUCCIÓN POR ESTABLECIMIENTO
// =========================================

// =========================================
// DATOS · PRODUCCIÓN POR ESTABLECIMIENTO
// =========================================

const datosProduccion = [];

encuestas.forEach(function(encuesta) {

    const nombre =
        encuesta.identificacion?.nombreEstablecimiento;

    const litros =
        Number(
            encuesta.lactosuero?.litrosDia
        ) || 0;

    if (nombre) {

        datosProduccion.push({
            nombre: nombre,
            litros: litros
        });

    }

});


// Ordenar de mayor a menor producción

datosProduccion.sort(function(a, b) {

    return b.litros - a.litros;

});


const nombresEstablecimientos =
    datosProduccion.map(function(dato) {

        return dato.nombre;

    });


const litrosPorEstablecimiento =
    datosProduccion.map(function(dato) {

        return dato.litros;

    });


const canvasProduccion =
    document.getElementById(
        "graficoProduccion"
    );


if (canvasProduccion) {

    new Chart(
        canvasProduccion,
        {
            type: "bar",

            data: {

                labels:
                    nombresEstablecimientos,

                datasets: [
                    {
                        label:
                            "Litros de lactosuero por día",

                        data:
                            litrosPorEstablecimiento,

                        borderWidth: 1,

                        borderRadius: 4
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        grace: "15%",

                        grid: {
                            color: "rgba(145, 162, 171, 0.18)"
                        },

                        ticks: {
                            color: "#91a2ab"
                        },

                        title: {
                            display: true,
                            text: "Litros por día",
                            color: "#91a2ab"
                        }
                    },

                    x: {

                        grid: {
                            color: "rgba(145, 162, 171, 0.10)"
                        },

                        ticks: {
                            color: "#91a2ab"
                        },

                        title: {
                            display: true,
                            text: "Establecimiento",
                            color: "#91a2ab"
                        }
                    }
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    datalabels: {

                        anchor: "end",

                        align: "top",

                        color: "#00d9ff",

                        font: {
                            weight: "bold",
                            size: 13
                        },

                        formatter: function(value) {

                            return value.toLocaleString("es-AR") + " L";

                        }
                    }
                }
            }
        }
    );
}

// =========================================
// GRÁFICO · ESTACIONALIDAD
// =========================================
const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const datosEstacionalidad = [];

meses.forEach(function(mes, indice) {

    

    let alta = 0;
    let media = 0;
    let baja = 0;
    let noProduce = 0;

    encuestas.forEach(function(encuesta) {

        const valor =
            encuesta.estacionalidad?.[mes];

        if (valor === "alta") {
            alta++;
        }

        if (valor === "media") {
            media++;
        }

        if (valor === "baja") {
            baja++;
        }

        if (valor === "no") {
            noProduce++;
        }

    });

    datosEstacionalidad.push({
        mes: mes,
        alta: alta,
        media: media,
        baja: baja,
        noProduce: noProduce
    });

});

const canvasEstacionalidad =
    document.getElementById(
        "graficoEstacionalidad"
    );


if (canvasEstacionalidad) {

    new Chart(
        canvasEstacionalidad,
        {
            type: "line",

            data: {

                labels: meses,

                datasets: [

                    {
                        label: "Producción alta",

                        data:
                            datosEstacionalidad.map(
                                function(dato) {
                                    return dato.alta;
                                }
                            ),

                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 2
                    },

                    {
                        label: "Producción media",

                        data:
                            datosEstacionalidad.map(
                                function(dato) {
                                    return dato.media;
                                }
                            ),

                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 2
                    },

                    {
                        label: "Producción baja",

                        data:
                            datosEstacionalidad.map(
                                function(dato) {
                                    return dato.baja;
                                }
                            ),

                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 2
                    },

                    {
                        label: "No produce",

                        data:
                            datosEstacionalidad.map(
                                function(dato) {
                                    return dato.noProduce;
                                }
                            ),

                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 2,
                        borderDash: [8, 5],
                        pointStyle: "rectRot"
                        
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        },

                        title: {
                            display: true,
                            text: "Establecimientos"
                        }
                    },

                    x: {

                        title: {
                            display: true,
                            text: "Mes"
                        }
                    }

                },

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        }
    );

}

// =========================================
// GRÁFICO · PRODUCTOS LÁCTEOS
// =========================================

const totalesProductos = {
    mozzarella: 0,
    blandos: 0,
    semiduros: 0,
    duros: 0,
    ricota: 0,
    otros: 0
};


encuestas.forEach(function(encuesta) {

    const productos =
        encuesta.produccion?.productos || [];

    productos.forEach(function(producto) {

        if (
            Object.prototype.hasOwnProperty.call(
                totalesProductos,
                producto
            )
        ) {

            totalesProductos[producto]++;

        }

    });

});


console.log(
    "Productos elaborados:",
    totalesProductos
);

// =========================================
// GRÁFICO · PRODUCTOS LÁCTEOS
// =========================================

// =========================================
// GRÁFICO · PRODUCTOS LÁCTEOS
// =========================================

const productosOrdenados = [
    {
        nombre: "Mozzarella",
        cantidad: totalesProductos.mozzarella
    },
    {
        nombre: "Quesos blandos",
        cantidad: totalesProductos.blandos
    },
    {
        nombre: "Quesos semiduros",
        cantidad: totalesProductos.semiduros
    },
    {
        nombre: "Quesos duros",
        cantidad: totalesProductos.duros
    },
    {
        nombre: "Ricota",
        cantidad: totalesProductos.ricota
    },
    {
        nombre: "Otros",
        cantidad: totalesProductos.otros
    }
];


// Ordenar de mayor a menor

productosOrdenados.sort(function(a, b) {

    return b.cantidad - a.cantidad;

});


const nombresProductos =
    productosOrdenados.map(function(producto) {

        return producto.nombre;

    });


const cantidadesProductos =
    productosOrdenados.map(function(producto) {

        return producto.cantidad;

    });


const canvasProductos =
    document.getElementById(
        "graficoProductos"
    );


if (canvasProductos) {

    new Chart(
        canvasProductos,
        {
            type: "bar",

            data: {

                labels:
                    nombresProductos,

                datasets: [
                    {
                        label:
                            "Establecimientos",

                        data:
                            cantidadesProductos,

                        borderWidth: 1,

                        borderRadius: 4
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        grace: "15%",

                        grid: {
                            color:
                                "rgba(145, 162, 171, 0.18)"
                        },

                        ticks: {
                            color: "#91a2ab",
                            precision: 0
                        },

                        title: {
                            display: true,

                            text:
                                "Establecimientos",

                            color: "#91a2ab"
                        }
                    },

                    x: {

                        grid: {
                            color:
                                "rgba(145, 162, 171, 0.10)"
                        },

                        ticks: {
                            color: "#91a2ab"
                        },

                        title: {
                            display: true,

                            text:
                                "Producto",

                            color: "#91a2ab"
                        }
                    }
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    datalabels: {

                        anchor: "end",

                        align: "top",

                        color: "#00d9ff",

                        font: {
                            weight: "bold",
                            size: 13
                        },

                        formatter: function(value) {

                            return value;

                        }
                    }
                }
            }
        }
    );

}

// =========================================
// DATOS · ESTABLECIMIENTOS POR LOCALIDAD
// =========================================

const totalesLocalidades = {};

encuestas.forEach(function(encuesta) {

    const localidad =
        encuesta.identificacion?.localidad?.trim();

    if (localidad) {

        totalesLocalidades[localidad] =
            (totalesLocalidades[localidad] || 0) + 1;

    }

});


console.log(
    "Establecimientos por localidad:",
    totalesLocalidades
);

// =========================================
// GRÁFICO · ESTABLECIMIENTOS POR LOCALIDAD
// =========================================

const localidadesOrdenadas =
    Object.entries(totalesLocalidades)
        .map(function([localidad, cantidad]) {

            return {
                localidad: localidad,
                cantidad: cantidad
            };

        });


// Ordenar de mayor a menor

localidadesOrdenadas.sort(function(a, b) {

    return b.cantidad - a.cantidad;

});


const nombresLocalidades =
    localidadesOrdenadas.map(function(dato) {

        return dato.localidad;

    });


const cantidadesLocalidades =
    localidadesOrdenadas.map(function(dato) {

        return dato.cantidad;

    });


const canvasLocalidades =
    document.getElementById(
        "graficoLocalidades"
    );


if (canvasLocalidades) {

    new Chart(
        canvasLocalidades,
        {
            type: "bar",

            data: {

                labels:
                    nombresLocalidades,

                datasets: [
                    {
                        label:
                            "Establecimientos",

                        data:
                            cantidadesLocalidades,

                        borderWidth: 1,

                        borderRadius: 4
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        grace: "15%",

                        grid: {
                            color:
                                "rgba(145, 162, 171, 0.18)"
                        },

                        ticks: {
                            color: "#91a2ab",
                            precision: 0
                        },

                        title: {
                            display: true,

                            text:
                                "Establecimientos",

                            color: "#91a2ab"
                        }
                    },

                    x: {

                        grid: {
                            color:
                                "rgba(145, 162, 171, 0.10)"
                        },

                        ticks: {
                            color: "#91a2ab"
                        },

                        title: {
                            display: true,

                            text:
                                "Localidad",

                            color: "#91a2ab"
                        }
                    }
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    datalabels: {

                        anchor: "end",

                        align: "top",

                        color: "#00d9ff",

                        font: {
                            weight: "bold",
                            size: 13
                        },

                        formatter: function(value) {

                            return value;

                        }
                    }
                }
            }
        }
    );

}

// =========================================
// DATOS · PRODUCCIÓN VS. ALMACENAMIENTO
// =========================================

const datosProduccionAlmacenamiento = [];

encuestas.forEach(function(encuesta) {

    const nombre =
        encuesta.identificacion?.nombreEstablecimiento;

    const produccion =
        Number(
            encuesta.lactosuero?.litrosDia
        ) || 0;

    const almacenamiento =
        encuesta.infraestructura?.almacenamientoFrio === "si"
            ? Number(
                encuesta.infraestructura?.litrosFrio
            ) || 0
            : 0;

    if (nombre && produccion > 0) {

        datosProduccionAlmacenamiento.push({

            nombre: nombre,

            produccion: produccion,

            almacenamiento: almacenamiento

        });

    }

});


console.log(
    "Producción vs almacenamiento:",
    datosProduccionAlmacenamiento
);

// =========================================
// GRÁFICO · PRODUCCIÓN VS. ALMACENAMIENTO
// =========================================
// Ordenar de mayor a menor producción

datosProduccionAlmacenamiento.sort(function(a, b) {

    return b.produccion - a.produccion;

});

const nombresProduccionAlmacenamiento =
    datosProduccionAlmacenamiento.map(function(dato) {

        return dato.nombre;

    });


const datosProduccionComparacion =
    datosProduccionAlmacenamiento.map(function(dato) {

        return dato.produccion;

    });


const datosAlmacenamiento =
    datosProduccionAlmacenamiento.map(function(dato) {

        return dato.almacenamiento;

    });


const canvasProduccionAlmacenamiento =
    document.getElementById(
        "graficoProduccionAlmacenamiento"
    );


if (canvasProduccionAlmacenamiento) {

    new Chart(
        canvasProduccionAlmacenamiento,
        {
            type: "bar",

            data: {

                labels:
                    nombresProduccionAlmacenamiento,

                datasets: [

                    {
                        label:
                            "Producción diaria",

                        data:
                            datosProduccionComparacion,

                        borderWidth: 1,

                        borderRadius: 4
                    },

                    {
                        label:
                            "Capacidad de almacenamiento",

                        data:
                            datosAlmacenamiento,

                        borderWidth: 1,

                        borderRadius: 4
                    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        grace: "15%",

                        grid: {
                            color:
                                "rgba(145, 162, 171, 0.18)"
                        },

                        ticks: {
                            color: "#91a2ab",
                            precision: 0
                        },

                        title: {
                            display: true,

                            text:
                                "Litros",

                            color: "#91a2ab"
                        }
                    },

                    x: {

                        grid: {
                            color:
                                "rgba(145, 162, 171, 0.10)"
                        },

                        ticks: {
                            color: "#91a2ab"
                        },

                        title: {
                            display: true,

                            text:
                                "Establecimiento",

                            color: "#91a2ab"
                        }
                    }
                },

                plugins: {

                    legend: {
                        position: "bottom"
                    },

                    datalabels: {

                        anchor: "end",

                        align: "top",

                        color: "#00d9ff",

                        font: {
                            weight: "bold",
                            size: 12
                        },

                        formatter: function(value) {

                            return value + " L";

                        }
                    }
                }
            }
        }
    );

}

// =========================================
// RESPUESTAS INDIVIDUALES
// =========================================
// =========================================
// TRADUCCIÓN DE VALORES
// =========================================

function traducirTipoEstablecimiento(tipo) {

    const tipos = {

        fabrica:
            "Fábrica láctea / quesería",

        tambo:
            "Tambo con elaboración propia",

        cooperativa:
            "Cooperativa"

    };

    return tipos[tipo] || "No indicado";
}


function traducirProducto(producto) {

    const productos = {

        mozzarella:
            "Mozzarella",

        blandos:
            "Quesos blandos",

        semiduros:
            "Quesos semiduros",

        duros:
            "Quesos duros",

        ricota:
            "Ricota",

        otros:
            "Otros"

    };

    return productos[producto] || producto;
}


function traducirDestino(destino) {

    const destinos = {

        animal:
            "Alimentación animal",

        otro:
            "Elaboración de otro producto",

        venta:
            "Entrega / venta a terceros",

        efluente:
            "Tratamiento como efluente",

        descarte:
            "Descarte sin aprovechamiento"

    };

    return destinos[destino] || destino;
}


function traducirInteres(valor) {

    const intereses = {

        si:
            "Sí",

        no:
            "No",

        tal_vez:
            "Tal vez / depende de la alternativa"

    };

    return intereses[valor] || "No indicado";
}


function traducirEstacionalidad(valor) {

    const niveles = {

        alta:
            "Alta",

        media:
            "Media",

        baja:
            "Baja",

        no:
            "No produce"

    };

    return niveles[valor] || valor;

}

const listaRespuestas =
    document.getElementById(
        "listaRespuestas"
    );


if (listaRespuestas) {

    encuestas.forEach(function(encuesta, indice) {

        const identificacion =
            encuesta.identificacion || {};

        const produccion =
            encuesta.produccion || {};

        const lactosuero =
            encuesta.lactosuero || {};

        const infraestructura =
            encuesta.infraestructura || {};

        const productos =
            produccion.productos || [];

        const destinos =
            lactosuero.destinos || [];

        const estacionalidad =
            encuesta.estacionalidad || {};


        const tarjeta =
            document.createElement("article");

        tarjeta.className =
            "respuesta-individual";


        tarjeta.innerHTML = `

            <button
                type="button"
                class="respuesta-toggle"
            >

                <div>

                    <span class="numero-respuesta">
                        RESPUESTA ${String(indice + 1).padStart(2, "0")}
                    </span>

                    <strong>
                        ${identificacion.nombreEstablecimiento || "Sin nombre"}
                    </strong>

                    <small>
                        ${identificacion.localidad || "Sin localidad"}
                    </small>

                </div>


                <span class="flecha-respuesta">
                    +
                </span>

            </button>


            <div class="respuesta-detalles">


                <div class="respuesta-contenido">


                    <div class="detalle-respuesta">

                        <h4>
                            Identificación
                        </h4>

                        <p>
                            <strong>Nombre:</strong>
                            ${identificacion.nombreEstablecimiento || "No indicado"}
                        </p>

                        <p>
                            <strong>Localidad:</strong>
                            ${identificacion.localidad || "No indicada"}
                        </p>

                        <p>
                            <strong>Dirección:</strong>
                            ${identificacion.direccion || "No indicada"}
                        </p>

                        <p>
                            <strong>Tipo:</strong>
                            ${traducirTipoEstablecimiento(identificacion.tipoEstablecimiento) || "No indicado"}
                        </p>

                    </div>


                    <div class="detalle-respuesta">

                        <h4>
                            Producción
                        </h4>

                        <p>
                            <strong>Leche procesada:</strong>
                            ${Number(
                                produccion.litrosLecheDia || 0
                            ).toLocaleString("es-AR")} L/día
                        </p>

                        <p>
                            <strong>Días de producción:</strong>
                            ${produccion.diasProduccion || 0} días/semana
                        </p>

                        <p>
                            <strong>Productos elaborados:</strong>
                            ${
                                productos.length > 0
                                    ? productos
                                        .map(function(producto) {

                                            return traducirProducto(producto);

                                        })
                                        .join(", ")
                                    : "No indicados"
                            }
                        </p>

                    </div>


                    <div class="detalle-respuesta">

                        <h4>
                            Lactosuero
                        </h4>

                        <p>
                            <strong>Genera lactosuero:</strong>
                            ${
                                lactosuero.genera === "si"
                                    ? "Sí"
                                    : "No"
                            }
                        </p>

                        <p>
                            <strong>Generación diaria:</strong>
                            ${
                                lactosuero.genera === "si"
                                    ? Number(
                                        lactosuero.litrosDia || 0
                                    ).toLocaleString("es-AR") + " L/día"
                                    : "No corresponde"
                            }
                        </p>

                        <p>
                            <strong>Destinos:</strong>
                            ${
                                destinos.length > 0
                                    ? destinos.map(function(destino) {

                                        return (
                                            traducirDestino(destino.tipo) +
                                            " (" +
                                            destino.porcentaje +
                                            "%)"
                                        );

                                    }).join(", ")
                                    : "No corresponde"
                            }
                        </p>

                    </div>


                    <div class="detalle-respuesta">

                        <h4>
                            Estacionalidad
                        </h4>

                        <div class="estacionalidad-respuesta">

                            ${
                                Object.entries(estacionalidad)
                                    .map(function([mes, valor]) {

                                       return `
                                        <span>
                                            <strong>${mes}:</strong>
                                            ${traducirEstacionalidad(valor)}
                                        </span>
                                    `;

                                    })
                                    .join("")
                            }

                        </div>

                    </div>


                    <div class="detalle-respuesta">

                        <h4>
                            Infraestructura e interés
                        </h4>

                        <p>
                            <strong>Almacenamiento refrigerado:</strong>
                            ${
                                infraestructura.almacenamientoFrio === "si"
                                    ? "Sí"
                                    : infraestructura.almacenamientoFrio === "no"
                                        ? "No"
                                        : "No sabe / no puede estimarlo"
                            }
                        </p>

                        <p>
                            <strong>Capacidad:</strong>
                            ${
                                infraestructura.almacenamientoFrio === "si"
                                    ? Number(
                                        infraestructura.litrosFrio || 0
                                    ).toLocaleString("es-AR") + " L"
                                    : "No corresponde"
                            }
                        </p>

                        <p>
                            <strong>Interés en alternativas:</strong>
                            ${
                                traducirInteres(
                                    infraestructura.interesAlternativas
                                )
                            }
                        </p>

                    </div>


                </div>


            </div>

        `;


        listaRespuestas.appendChild(tarjeta);


        const boton =
            tarjeta.querySelector(
                ".respuesta-toggle"
            );

        const detalles =
            tarjeta.querySelector(
                ".respuesta-detalles"
            );

        boton.addEventListener(
            "click",
            function() {

                tarjeta.classList.toggle(
                    "respuesta-abierta"
                );

                detalles.hidden =
                    !tarjeta.classList.contains(
                        "respuesta-abierta"
                    );

            }
        );


        detalles.hidden = true;

    });

}
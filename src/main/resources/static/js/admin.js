// ==============================
// CAMBIO DE SECCIONES
// ==============================

function mostrarSeccion(seccion) {

    const secciones = document.querySelectorAll(".section");

    secciones.forEach(function(elemento) {
        elemento.classList.add("hidden");
    });

    document.getElementById(seccion)
        .classList.remove("hidden");
}


// ==============================
// FILTRO DE TABLAS
// ==============================

function filtrarTabla(idTabla, texto) {

    const tabla = document.getElementById(idTabla);

    const filas = tabla
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr");

    texto = texto.toLowerCase();

    for (let i = 0; i < filas.length; i++) {

        const contenido = filas[i]
            .textContent
            .toLowerCase();

        filas[i].style.display =
            contenido.includes(texto) ? "" : "none";
    }
}


// ==============================
// MODALES
// ==============================

function abrirModalRuta() {
    alert("Formulario para agregar una nueva ruta");
}

function abrirModalUnidad() {
    alert("Formulario para agregar una nueva unidad");
}

function abrirModalChofer() {
    alert("Formulario para agregar un nuevo chofer");
}

function abrirModalParada() {
    alert("Formulario para agregar una nueva parada");
}


// ==============================
// CARGAR DATOS
// ==============================

async function cargarRutas() {

    try {

        const respuesta =
            await fetch("/api/v1/admin/routes");

        const rutas =
            await respuesta.json();

        const cuerpo =
            document.getElementById("rutas-body");

        cuerpo.innerHTML = "";

        rutas.forEach(function(ruta) {

            cuerpo.innerHTML += `
                <tr>
                    <td>${ruta.id}</td>
                    <td>${ruta.nombre}</td>
                    <td>${ruta.origen}</td>
                    <td>${ruta.destino}</td>
                    <td>${ruta.estado}</td>
                    <td>
                        <button onclick="editarRuta(${ruta.id})">
                            Editar
                        </button>

                        <button onclick="eliminarRuta(${ruta.id})">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {

        console.error(
            "Error al cargar las rutas:",
            error
        );
    }
}


// ==============================
// ELIMINAR
// ==============================

async function eliminarRuta(id) {

    const confirmar =
        confirm("¿Deseas eliminar esta ruta?");

    if (!confirmar) {
        return;
    }

    try {

        await fetch(
            `/api/v1/admin/routes/${id}`,
            {
                method: "DELETE"
            }
        );

        cargarRutas();

    } catch (error) {

        console.error(
            "Error al eliminar:",
            error
        );
    }
}


// ==============================
// EDITAR
// ==============================

function editarRuta(id) {

    alert(
        "Aquí se abrirá el formulario para editar la ruta " + id
    );
}


// ==============================
// INICIO
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        mostrarSeccion("dashboard");

        // Cuando el backend esté listo:
        // cargarRutas();

    }
);
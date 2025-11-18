let eventos = [];
let eventosConId = [];

// =============================
// 🔹 Cargar todos los eventos
// =============================
fetch('/api/eventos')
  .then(res => res.json())
  .then(data => {
    eventos = data;

    // Agregar ID real para navegar al detalle
    eventosConId = eventos.map((e, i) => ({ ...e, idReal: i }));

    renderTabla();
  })
  .catch(err => {
    console.error("Error cargando historial:", err);
    document.getElementById("tabla-historial").innerHTML =
      "<p>Error al cargar los eventos.</p>";
  });


// =============================
// 🔹 Obtener eventos filtrados
// =============================
function obtenerEventosFiltrados() {
  let resultado = [...eventosConId];

  // → Filtro por nombre
  const filtroNombre = document.getElementById("filtro-nombre").value.toLowerCase();
  if (filtroNombre.trim() !== "") {
    resultado = resultado.filter(e =>
      e.nombreCliente.toLowerCase().includes(filtroNombre)
    );
  }

  // → Filtro por fechas
  const desde = document.getElementById("filtro-desde").value;
  const hasta = document.getElementById("filtro-hasta").value;

  if (desde)
    resultado = resultado.filter(e => new Date(e.fecha) >= new Date(desde));

  if (hasta)
    resultado = resultado.filter(e => new Date(e.fecha) <= new Date(hasta));

  // → Ordenamiento según botón activo
  const btnFecha = document.getElementById("orden-fecha");
  const btnCliente = document.getElementById("orden-cliente");

  if (btnFecha.classList.contains("activo")) {
    resultado.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  if (btnCliente.classList.contains("activo")) {
    resultado.sort((a, b) =>
      a.nombreCliente.localeCompare(b.nombreCliente)
    );
  }

  return resultado;
}


// =============================
// 🔹 Dibujar la tabla
// =============================
function renderTabla() {
  const contenedor = document.getElementById("tabla-historial");
  contenedor.innerHTML = "";

  const lista = obtenerEventosFiltrados();

  const tabla = document.createElement("table");
  tabla.className = "tabla-eventos";

  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Estado</th>
        <th>Cliente</th>
        <th>Fecha</th>
        <th>Ubicación</th>
        <th>Detalles</th>
      </tr>
    </thead>
  `;

  const cuerpo = document.createElement("tbody");

  lista.forEach(e => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${e.estado}</td>
      <td>${e.nombreCliente}</td>
      <td>${e.fecha}</td>
      <td>${e.ubicacion}</td>
      <td>
        <button class="btn-detalle" data-id="${e.idReal}">
          Ver detalles ➜
        </button>
      </td>
    `;

    cuerpo.appendChild(fila);
  });

  tabla.appendChild(cuerpo);
  contenedor.appendChild(tabla);

  // Navegar al detalle
  document.querySelectorAll(".btn-detalle").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;
      window.location.href = `detalle.html?id=${id}`;
    });
  });
}


// =============================
// 🔹 Listeners de filtros
// =============================
document.getElementById("btn-filtrar").addEventListener("click", renderTabla);

["filtro-nombre", "filtro-desde", "filtro-hasta"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderTabla);
});


// =============================
// 🔹 Botones de orden
// =============================
document.getElementById("orden-fecha").addEventListener("click", () => {
  document.getElementById("orden-fecha").classList.add("activo");
  document.getElementById("orden-cliente").classList.remove("activo");
  renderTabla();
});

document.getElementById("orden-cliente").addEventListener("click", () => {
  document.getElementById("orden-cliente").classList.add("activo");
  document.getElementById("orden-fecha").classList.remove("activo");
  renderTabla();
});
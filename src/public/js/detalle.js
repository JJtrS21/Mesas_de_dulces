const params = new URLSearchParams(window.location.search);
let idEvento = parseInt(params.get('id'));

if (isNaN(idEvento)) {
  document.getElementById("nombreCliente").textContent =
    "Error: Falta el parámetro 'id'.";
}

// ▶ Cargar eventos
fetch('/api/eventos')
  .then(response => response.json())
  .then(eventos => {

    function mostrarEvento(id) {
      try {
        if (id < 0 || id >= eventos.length) {
          document.getElementById("nombreCliente").textContent =
            "Evento no encontrado";
          return;
        }

        const evento = eventos[id];

        // ▶ Campos básicos
        document.getElementById("nombreCliente").textContent =
          evento.nombreCliente || evento.cliente || "Sin nombre";

        document.getElementById("fecha").textContent =
          evento.fecha || "Sin fecha";

        document.getElementById("ubicacion").textContent =
          evento.ubicacion || "Sin ubicación";

        document.getElementById("estado").textContent =
          evento.estado || "Sin estado";

        document.getElementById("textoDescripcion").textContent =
          evento.descripcion || "Sin descripción";

        // ▶ Productos
        const lista = document.getElementById("listaProductos");
        lista.innerHTML = "";

        let productos = [];

        // Dos casos:
        // 1. Array elaborado {nombre, cantidad, precioUnitario, subtotal}
        if (Array.isArray(evento.productos)) {
          productos = evento.productos;

          productos.forEach(p => {
            const li = document.createElement("li");
            li.textContent =
              `${p.nombre} — ${p.cantidad} × $${p.precioUnitario} = $${p.subtotal}`;
            lista.appendChild(li);
          });
        }

        // 2. String separado por comas (caso datos antiguos)
        else if (typeof evento.productos === "string") {
          productos = evento.productos.split(",");

          productos.forEach(p => {
            const li = document.createElement("li");
            li.textContent = p.trim();
            lista.appendChild(li);
          });
        }

        // Si no hay productos
        if (!productos || productos.length === 0) {
          lista.innerHTML = "<li>No hay productos seleccionados</li>";
        }

        // ▶ Personas y precio por persona
        document.getElementById("NumeroPersonasEvento").innerHTML = `
          <li><strong>Personas:</strong> ${evento.personas || 0}</li>
          <li><strong>Precio por persona:</strong> $${evento.precioPersona || 0}</li>
        `;

        // ▶ Totales
        document.getElementById("PrecioEvento").innerHTML = `
          <li><strong>Total productos:</strong> $${evento.totalProductos || 0}</li>
          <li><strong>Total por personas:</strong> $${evento.totalPersonas || 0}</li>
          <li><strong>Total del evento:</strong> <strong>$${evento.totalEvento || 0}</strong></li>
        `;

      } catch (error) {
        console.error("Error mostrando el evento:", error);
      }
    }

    mostrarEvento(idEvento);
  })

  .catch(err => {
    console.error("Error en fetch:", err);
    document.getElementById("nombreCliente").textContent =
      "Error al cargar datos.";
  });


// ▶ Botón modificar
document.getElementById("editar").addEventListener("click", () => {
  window.location.href = `modificar.html?id=${idEvento}`;
});

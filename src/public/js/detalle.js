const params = new URLSearchParams(window.location.search);
let idEvento = parseInt(params.get('id'));

if (isNaN(idEvento)) {
  document.getElementById("nombreCliente").textContent = "Error: Falta el parámetro 'id'.";
}

// Cargar eventos
fetch('/api/eventos')
  .then(response => response.json())
  .then(eventos => {

    function mostrarEvento(id) {
      try {
        if (id < 0 || id >= eventos.length) {
          document.getElementById("nombreCliente").textContent = "Evento no encontrado";
          return;
        }

        const evento = eventos[id];

        // Información principal
        document.getElementById("nombreCliente").textContent = evento.nombreCliente;
        document.getElementById("fecha").textContent = evento.fecha;
        document.getElementById("ubicacion").textContent = evento.ubicacion;
        document.getElementById("textoDescripcion").textContent = evento.descripcion || "Sin descripción";

        // Lista de productos
        const lista = document.getElementById("listaProductos");
        lista.innerHTML = "";

        if (!evento.productos || evento.productos.length === 0) {
          lista.innerHTML = "<li>No hay productos seleccionados</li>";
        } else {
          evento.productos.forEach(p => {
            const li = document.createElement("li");
            li.textContent =
              `${p.nombre} — ${p.cantidad} × $${p.precioUnitario} = $${p.subtotal}`;
            lista.appendChild(li);
          });
        }

        // Estatus (personas)
        document.getElementById("NumeroPersonasEvento").innerHTML = `
          <li><strong>Personas:</strong> ${evento.personas}</li>
          <li><strong>Precio por persona:</strong> $${evento.precioPersona}</li>
        `;

        // Precio total
        document.getElementById("PrecioEvento").innerHTML = `
          <li><strong>Total productos:</strong> $${evento.totalProductos}</li>
          <li><strong>Total por personas:</strong> $${evento.totalPersonas}</li>
          <li><strong>Total del evento:</strong> <strong>$${evento.totalEvento}</strong></li>
        `;

      } catch (error) {
        console.error("Error mostrando el evento:", error);
      }
    }

    mostrarEvento(idEvento);
  })
  .catch(err => {
    console.error("Error en fetch:", err);
    document.getElementById("nombreCliente").textContent = "Error al cargar datos.";
  });

// Botón modificar
document.getElementById("editar").addEventListener("click", () => {
  window.location.href = `modificar.html?id=${idEvento}`;
});

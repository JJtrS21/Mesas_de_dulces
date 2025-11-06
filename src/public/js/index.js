fetch('/api/eventos')
  .then(response => response.json())
  .then(data => {
    const contenedor = document.getElementById("lista-eventos");
    contenedor.innerHTML = ""; // Limpiar texto inicial

    // Crear tabla
    const tabla = document.createElement("table");
    tabla.className = "tabla-eventos";

    // Encabezado
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Ubicación</th>
          <th>Detalles</th>
        </tr>
      </thead>
    `;

    // Cuerpo
    const cuerpo = document.createElement("tbody");

    data.forEach((evento, index) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${evento.nombreCliente}</td>
        <td>${evento.fecha}</td>
        <td>${evento.ubicacion}</td>
        <td>
          <button class="btn-detalle" data-id="${index}">
            Ver detalles ➜
          </button>
        </td>
      `;

      cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);
    contenedor.appendChild(tabla);

    // Evento de clic en los botones
    document.querySelectorAll(".btn-detalle").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        window.location.href = `html/detalle.html?id=${id}`;
      });
    });
  })
  .catch(err => {
    console.error("Error al cargar eventos:", err);
    document.getElementById("lista-eventos").innerHTML = "<p>Error al cargar los pedidos.</p>";
  });
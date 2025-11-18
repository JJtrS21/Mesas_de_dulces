fetch('/api/eventos')
  .then(response => response.json())
  .then(data => {
    const contenedor = document.getElementById("lista-eventos");
    contenedor.innerHTML = "";

    // Agregar ID real basado en la posición original del JSON
    const eventosConId = data.map((e, i) => ({ ...e, idReal: i }));

    // Filtrar SOLO los pendientes
    let eventosPendientes = eventosConId.filter(e => e.estado === "Pendiente");

    // Ordenar por fecha antigua → reciente
    eventosPendientes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // Crear tabla
    const tabla = document.createElement("table");
    tabla.className = "tabla-eventos";

    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Noticias</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Ubicación</th>
          <th>Detalles</th>
        </tr>
      </thead>
    `;

    const cuerpo = document.createElement("tbody");

    eventosPendientes.forEach(evento => {

      // Calcular diferencia de días
      const hoy = new Date();
      const fechaEvento = new Date(evento.fecha);
      const diffDias = Math.floor((fechaEvento - hoy) / (1000 * 60 * 60 * 24));

      let indicador = "";

      if (diffDias < 0) {
        indicador = "Fecha ya pasó ⛔";
      } else if (diffDias <= 7) {
        indicador = "Menos de una semana ⚠️";
      } else {
        indicador = "Más de una semana 😌";
      }

      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${indicador}</td>
        <td>${evento.nombreCliente}</td>
        <td>${evento.fecha}</td>
        <td>${evento.ubicacion}</td>
        <td>
          <button class="btn-detalle" data-id="${evento.idReal}">
            Ver detalles ➜
          </button>
        </td>
      `;

      cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);
    contenedor.appendChild(tabla);

    // Evento de clic usa ID real
    document.querySelectorAll(".btn-detalle").forEach(btn => {
      btn.addEventListener("click", e => {
        const idReal = e.target.dataset.id;
        window.location.href = `html/detalle.html?id=${idReal}`;
      });
    });
  })
  .catch(err => {
    console.error("Error al cargar eventos:", err);
    document.getElementById("lista-eventos").innerHTML = "<p>Error al cargar los pedidos.</p>";
  });
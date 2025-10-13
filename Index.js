fetch('Eventos.json')
  .then(response => response.json())
  .then(eventos => {
    // Ordenar por fecha (más cercanos primero)
    eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const contenedor = document.getElementById('lista-eventos');
    contenedor.innerHTML = ''; // limpiar contenido anterior

    if (eventos.length === 0) {
      contenedor.innerHTML = '<p>No hay eventos registrados.</p>';
      return;
    }

    // Crear tabla con estilos
    const tabla = document.createElement('table');
    tabla.classList.add('tabla-eventos');
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Ubicación</th>
          <th>Productos</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const cuerpo = tabla.querySelector('tbody');

    eventos.forEach(evento => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${evento["nombreCliente"]}</td>
        <td>${evento.fecha}</td>
        <td>${evento.ubicacion}</td>
        <td>${evento.productos.join(', ')}</td>
        <td>${evento.descripcion}</td>
      `;
      cuerpo.appendChild(fila);
    });

    contenedor.appendChild(tabla);
  })
  .catch(error => {
    console.error('Error al cargar los eventos:', error);
    document.getElementById('lista-eventos').innerHTML = '<p>Error al cargar los eventos.</p>';
  });
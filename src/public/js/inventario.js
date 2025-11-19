async function cargarInventario() {
  try {
    const resp = await fetch('/api/inventario');
    const productos = await resp.json();
    const tbody = document.getElementById('tablaInventario');
    tbody.innerHTML = '';

    productos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nombreProducto}</td>
        <td>${p.cantidad}</td>
        <td>$${p.precio}</td>
        <td>${p.estado}</td>
        <td>
          <input type="number" min="0" value="${p.cantidad}" style="width:80px" />
          <button>Guardar</button>
        </td>
      `;

      const input = tr.querySelector('input');
      const btn = tr.querySelector('button');

      // Acción al hacer clic en "Guardar"
      btn.addEventListener('click', async () => {
        const nuevaCantidad = parseInt(input.value, 10);

        const respUpdate = await fetch(`/api/inventario/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cantidad: nuevaCantidad })
        });

        const data = await respUpdate.json();
        console.log('Respuesta del servidor:', data);

        // Refrescar tabla después de actualizar
        cargarInventario();
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al cargar inventario:', err);
  }
}

// Cargar inventario al abrir la página
document.addEventListener('DOMContentLoaded', cargarInventario);

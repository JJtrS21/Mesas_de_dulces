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
        <td>$${p.precio}</td>
      `;

      const input = tr.querySelector('input');
      const btn = tr.querySelector('button');

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al cargar inventario:', err);
  }
}

// Cargar inventario al abrir la página
document.addEventListener('DOMContentLoaded', cargarInventario);

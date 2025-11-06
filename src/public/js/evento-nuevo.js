// ✅ Mostrar formulario sin dependencias del JSON
document.getElementById("formAgregar").style.display = "block";

// ✅ Cargar productos desde backend
fetch('/api/productos')
  .then(response => response.json())
  .then(productos => {
    const contenedor = document.getElementById('listaProductos');
    contenedor.innerHTML = '';

    productos.forEach(prod => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.innerHTML = `
        <input type="checkbox" name="producto" value="${prod.nombreProducto}">
        <span class="textoProducto">${prod.nombreProducto} — $${prod.precio} (${prod.categoria})</span>
      `;
      contenedor.appendChild(label);
    });
  })
  .catch(error => {
    console.error('Error al cargar productos:', error);
    document.getElementById('listaProductos').innerHTML = '<p>Error al cargar productos.</p>';
  });

// ✅ Guardar nuevo evento en BACKEND
document.getElementById("formAgregar").addEventListener("submit", function(event) {
  event.preventDefault();

  const productosSeleccionados = Array.from(
    document.querySelectorAll('input[name="producto"]:checked')
  ).map(el => el.value);

  fetch('/api/eventos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombreCliente: document.getElementById('nombreCliente').value,
      fecha: document.getElementById('fecha').value,
      ubicacion: document.getElementById('ubicacion').value,
      productos: productosSeleccionados,
      descripcion: document.getElementById('descripcion').value
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Servidor respondió:', data);
    alert("✅ Evento agregado correctamente");
    document.getElementById("formAgregar").reset();
  })
  .catch(err => {
    console.error('Error al guardar:', err);
    alert("❌ Error al guardar el evento");
  });
});
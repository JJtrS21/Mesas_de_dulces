const params = new URLSearchParams(window.location.search);
const idEvento = parseInt(params.get('id'));

if (isNaN(idEvento)) {
  alert("❌ No se especificó un ID de evento válido.");
  window.location.href = "index.html";
}

let datosJson = [];

// ✅ Cargar evento actual Y productos disponibles
Promise.all([
  fetch('/api/eventos').then(res => res.json()),
  fetch('/api/productos').then(res => res.json())
])
.then(([eventos, productos]) => {
  datosJson = eventos;
  const evento = datosJson[idEvento];

  if (!evento) {
    alert("❌ Evento no encontrado.");
    window.location.href = "index.html";
    return;
  }

  // Rellenar formulario
  document.getElementById('nombreCliente').value = evento.nombreCliente;
  document.getElementById('fecha').value = evento.fecha;
  document.getElementById('ubicacion').value = evento.ubicacion;
  document.getElementById('descripcion').value = evento.descripcion || '';

  // ✅ CARGAR PRODUCTOS DISPONIBLES CON CHECKBOXES
  const productosContainer = document.getElementById('listaProductos');
  productosContainer.innerHTML = ''; // Limpiar "Cargando productos..."

  productos.forEach(prod => {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.margin = '8px 0';
    
    // Verificar si este producto está seleccionado en el evento
    const isSelected = evento.productos && 
                      evento.productos.includes(prod.nombreProducto);
    
    label.innerHTML = `
      <input type="checkbox" name="producto" value="${prod.nombreProducto}" 
             ${isSelected ? 'checked' : ''}>
      <span style="margin-left: 8px;">
        ${prod.nombreProducto} — $${prod.precio} (${prod.categoria})
      </span>
    `;
    productosContainer.appendChild(label);
  });

  document.getElementById("formModificar").style.display = "block";
})
.catch(err => {
  console.error('Error al cargar datos:', err);
  alert("❌ Error al cargar los datos del evento.");
});

// ✅ Guardar cambios (este código se mantiene igual)
document.getElementById("formModificar").addEventListener("submit", (e) => {
  e.preventDefault();

  const productosSeleccionados = Array.from(
    document.querySelectorAll('input[name="producto"]:checked')
  ).map(el => el.value);
  
  const eventoActualizado = {
    nombreCliente: document.getElementById('nombreCliente').value,
    fecha: document.getElementById('fecha').value,
    ubicacion: document.getElementById('ubicacion').value,
    productos: productosSeleccionados,
    descripcion: document.getElementById('descripcion').value
  };

  fetch(`/api/eventos/${idEvento}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventoActualizado)
  })
  .then(res => res.json())
  .then(data => {
    console.log('Servidor respondió:', data);
    alert("✅ Evento actualizado correctamente.");
    window.location.href = `detalle.html?id=${idEvento}`;
  })
  .catch(err => {
    console.error('Error al guardar cambios:', err);
    alert("❌ Error al guardar el evento.");
  });
});
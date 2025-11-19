// =====================
//  MOSTRAR FORMULARIO
// =====================
document.getElementById("formAgregar").style.display = "block";


// ============================
//  CARGAR PRODUCTOS DESDE API
// ============================
fetch('/api/productos')
  .then(res => res.json())
  .then(productos => {
    const cont = document.getElementById('listaProductos');
    cont.innerHTML = '';

    productos.forEach(prod => {
      const div = document.createElement('div');
      const safeName = encodeURIComponent(prod.nombreProducto);

      div.innerHTML = `
        <label style="display:block; margin-bottom:5px;">
          ${prod.nombreProducto} — $${prod.precio} (${prod.categoria})
          <input type="number" min="0" value="0"
            class="cantidadProducto"
            data-nombre="${prod.nombreProducto}"
            data-precio="${prod.precio}"
            name="cantidad_${safeName}"
            style="width:70px; margin-left:10px;">
        </label>
      `;

      cont.appendChild(div);
    });
  })
  .catch(err => {
    console.error("Error al cargar productos:", err);
    document.getElementById('listaProductos').innerHTML =
      '<p style="color:red;">Error al cargar productos.</p>';
  });


// ===============================
//  PRECIO POR PERSONA POR RANGOS
// ===============================
function calcularPrecioPorPersona(personas) {
  if (personas >= 30 && personas <= 60) return 80;
  if (personas >= 61 && personas <= 100) return 60;
  if (personas >= 101 && personas <= 150) return 45;
  if (personas > 150) return 35;
  return 0;
}

  document.getElementById("personas").addEventListener("input", () => {
    const personas = parseInt(document.getElementById("personas").value);

    if (!isNaN(personas)) {
      const precio = calcularPrecioPorPersona(personas);
      document.getElementById("precioPersona").value = precio;
    } else {
      document.getElementById("precioPersona").value = "";
    }
});



// =====================
//  GUARDAR NUEVO EVENTO
// =====================
document.getElementById('formAgregar').addEventListener('submit', function (e) {
  e.preventDefault();

  const personas = parseInt(document.getElementById('personas').value, 10);
  const precioPersona = calcularPrecioPorPersona(personas);
  const totalPersonas = Math.ceil(precioPersona * personas);

  const inputs = Array.from(document.getElementsByClassName('cantidadProducto'));
  const productosSeleccionados = [];
  let totalProductos = 0;

  inputs.forEach(inp => {
    const cant = parseInt(inp.value, 10) || 0;
    if (cant > 0) {
      const nombre = inp.dataset.nombre;
      const precioUnit = parseFloat(inp.dataset.precio);
      const subtotal = Math.ceil(precioUnit * cant);

      productosSeleccionados.push({
        nombre,
        cantidad: cant,
        precioUnitario: precioUnit,
        subtotal
      });

      totalProductos += subtotal;
    }
  });

  const totalEvento = Math.ceil(totalProductos + totalPersonas);

  // OBJETO FINAL A ENVIAR AL BACKEND
  const nuevoEvento = {
    nombreCliente: document.getElementById('nombreCliente').value,
    estado: document.getElementById('estado').value,      // ← ✔ SE AGREGA ESTADO
    fecha: document.getElementById('fecha').value,
    ubicacion: document.getElementById('ubicacion').value,
    personas,
    precioPersona,
    productos: productosSeleccionados,
    totalProductos,
    totalPersonas,
    totalEvento,
    descripcion: document.getElementById('descripcion').value
  };

  // ==========================
  //  GUARDAR EN BACKEND
  // ==========================
  fetch('/api/eventos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoEvento)
  })
    .then(res => res.json())
    .then(() => {
      alert("✅ Evento guardado correctamente");
      document.getElementById('formAgregar').reset();
    })
    .catch(err => {
      console.error("Error al guardar el evento:", err);
      alert("❌ Error al guardar el evento");
    });
});
const params = new URLSearchParams(window.location.search);
const idEvento = parseInt(params.get('id'));

if (isNaN(idEvento)) {
  alert("❌ No se especificó un ID de evento válido.");
  window.location.href = "/html/index.html";
}

let datosJson = [];

// ==============================
//  CARGAR EVENTO + PRODUCTOS
// ==============================
Promise.all([
  fetch('/api/eventos').then(res => res.json()),
  fetch('/api/productos').then(res => res.json())
])
.then(([eventos, productos]) => {

  datosJson = eventos;
  const evento = datosJson[idEvento];

  if (!evento) {
    alert("❌ Evento no encontrado.");
    window.location.href = "/html/index.html";
    return;
  }

  // ===============================
  //     RELLENAR CAMPOS BÁSICOS
  // ===============================
  document.getElementById('nombreCliente').value = evento.nombreCliente;
  document.getElementById('fecha').value = evento.fecha;
  document.getElementById('ubicacion').value = evento.ubicacion;
  document.getElementById('estado').value = evento.estado; 
  document.getElementById('personas').value = evento.personas;
  document.getElementById('precioPersona').value = evento.precioPersona;
  document.getElementById('descripcion').value = evento.descripcion || '';

  // Convertir productos guardados a mapa: { nombre → cantidad }
  const mapaCantidades = {};
  if (Array.isArray(evento.productos)) {
    evento.productos.forEach(p => {
      mapaCantidades[p.nombre] = p.cantidad;
    });
  }

  const cont = document.getElementById("listaProductos");
  cont.innerHTML = "";

  // ===============================
  //   GENERAR LISTA DE PRODUCTOS
  // ===============================
  productos.forEach(prod => {
    const cantidad = mapaCantidades[prod.nombreProducto] || 0;

    const fila = document.createElement("div");
    fila.classList.add("prod-item");

    fila.innerHTML = `
      <label style="display:block; margin-bottom: 8px;">
        <input type="checkbox" class="checkProd" data-nombre="${prod.nombreProducto}"
              ${cantidad > 0 ? "checked" : ""}>

        ${prod.nombreProducto} — $${prod.precio} (${prod.categoria})

        <input type="number" min="1"
              class="cantProd"
              data-nombre="${prod.nombreProducto}"
              value="${cantidad > 0 ? cantidad : ''}"
              ${cantidad > 0 ? "" : "disabled"}
              style="width:70px; margin-left:10px;">
      </label>
    `;

    cont.appendChild(fila);
  });

  // ===============================
  //   CÁLCULO PRECIO POR PERSONA
  // ===============================
  function calcularPrecioPorPersona(personas) {
    if (personas >= 30 && personas <= 60) return 80;
    if (personas >= 61 && personas <= 100) return 60;
    if (personas >= 101 && personas <= 150) return 45;
    if (personas > 150) return 35;
    return "";
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

  // ===============================
  //  CHECKBOX HABILITA CANTIDAD
  // ===============================
  document.querySelectorAll(".checkProd").forEach(ch => {
    ch.addEventListener("change", e => {
      const nombre = e.target.dataset.nombre;
      const inputCantidad = document.querySelector(
        `.cantProd[data-nombre="${nombre}"]`
      );

      if (e.target.checked) {
        inputCantidad.disabled = false;
        if (!inputCantidad.value) inputCantidad.value = 1;
      } else {
        inputCantidad.disabled = true;
        inputCantidad.value = "";
      }
    });
  });

  document.getElementById("formModificar").style.display = "block";

})
.catch(err => {
  console.error("Error al cargar los datos del evento:", err);
  alert("❌ Error al cargar los datos del servidor.");
});


// ===============================
//        GUARDAR CAMBIOS
// ===============================
document.getElementById("formModificar").addEventListener("submit", e => {
  e.preventDefault();

  const productosActualizados = [];

  document.querySelectorAll(".checkProd").forEach(ch => {
    if (ch.checked) {
      const nombre = ch.dataset.nombre;
      const inp = document.querySelector(
        `.cantProd[data-nombre="${nombre}"]`
      );

      const cantidad = parseInt(inp.value);

      if (cantidad > 0) {
        productosActualizados.push({
          nombre,
          cantidad
        });
      }
    }
  });

  const eventoActualizado = {
    nombreCliente: document.getElementById('nombreCliente').value,
    fecha: document.getElementById('fecha').value,
    ubicacion: document.getElementById('ubicacion').value,
    estado: document.getElementById('estado').value,  // ✔ AGREGADO
    personas: parseInt(document.getElementById('personas').value),
    precioPersona: parseInt(document.getElementById('precioPersona').value),
    productos: productosActualizados,
    descripcion: document.getElementById('descripcion').value
  };

  fetch(`/api/eventos/${idEvento}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventoActualizado)
  })
  .then(res => res.json())
  .then(data => {
    alert("✅ Evento actualizado correctamente.");
    window.location.href = `detalle.html?id=${idEvento}`;
  })
  .catch(err => {
    console.error("Error al guardar:", err);
    alert("❌ Error al guardar los cambios.");
  });
});

